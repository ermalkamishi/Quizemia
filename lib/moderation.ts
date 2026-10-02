/**
 * Quizemia Content Moderation & Safety Engine
 * 
 * Protects the platform from vulgar language, profanity, pornography,
 * sexual content, blood/gore, and graphic violence across English and Albanian.
 */

export interface ModerationResult {
  isSafe: boolean;
  flaggedWord?: string;
  category?: "sexual" | "profanity" | "violence" | "general";
  messageEn?: string;
  messageAl?: string;
}

// Banned words & vulgar terms categorized for clear moderation reporting
// Uses word boundary checking to avoid false positives (e.g., "assessment", "analysis", "cucumber", "document")
const SEXUAL_AND_PORN_TERMS = [
  "porno",
  "porn",
  "pornography",
  "pornografi",
  "xxx",
  "piqka",
  "peciv",
  "rrot kari",
  "rot kari",
  "muti",
  "nsfw",
  "hentai",
  "erotic",
  "erotik",
  "sex",
  "seks",
  "sexual",
  "seksual",
  "seksin",
  "intercourse",
  "marredhenie seksuale",
  "marredhënie seksuale",
  "penis",
  "vagina",
  "kar",
  "kari",
  "pidh",
  "pidhi",
  "pussy",
  "dick",
  "cock",
  "boobs",
  "tits",
  "byth",
  "bytha",
  "bith",
  "dildo",
  "blowjob",
  "handjob",
  "masturbat",
  "masturbation",
  "masturbim",
  "orgasm",
  "orgazem",
  "orgazëm",
  "ejaculat",
  "cumshot",
  "nude",
  "nudity",
  "lakuriq",
  "lakuriqesi",
  "lakuriqësi",
  "prostitut",
  "prostitute",
  "prostituta",
  "escort",
  "stripper",
  "piqke"
];

const VIOLENCE_AND_BLOOD_TERMS = [
  "blood",
  "gjak",
  "gore",
  "bloodshed",
  "gjakderdhje",
  "suicide",
  "vetevrasje",
  "vetëvrasje",
  "kill yourself",
  "vrit veten",
  "behead",
  "decapitat",
  "copëtim",
  "copetim",
  "mutilat",
  "masaker",
  "masakër",
  "massacre",
  "torture",
  "torturë",
  "snuff",
];

const PROFANITY_AND_SWEAR_TERMS = [
  // English
  "fuck",
  "fucking",
  "fucker",
  "motherfucker",
  "shit",
  "bullshit",
  "bitch",
  "bitches",
  "asshole",
  "bastard",
  "cunt",
  "whore",
  "slut",
  "faggot",
  "nigger",
  "nigga",
  "retard",
  // Albanian
  "qij",
  "qift",
  "qifsha",
  "qihesh",
  "qire",
  "motren",
  "motrën",
  "motres",
  "motrës",
  "robt",
  "robve",
  "rrot kari",
  "rrote kari",
  "mut",
  "muti",
  "kurv",
  "kurva",
  "kurve",
  "pede",
  "peder",
  "pederast",
  "kloshar",
  "pedofil",
  "pedofili",
  "dhunim",
  "perdhunim",
  "përdhunim",
];

// Helper: Normalize leetspeak and symbols
function normalizeText(input: string): string {
  if (!input) return "";
  let text = input.toLowerCase();

  // Replace common diacritics
  text = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c");

  // Replace leetspeak characters
  text = text
    .replace(/@/g, "a")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/!/g, "i")
    .replace(/\$/g, "s")
    .replace(/5/g, "s")
    .replace(/3/g, "e")
    .replace(/\+/g, "t");

  return text;
}

// Escape special regex chars
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Checks a single text string against all safety lists.
 * Uses word-boundary matching to prevent false positives on valid educational words.
 */
export function checkProfanity(text: string): ModerationResult {
  if (!text || typeof text !== "string") {
    return { isSafe: true };
  }

  const normalized = normalizeText(text);

  // 1. Check Sexual / Pornographic content
  for (const term of SEXUAL_AND_PORN_TERMS) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}([^a-z0-9]|$)`, "i");
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        flaggedWord: term,
        category: "sexual",
        messageEn: `Content contains inappropriate sexual or explicit terms.`,
        messageAl: `Përmbajtja përmban terma të papërshtatshëm seksualë ose eksplicitë.`,
      };
    }
  }

  // 2. Check Violence / Blood / Gore content
  for (const term of VIOLENCE_AND_BLOOD_TERMS) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}([^a-z0-9]|$)`, "i");
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        flaggedWord: term,
        category: "violence",
        messageEn: `Content contains prohibited terms related to violence, blood, or gore.`,
        messageAl: `Përmbajtja përmban terma të ndaluar të dhunës, gjakut ose lëndimit.`,
      };
    }
  }

  // 3. Check Swear Words / Profanity
  for (const term of PROFANITY_AND_SWEAR_TERMS) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}([^a-z0-9]|$)`, "i");
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        flaggedWord: term,
        category: "profanity",
        messageEn: `Content contains vulgar language or swear words.`,
        messageAl: `Përmbajtja përmban fjalor fyes ose fjalë të papërshtatshme.`,
      };
    }
  }

  return { isSafe: true };
}

/**
 * Validates an entire quiz (title, description, all questions, and all options)
 */
export function validateQuizContent(
  title?: string,
  description?: string,
  questions?: Array<{
    question_text?: string;
    options?: Array<{ text?: string }>;
  }>
): ModerationResult {
  // Check Title
  if (title) {
    const check = checkProfanity(title);
    if (!check.isSafe) {
      return {
        ...check,
        messageEn: `Quiz Title: ${check.messageEn}`,
        messageAl: `Titulli i Kuizit: ${check.messageAl}`,
      };
    }
  }

  // Check Description
  if (description) {
    const check = checkProfanity(description);
    if (!check.isSafe) {
      return {
        ...check,
        messageEn: `Quiz Description: ${check.messageEn}`,
        messageAl: `Përshkrimi i Kuizit: ${check.messageAl}`,
      };
    }
  }

  // Check Questions & Options
  if (Array.isArray(questions)) {
    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const q = questions[qIdx];
      if (q.question_text) {
        const check = checkProfanity(q.question_text);
        if (!check.isSafe) {
          return {
            ...check,
            messageEn: `Question #${qIdx + 1}: ${check.messageEn}`,
            messageAl: `Pyetja #${qIdx + 1}: ${check.messageAl}`,
          };
        }
      }

      if (Array.isArray(q.options)) {
        for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
          const opt = q.options[optIdx];
          if (opt?.text) {
            const check = checkProfanity(opt.text);
            if (!check.isSafe) {
              return {
                ...check,
                messageEn: `Question #${qIdx + 1} (Choice ${optIdx + 1}): ${check.messageEn}`,
                messageAl: `Pyetja #${qIdx + 1} (Opsioni ${optIdx + 1}): ${check.messageAl}`,
              };
            }
          }
        }
      }
    }
  }

  return { isSafe: true };
}
