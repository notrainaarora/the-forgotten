import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase";

// Login links from email land here; we swap the one-time code for a session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await sessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/admin`);
  }
  return NextResponse.redirect(`${origin}/admin/login?error=link`);
}
