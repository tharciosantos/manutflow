import { supabase } from "@/lib/supabase/client";

export async function GET() {
    const { data, error } = await supabase
        .from("equipments")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return Response.json(
            {
                error: "Erro ao buscar equipamentos.",
                details: error.message,
            },
            {
                status: 500,
            },
        );
    }

    return Response.json({
        equipments: data ?? [],
    });
}