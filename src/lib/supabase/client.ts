import { createBrowserClient } from "@supabase/ssr";

// NEXT_PUBLIC_* vars são injetadas pelo Next.js no build time
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}