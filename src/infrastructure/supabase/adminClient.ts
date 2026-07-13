import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses Row Level Security. Server-only: never import
 * this from a Client Component or anything bundled to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
