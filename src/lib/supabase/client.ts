import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

// NEXT_PUBLIC_* vars são injetadas pelo Next.js no build time
export function createClient() {
    const { url, anonKey } = getSupabaseEnv();

    return createBrowserClient(url, anonKey);
}
