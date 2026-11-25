import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { sessionClient } from "@/lib/supabase";

// Team invite links (and any email link using a token hash) land here.
// Supabase email templates point to: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (token_hash && type) {
    const supabase = await sessionClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return NextResponse.redirect(`${origin}/admin`);
  }
  return NextResponse.redirect(`${origin}/admin/login?error=link`);
}
