import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnvOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Variável de ambiente ${key} não configurada.`);
    }
    return value;
}

export async function createClient() {
    const cookieStore = await cookies();
    return createServerClient(
        getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL"),
        getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );
}