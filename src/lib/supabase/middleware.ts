import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getEnvOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Variável de ambiente ${key} não configurada.`);
    }
    return value;
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL"),
        getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    return { supabaseResponse, user };
}