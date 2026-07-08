import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
    const { user, error: authError } = await getUser();
    if (authError) return authError;

    const supabase = await createClient();

    const { id } = await params;

    if (!id) {
        return Response.json(
            {
                error: "ID do equipamento é obrigatório.",
            },
            {
                status: 400,
            },
        );
    }

    const { data: equipment, error: equipmentError } = await supabase
        .from("equipments")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (equipmentError) {
        return Response.json(
            {
                error: "Erro ao buscar equipamento.",
                details: equipmentError.message,
            },
            {
                status: 500,
            },
        );
    }

    if (!equipment) {
        return Response.json(
            {
                error: "Equipamento não encontrado.",
            },
            {
                status: 404,
            },
        );
    }

    const { data: serviceOrders, error: serviceOrdersError } = await supabase
        .from("service_orders")
        .select("id, title, description, status, priority, equipment_id, created_at")
        .eq("equipment_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (serviceOrdersError) {
        return Response.json(
            {
                error: "Erro ao buscar ordens vinculadas ao equipamento.",
                details: serviceOrdersError.message,
            },
            {
                status: 500,
            },
        );
    }

    return Response.json({
        equipment,
        serviceOrders: serviceOrders ?? [],
    });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { user, error: authError } = await getUser();
    if (authError) return authError;


    const supabase = await createClient();
    const { id } = await params;

    if (!id) {
        return Response.json(
            {
                error: "ID do equipamento é obrigatório.",
            },
            {
                status: 400,
            },
        );
    }

    const { data: linkedServiceOrders, error: linkedServiceOrdersError } =
        await supabase
            .from("service_orders")
            .select("id")
            .eq("equipment_id", id)
            .eq("user_id", user.id)
            .limit(1);

    if (linkedServiceOrdersError) {
        return Response.json(
            {
                error: "Erro ao verificar ordens vinculadas ao equipamento.",
                details: linkedServiceOrdersError.message,
            },
            {
                status: 500,
            },
        );
    }

    if (linkedServiceOrders && linkedServiceOrders.length > 0) {
        return Response.json(
            {
                error:
                    "Não é possível excluir este equipamento porque ele possui ordens de serviço vinculadas.",
            },
            {
                status: 409,
            },
        );
    }

    const { data: deletedEquipment, error } = await supabase
        .from("equipments")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

    if (error) {
        return Response.json(
            {
                error: "Erro ao excluir equipamento.",
                details: error.message,
            },
            {
                status: 500,
            },
        );
    }

    if (!deletedEquipment) {
        return Response.json(
            {
                error:
                    "Equipamento não foi excluído. Verifique se ele existe ou se há permissão para exclusão.",
            },
            {
                status: 403,
            },
        );
    }

    return Response.json({
        message: "Equipamento excluído com sucesso.",
    });
}

