import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Question } from "@/types/quiz";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "public";
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (type === "single" && id) {
      const { data, error } = await supabaseAdmin
        .from("quizzes")
        .select("*, questions(*)")
        .eq("id", id)
        .single();

      if (error || !data) {
        return NextResponse.json({ quiz: null });
      }

      if (data.questions && Array.isArray(data.questions)) {
        data.questions.sort((a: Question, b: Question) => a.order_index - b.order_index);
      }

      return NextResponse.json({ quiz: data });
    }

    if (type === "user" && userId) {
      const { data, error } = await supabaseAdmin
        .from("quizzes")
        .select("*, questions(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error || !data) {
        return NextResponse.json({ quizzes: [] });
      }

      return NextResponse.json({ quizzes: data });
    }

    // Default: fetch public quizzes
    const { data, error } = await supabaseAdmin
      .from("quizzes")
      .select("*, questions(*)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return NextResponse.json({ quizzes: [] });
    }

    return NextResponse.json({ quizzes: data });
  } catch (err: any) {
    // Gracefully return empty list if table not created yet in Supabase
    return NextResponse.json({ quizzes: [], error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quiz, questions } = body;

    if (!quiz || !quiz.id) {
      return NextResponse.json({ error: "Missing quiz payload" }, { status: 400 });
    }

    const baseInsertPayload = {
      id: quiz.id,
      user_id: quiz.user_id,
      creator_email: quiz.creator_email || null,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      language: quiz.language || "en",
      is_public: quiz.is_public,
      cover_image: quiz.cover_image,
      play_count: 0,
    };

    let { error: quizError } = await supabaseAdmin
      .from("quizzes")
      .insert([baseInsertPayload]);

    if (quizError && (quizError.message?.includes("language") || quizError.code === "PGRST204")) {
      const { language: _lang, ...payloadWithoutLang } = baseInsertPayload;
      const retryResult = await supabaseAdmin
        .from("quizzes")
        .insert([payloadWithoutLang]);
      quizError = retryResult.error;
    }

    if (!quizError && Array.isArray(questions) && questions.length > 0) {
      const questionsToInsert = questions.map((q: Question, idx: number) => ({
        id: q.id || crypto.randomUUID(),
        quiz_id: quiz.id,
        question_text: q.question_text,
        media_url: q.media_url || null,
        time_limit: q.time_limit || 20,
        points: q.points || 1000,
        order_index: typeof q.order_index === "number" ? q.order_index : idx,
        options: q.options,
      }));

      await supabaseAdmin.from("questions").insert(questionsToInsert);
    }

    if (quizError) {
      // Table may not be created in Supabase yet, return soft success with savedRemotely: false
      return NextResponse.json({
        success: true,
        savedRemotely: false,
        warning: quizError.message,
      });
    }

    return NextResponse.json({ success: true, savedRemotely: true });
  } catch (err: any) {
    return NextResponse.json({ success: true, savedRemotely: false, warning: err.message });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing quiz id" }, { status: 400 });
    }

    await supabaseAdmin.from("quizzes").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: true, warning: err.message });
  }
}
