import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function DELETE(_request: Request, { params }: RouteParams) {
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