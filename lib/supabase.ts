import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the database is connected. Otherwise the site runs in demo mode. */
export const isConfigured = Boolean(url && anonKey && serviceKey);

/** Public, read-only client (anon key): can only see the published views. */
export function publicClient() {
  return createClient(url!, anonKey!, { auth: { persistSession: false } });
}

/**
 * Service-role client: bypasses row-level security.
 * Server-only — used for validated submissions, signed file URLs,
 * and admin actions after we've checked the user is an admin.
 */
export function serviceClient() {
  return createClient(url!, serviceKey!, { auth: { persistSession: false } });
}

/** Client bound to the signed-in user's session cookies (admin login). */
export async function sessionClient() {
  const cookieStore = await cookies();
  return createServerClient(url!, anonKey!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; middleware refreshes the session instead.
        }
      },
    },
  });
}
