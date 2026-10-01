import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, nickname } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNickname = nickname?.trim() || cleanEmail.split("@")[0];

    // Check if user already exists
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (existingUser) {
      // If user exists and is unconfirmed, confirm them and set their password
      if (!existingUser.email_confirmed_at) {
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            email_confirm: true,
            password: password,
            user_metadata: {
              nickname: cleanNickname,
              name: cleanNickname,
              display_name: cleanNickname,
            },
          }
        );
        if (updateErr) {
          return NextResponse.json({ error: updateErr.message }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: "Account verified and password updated.",
        });
      }

      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // Create user with email_confirm: true so no confirmation email is required!
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true, // Auto-confirm on localhost and production
      user_metadata: {
        nickname: cleanNickname,
        name: cleanNickname,
        display_name: cleanNickname,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to register account." },
      { status: 500 }
    );
  }
}
