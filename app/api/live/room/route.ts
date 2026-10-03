import { NextRequest, NextResponse } from "next/server";
import {
  createLiveRoom,
  getLiveRoom,
  joinLiveRoom,
  submitPlayerAnswer,
  advanceRoomPhase,
  sanitizeRoomForPlayer,
} from "@/lib/liveGame";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");
    const role = searchParams.get("role") || "player";
    const playerId = searchParams.get("playerId") || "";

    if (!pin) {
      return NextResponse.json({ success: false, error: "Game PIN is required." }, { status: 400 });
    }

    const room = getLiveRoom(pin);
    if (!room) {
      return NextResponse.json({ success: false, error: "Game room not found." }, { status: 404 });
    }

    if (role === "host") {
      return NextResponse.json({
        success: true,
        room: {
          pin: room.pin,
          status: room.status,
          currentQuestionIdx: room.currentQuestionIdx,
          totalQuestions: room.quiz.questions?.length || 0,
          quizTitle: room.quiz.title,
          category: room.quiz.category,
          questionStartTime: room.questionStartTime,
          questionTimeLimit: room.questionTimeLimit,
          currentQuestion: room.quiz.questions?.[room.currentQuestionIdx],
          players: room.players,
          answerCounts: room.answerCounts,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      });
    }

    // Player view
    const safeData = sanitizeRoomForPlayer(room, playerId);
    return NextResponse.json({ success: true, room: safeData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pin } = body;

    if (action === "create") {
      const { quiz, hostId, hostNickname } = body;
      if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return NextResponse.json(
          { success: false, error: "A quiz with at least one question is required." },
          { status: 400 }
        );
      }

      const room = createLiveRoom(quiz, hostId || "host", hostNickname || "Host");
      return NextResponse.json({ success: true, pin: room.pin, room });
    }

    if (!pin) {
      return NextResponse.json({ success: false, error: "Game PIN is required." }, { status: 400 });
    }

    if (action === "join") {
      const { player } = body;
      if (!player || !player.nickname?.trim()) {
        return NextResponse.json(
          { success: false, error: "A valid nickname is required." },
          { status: 400 }
        );
      }

      const result = joinLiveRoom(pin, {
        id: player.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        nickname: player.nickname.trim(),
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      const safeData = sanitizeRoomForPlayer(result.room!, player.id);
      return NextResponse.json({ success: true, room: safeData });
    }

    if (action === "answer") {
      const { playerId, optionId } = body;
      if (!playerId || !optionId) {
        return NextResponse.json(
          { success: false, error: "Player ID and Option ID are required." },
          { status: 400 }
        );
      }

      const result = submitPlayerAnswer(pin, playerId, optionId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        pointsEarned: result.pointsEarned,
        isCorrect: result.isCorrect,
      });
    }

    if (action === "advance") {
      const { step } = body;
      const result = advanceRoomPhase(pin, step);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, room: result.room });
    }

    return NextResponse.json({ success: false, error: "Unsupported action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
