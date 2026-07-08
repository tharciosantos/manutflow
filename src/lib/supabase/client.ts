import { createBrowserClient } from "@supabase/ssr";

function getEnvOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Variável de ambiente ${key} não configurada.`);
    }
    return value;
}

export function createClient() {
    return createBrowserClient(
        getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL"),
        getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    );
}