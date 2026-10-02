import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import mammoth from "mammoth";

export const maxDuration = 60; // Allow up to 60s for AI synthesis
export const dynamic = "force-dynamic";

interface OptionSchema {
  id: "a" | "b" | "c" | "d";
  text: string;
  is_correct: boolean;
  color?: string;
  shape?: string;
}

interface QuestionSchema {
  question_text: string;
  time_limit: number;
  points: number;
  options: OptionSchema[];
}

interface QuizAiResponse {
  title: string;
  description: string;
  category: "General" | "Science" | "Geography" | "Technology" | "History" | "Pop Culture";
  questions: QuestionSchema[];
}

const SHAPE_CONFIG = [
  { id: "a", color: "red", shape: "triangle" },
  { id: "b", color: "blue", shape: "diamond" },
  { id: "c", color: "yellow", shape: "circle" },
  { id: "d", color: "green", shape: "square" },
] as const;

// Helper: Extract text from PPTX files
async function extractPptxText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

  let fullText = "";
  for (const slidePath of slideFiles) {
    const slideXml = await zip.files[slidePath].async("text");
    const matches = slideXml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g);
    if (matches) {
      const slideText = matches
        .map((m) => m.replace(/<[^>]+>/g, "").trim())
        .filter(Boolean)
        .join(" ");
      if (slideText) {
        const slideNum = slidePath.replace(/\D/g, "");
        fullText += `[Slide ${slideNum}]: ${slideText}\n`;
      }
    }
  }
  return fullText.trim();
}

// Helper: Extract text from DOCX files
async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in server environment." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const prompt = (formData.get("prompt") as string) || "";
    const language = (formData.get("language") as string) || "en";
    const countParam = (formData.get("count") as string) || "auto";
    const targetCountNum = parseInt(countParam, 10);
    const hasSpecificCount = !isNaN(targetCountNum) && targetCountNum > 0 && countParam !== "auto" && countParam !== "max";

    const file = formData.get("file") as File | null;

    let extractedText = "";
    let inlineDataPart: { inlineData: { mimeType: string; data: string } } | null = null;
    let fileInfoNote = "";

    if (file && file.size > 0) {
      const fileName = file.name.toLowerCase();
      const mimeType = file.type || "";
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fileInfoNote = `Uploaded document: "${file.name}"`;

      try {
        if (fileName.endsWith(".docx")) {
          extractedText = await extractDocxText(buffer);
        } else if (fileName.endsWith(".pptx")) {
          extractedText = await extractPptxText(buffer);
        } else if (fileName.endsWith(".pdf") || mimeType === "application/pdf") {
          // Send PDF directly to Gemini multimodal engine
          inlineDataPart = {
            inlineData: {
              mimeType: "application/pdf",
              data: buffer.toString("base64"),
            },
          };
        } else if (
          mimeType.startsWith("image/") ||
          /\.(png|jpe?g|webp|gif)$/i.test(fileName)
        ) {
          // Send image directly to Gemini vision engine
          inlineDataPart = {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: buffer.toString("base64"),
            },
          };
        } else if (
          fileName.endsWith(".txt") ||
          fileName.endsWith(".md") ||
          fileName.endsWith(".csv") ||
          mimeType.startsWith("text/")
        ) {
          extractedText = buffer.toString("utf-8");
        } else {
          // Fallback: try raw text decoding
          extractedText = buffer.toString("utf-8").replace(/[^\x20-\x7E\r\n\t]/g, " ");
        }
      } catch (extractErr) {
        console.warn("Document parser fallback to raw text extraction:", extractErr);
        extractedText = buffer.toString("utf-8").replace(/[^\x20-\x7E\r\n\t]/g, " ");
      }
    }

    if (!prompt.trim() && !extractedText.trim() && !inlineDataPart) {
      return NextResponse.json(
        { error: "Please provide either a prompt/topic or upload a study file (Word, PowerPoint, PDF, or Image)." },
        { status: 400 }
      );
    }

    // Dynamic question count instructions based on user preference or document depth
    let countInstruction = "";
    if (hasSpecificCount) {
      countInstruction = `Generate exactly ${targetCountNum} engaging, competitive, Kahoot-style multiple choice questions based on the provided material.`;
    } else if (countParam === "max") {
      countInstruction = `MAXIMUM COMPREHENSIVE COVERAGE:
- Generate as many distinct, high-quality multiple choice questions as possible (up to 20-25 questions) to test complete mastery of the entire document or topic.
- Do NOT stop at 4 or 5 questions. Read every paragraph, slide, and concept thoroughly and create questions for each distinct topic, event, definition, formula, and finding.`;
    } else {
      // Auto / Adaptive mode (default)
      countInstruction = `ADAPTIVE DYNAMIC QUESTION COUNT (CRITICAL REQUIREMENT):
- DO NOT ALWAYS GENERATE 4 OR 5 QUESTIONS. Scale the question count proportionally to the length, richness, and depth of the provided material.
- If the uploaded document, PDF, Word doc, PowerPoint presentation, or topic contains substantial, rich information: generate between 10 and 20 comprehensive questions covering all major sections, definitions, mechanisms, and nuances.
- If the material is medium-length (several slides, a couple of pages or paragraphs): generate 8 to 14 questions.
- If the material is brief (a single concept, brief summary, or single diagram): generate 5 to 8 questions.
- Every important concept, principle, and key detail in the source material should have its own dedicated question.
- Do NOT skip important information. Ensure questions are diverse, challenging, and non-repetitive.`;
    }

    // Strict language instructions that will NEVER be overridden by prompt language or source doc language
    let langInstruction = "";
    let langLabel = "";
    if (language === "al") {
      langLabel = "SHQIP (ALBANIAN)";
      langInstruction = `CRITICAL MANDATORY LANGUAGE: SHQIP (ALBANIAN).
- Every single question ("question_text"), all 4 options ("text"), the "title", and the "description" MUST BE WRITTEN IN ALBANIAN (Gjuhën Shqipe).
- EVEN IF the user prompt, topic, uploaded document, slides, or PDF are written in English or another language, YOU MUST TRANSLATE the concepts and output ALL questions and options completely in natural, fluent ALBANIAN.
- ABSOLUTELY DO NOT output any English question texts or English options.`;
    } else if (language === "mk") {
      langLabel = "МАКЕДОНСКИ (MACEDONIAN)";
      langInstruction = `CRITICAL MANDATORY LANGUAGE: МАКЕДОНСКИ (MACEDONIAN).
- Every single question ("question_text"), all 4 options ("text"), the "title", and the "description" MUST BE WRITTEN IN MACEDONIAN using Cyrillic script.
- EVEN IF the source material or user prompt is in English, YOU MUST TRANSLATE and output all questions and options in Macedonian.
- ABSOLUTELY DO NOT output any English questions when Macedonian is requested.`;
    } else {
      langLabel = "ENGLISH";
      langInstruction = `CRITICAL MANDATORY LANGUAGE: ENGLISH.
- The title, description, every question ("question_text"), and all 4 options ("text") MUST BE WRITTEN IN ENGLISH.
- If the source material is in another language, translate it and output completely in English.`;
    }

    const systemPrompt = `You are Quizemia's master educational quiz generator.

${countInstruction}

${langInstruction}

RULES:
1. Every question must have EXACTLY 4 answer options with IDs "a", "b", "c", "d".
2. EXACTLY ONE option per question must have "is_correct": true, and the other 3 must be "is_correct": false.
3. CRITICAL SHUFFLING: The correct answer MUST be randomly and unpredictably placed among "a", "b", "c", and "d". DO NOT always put the correct answer in the same position.
4. Distractors (wrong answers) must be plausible, educational, and realistic.
5. Time limit for each question should be 15, 20, or 30 seconds (integer).
6. Points should be 1000 for each question.
7. Provide an engaging quiz "title", a concise "description", and choose the best matching "category" from: "General", "Science", "Geography", "Technology", "History", "Pop Culture".
8. Return ONLY valid JSON strictly adhering to the schema below. No markdown formatting, no commentary.

SCHEMA:
{
  "title": "string",
  "description": "string",
  "category": "General | Science | Geography | Technology | History | Pop Culture",
  "questions": [
    {
      "question_text": "string",
      "time_limit": 20,
      "points": 1000,
      "options": [
        { "id": "a", "text": "string", "is_correct": false },
        { "id": "b", "text": "string", "is_correct": true },
        { "id": "c", "text": "string", "is_correct": false },
        { "id": "d", "text": "string", "is_correct": false }
      ]
    }
  ]
}`;

    let userContentText = "";
    if (prompt.trim()) {
      userContentText += `Topic / Instructions from User:\n${prompt.trim()}\n\n`;
    }
    if (fileInfoNote) {
      userContentText += `${fileInfoNote}\n`;
    }
    if (extractedText.trim()) {
      // Limit to 50,000 characters to allow deep document synthesis
      userContentText += `Extracted Content from Document:\n${extractedText.slice(0, 50000)}\n\n`;
    }
    if (inlineDataPart) {
      userContentText += `Analyze the attached file/image visual content thoroughly and generate the quiz covering all details.\n`;
    }

    userContentText += `\n[TARGET GENERATION LANGUAGE: ${langLabel}]\nCRITICAL: Regardless of whether the user instructions or extracted document above are written in English or any other language, you MUST TRANSLATE and generate every single question, all options, title, and description strictly in ${langLabel}.\n`;

    // Build parts for Gemini API
    const parts: any[] = [
      { text: systemPrompt },
      { text: userContentText },
      { text: `FINAL MANDATORY DIRECTIVE: Output the entire quiz strictly in ${langLabel}. All question_text and all option texts MUST be in ${langLabel}.` }
    ];
    if (inlineDataPart) {
      parts.push(inlineDataPart);
    }

    // High-availability candidate models - prioritize fast, live models with instant fallbacks
    const CANDIDATE_MODELS = [
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash-lite",
      "gemini-pro-latest",
    ];

    let rawText = "";
    let lastError = "";

    for (const model of CANDIDATE_MODELS) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            rawText = candidateText;
            break; // Success!
          }
        } else {
          lastError = `Model ${model} returned ${geminiResponse.status}: ${await geminiResponse.text()}`;
          console.warn(lastError);
        }
      } catch (err: any) {
        lastError = `Model ${model} network error: ${err.message}`;
        console.warn(lastError);
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { error: `Gemini generation temporarily unavailable. ${lastError}` },
        { status: 502 }
      );
    }

    let parsed: QuizAiResponse;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // Try extracting json substring if wrapped in markdown
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse Gemini output as JSON.");
      }
    }

    // Normalize, randomly shuffle options, and enforce Kahoot shapes & colors
    const normalizedQuestions = (parsed.questions || []).map((q, idx) => {
      let rawOptions = (q.options || []).slice(0, 4);

      // Ensure at least one correct option exists
      if (!rawOptions.some((o) => o.is_correct) && rawOptions.length > 0) {
        const randIdx = Math.floor(Math.random() * rawOptions.length);
        rawOptions[randIdx].is_correct = true;
      }

      // Fisher-Yates shuffle the 4 options so the correct answer is randomized across positions
      for (let i = rawOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
      }

      const normalizedOptions = rawOptions.map((opt, optIdx) => {
        const shapeMeta = SHAPE_CONFIG[optIdx] || SHAPE_CONFIG[0];
        return {
          id: shapeMeta.id,
          text: opt.text || `Option ${shapeMeta.id.toUpperCase()}`,
          is_correct: Boolean(opt.is_correct),
          color: shapeMeta.color,
          shape: shapeMeta.shape,
        };
      });

      return {
        question_text: q.question_text || `Question ${idx + 1}`,
        time_limit: q.time_limit || 20,
        points: q.points || 1000,
        order_index: idx,
        options: normalizedOptions,
      };
    });

    return NextResponse.json({
      success: true,
      title: parsed.title || "AI Generated Challenge",
      description: parsed.description || "Created with Quizemia AI.",
      category: parsed.category || "General",
      language: language,
      questions: normalizedQuestions,
    });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate quiz with AI." },
      { status: 500 }
    );
  }
}
