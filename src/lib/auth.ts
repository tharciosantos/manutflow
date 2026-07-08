import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type AuthResult = {
    user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"]>;
    supabase: Awaited<ReturnType<typeof createClient>>;
    error: null;
} | {
    user: null;
    supabase: null;
    error: NextResponse;
};

/**
 * Extrai o usuário autenticado da sessão e retorna o client Supabase.
 * Se não houver sessão, retorna uma Response 401.
 */
export async function getUser(): Promise<AuthResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            user: null,
            supabase: null,
            error: NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            ),
        };
    }

    return { user, supabase, error: null };
}