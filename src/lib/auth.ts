import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Extrai o usuário autenticado da sessão.
 * Se não houver sessão, retorna uma Response 401.
 */
export async function getUser() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            user: null,
            error: NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            ),
        };
    }

    return { user, error: null };
}