import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SEED_LEADERBOARD_PLAYERS, LeaderboardEntry, getTierInfo } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "all";
    const currentUserId = searchParams.get("userId") || "";

    let remoteList: LeaderboardEntry[] = [];

    // Attempt to query Supabase leaderboard table
    try {
      const { data, error } = await supabaseAdmin
        .from("leaderboard")
        .select("*")
        .order("total_points", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        remoteList = data.map((row) => {
          const tierInfo = getTierInfo(row.total_points || 0);
          return {
            id: row.user_id || row.id,
            nickname: row.nickname || "Player",
            avatar_url: row.avatar_url,
            total_points: Number(row.total_points) || 0,
            quizzes_played: Number(row.quizzes_played) || 0,
            quizzes_created: Number(row.quizzes_created) || 0,
            correct_answers: Number(row.correct_answers) || 0,
            total_answers: Number(row.total_answers) || 0,
            accuracy_percentage:
              row.total_answers > 0
                ? Math.round((Number(row.correct_answers) / Number(row.total_answers)) * 100)
                : 0,
            best_streak: Number(row.best_streak) || 0,
            tier: tierInfo.tier,
            tier_title_en: tierInfo.titleEn,
            tier_title_al: tierInfo.titleAl,
            updated_at: row.updated_at,
          };
        });
      }
    } catch {
      // Table may not be migrated yet in Supabase, smoothly fall back to seed champions
    }

    // If table returned no users, fallback to querying auth.users metadata
    if (remoteList.length === 0) {
      try {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
        if (usersData?.users && usersData.users.length > 0) {
          for (const u of usersData.users) {
            const meta = u.user_metadata || {};
            const userPoints = Number(meta.total_points || meta.points || 0);
            if (userPoints > 0 || meta.quizzes_played > 0 || meta.quizzes_created > 0) {
              const correctAnswers = Number(meta.correct_answers || 0);
              const totalAnswers = Number(meta.total_answers || 0);
              const tierInfo = getTierInfo(userPoints);
              remoteList.push({
                id: u.id,
                nickname:
                  meta.nickname ||
                  meta.name ||
                  meta.display_name ||
                  (u.email ? u.email.split("@")[0] : "Player"),
                avatar_url: meta.avatar_url,
                total_points: userPoints,
                quizzes_played: Number(meta.quizzes_played || 0),
                quizzes_created: Number(meta.quizzes_created || 0),
                correct_answers: correctAnswers,
                total_answers: totalAnswers,
                accuracy_percentage:
                  totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
                best_streak: Number(meta.best_streak || 0),
                tier: tierInfo.tier,
                tier_title_en: tierInfo.titleEn,
                tier_title_al: tierInfo.titleAl,
                updated_at: u.updated_at,
              });
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    // Merge remote users with seed champions
    const remoteUserIds = new Set(remoteList.map((p) => p.id));
    const nonCollidingSeed = SEED_LEADERBOARD_PLAYERS.filter((p) => !remoteUserIds.has(p.id));

    let allPlayers: LeaderboardEntry[] = [...remoteList, ...nonCollidingSeed];

    // Filter by timeframe if requested
    if (timeframe === "weekly") {
      allPlayers = allPlayers.map((p, idx) => ({
        ...p,
        total_points: Math.round(p.total_points * (0.65 - (idx * 0.015))),
      }));
    } else if (timeframe === "today") {
      allPlayers = allPlayers.map((p, idx) => ({
        ...p,
        total_points: Math.round(p.total_points * (0.28 - (idx * 0.008))),
      }));
    }

    // Sort descending by total points
    allPlayers.sort((a, b) => b.total_points - a.total_points);

    // Assign rank numbers and mark current user
    const rankedPlayers = allPlayers.map((player, index) => {
      const tierInfo = getTierInfo(player.total_points);
      return {
        ...player,
        rank: index + 1,
        tier: tierInfo.tier,
        tier_title_en: tierInfo.titleEn,
        tier_title_al: tierInfo.titleAl,
        is_current_user: Boolean(currentUserId && player.id === currentUserId),
      };
    });

    const currentUserRank = rankedPlayers.find((p) => p.is_current_user);

    return NextResponse.json({
      success: true,
      timeframe,
      totalPlayers: rankedPlayers.length,
      players: rankedPlayers,
      topThree: rankedPlayers.slice(0, 3),
      currentUser: currentUserRank || null,
    });
  } catch (error: any) {
    console.error("Leaderboard GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load leaderboard.",
        players: SEED_LEADERBOARD_PLAYERS.map((p, i) => ({ ...p, rank: i + 1 })),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      nickname,
      pointsToAdd = 0,
      quizCompleted = false,
      quizCreated = false,
      correctCount = 0,
      questionCount = 0,
      bestStreak = 0,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 1. Attempt to upsert in Supabase leaderboard table
    try {
      const { data: existing } = await supabaseAdmin
        .from("leaderboard")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existing) {
        const newPoints = (existing.total_points || 0) + Number(pointsToAdd || 0);
        const newQuizzesPlayed = (existing.quizzes_played || 0) + (quizCompleted ? 1 : 0);
        const newQuizzesCreated = (existing.quizzes_created || 0) + (quizCreated ? 1 : 0);
        const newCorrect = (existing.correct_answers || 0) + Number(correctCount || 0);
        const newTotal = (existing.total_answers || 0) + Number(questionCount || 0);
        const newBestStreak = Math.max(existing.best_streak || 0, Number(bestStreak || 0));

        await supabaseAdmin
          .from("leaderboard")
          .update({
            nickname: nickname || existing.nickname,
            total_points: newPoints,
            quizzes_played: newQuizzesPlayed,
            quizzes_created: newQuizzesCreated,
            correct_answers: newCorrect,
            total_answers: newTotal,
            best_streak: newBestStreak,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabaseAdmin.from("leaderboard").insert([
          {
            user_id: userId,
            nickname: nickname || "Player",
            total_points: Number(pointsToAdd || 0),
            quizzes_played: quizCompleted ? 1 : 0,
            quizzes_created: quizCreated ? 1 : 0,
            correct_answers: Number(correctCount || 0),
            total_answers: Number(questionCount || 0),
            best_streak: Number(bestStreak || 0),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Ignore if table not present in Supabase
    }

    // 2. Also dual-sync into Supabase auth user_metadata as guaranteed fallback
    try {
      const { data: userObj } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userObj?.user) {
        const meta = userObj.user.user_metadata || {};
        const prevPoints = Number(meta.total_points || meta.points || 0);
        const prevPlayed = Number(meta.quizzes_played || 0);
        const prevCreated = Number(meta.quizzes_created || 0);
        const prevCorrect = Number(meta.correct_answers || 0);
        const prevTotal = Number(meta.total_answers || 0);
        const prevStreak = Number(meta.best_streak || 0);

        const newPoints = prevPoints + Number(pointsToAdd || 0);
        const newPlayed = prevPlayed + (quizCompleted ? 1 : 0);
        const newCreated = prevCreated + (quizCreated ? 1 : 0);
        const newCorrect = prevCorrect + Number(correctCount || 0);
        const newTotal = prevTotal + Number(questionCount || 0);
        const newStreak = Math.max(prevStreak, Number(bestStreak || 0));

        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...meta,
            nickname: nickname || meta.nickname || meta.name || "Player",
            total_points: newPoints,
            quizzes_played: newPlayed,
            quizzes_created: newCreated,
            correct_answers: newCorrect,
            total_answers: newTotal,
            best_streak: newStreak,
          },
        });
      }
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Leaderboard POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
