import { getUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { removeEquipmentPhotoByUrl } from '@/lib/equipment-photo-storage';

export const dynamic = "force-dynamic";

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

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
        logger('error', 'api.error', { route: 'equipments/[id]', method: 'GET', error: equipmentError.message });
        return Response.json(
            {
                error: "Erro ao buscar equipamento.",
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
        .select("id, title, description, status, priority, equipment_id, due_date, created_at")
        .eq("equipment_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (serviceOrdersError) {
        logger('error', 'api.error', { route: 'equipments/[id]', method: 'GET', error: serviceOrdersError.message });
        return Response.json(
            {
                error: "Erro ao buscar ordens vinculadas ao equipamento.",
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

const allowedUpdateStatuses = ["active", "inactive", "maintenance"] as const;

type UpdateEquipmentBody = {
  name?: unknown;
  patrimony_code?: unknown;
  location?: unknown;
  status?: unknown;
  photo_url?: unknown;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { user, supabase, error: authError } = await getUser();
  if (authError) return authError;

  const { id } = await params;

  if (!id) {
    return Response.json(
      { error: "ID do equipamento é obrigatório." },
      { status: 400 },
    );
  }

  // Verificar se o equipamento existe e pertence ao usuário
  const { data: existing, error: fetchError } = await supabase
    .from("equipments")
    .select("id, patrimony_code, photo_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    logger('error', 'api.error', { route: 'equipments/[id]', method: 'PATCH', error: fetchError.message });
    return Response.json(
      { error: "Erro ao buscar equipamento." },
      { status: 500 },
    );
  }

  if (!existing) {
    return Response.json(
      { error: "Equipamento não encontrado." },
      { status: 404 },
    );
  }

  let body: UpdateEquipmentBody;

  try {
    body = (await request.json()) as UpdateEquipmentBody;
  } catch {
    return Response.json(
      { error: "JSON inválido." },
      { status: 400 },
    );
  }

  const updateData: Record<string, string | null> = {};

  // Validar e preparar campos para atualização
  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return Response.json(
        { error: "O nome do equipamento é obrigatório." },
        { status: 400 },
      );
    }

    if (name.length > 255) {
      return Response.json(
        { error: "Nome deve ter no máximo 255 caracteres." },
        { status: 400 },
      );
    }

    updateData.name = name;
  }

  if (body.patrimony_code !== undefined) {
    const patrimonyCode =
      typeof body.patrimony_code === "string" ? body.patrimony_code.trim() : "";

    if (!patrimonyCode) {
      return Response.json(
        { error: "O código de patrimônio é obrigatório." },
        { status: 400 },
      );
    }

    if (patrimonyCode.length > 100) {
      return Response.json(
        { error: "Código de patrimônio deve ter no máximo 100 caracteres." },
        { status: 400 },
      );
    }

    // Verificar duplicidade apenas se o patrimônio mudou
    if (patrimonyCode !== existing.patrimony_code) {
      const { data: duplicate } = await supabase
        .from("equipments")
        .select("id")
        .eq("user_id", user.id)
        .eq("patrimony_code", patrimonyCode)
        .maybeSingle();

      if (duplicate) {
        return Response.json(
          { error: "Já existe um equipamento com esse código de patrimônio." },
          { status: 409 },
        );
      }
    }

    updateData.patrimony_code = patrimonyCode;
  }

  if (body.location !== undefined) {
    const location =
      typeof body.location === "string" ? body.location.trim() : "";

    if (!location) {
      return Response.json(
        { error: "A localização é obrigatória." },
        { status: 400 },
      );
    }

    if (location.length > 255) {
      return Response.json(
        { error: "Localização deve ter no máximo 255 caracteres." },
        { status: 400 },
      );
    }

    updateData.location = location;
  }

  if (body.status !== undefined) {
    const status = typeof body.status === "string" ? body.status : "";

    if (!allowedUpdateStatuses.includes(status as typeof allowedUpdateStatuses[number])) {
      return Response.json(
        { error: "Status inválido." },
        { status: 400 },
      );
    }

    updateData.status = status;
  }

  if (body.photo_url !== undefined) {
    const photoUrl = typeof body.photo_url === "string" ? body.photo_url.trim() : null;
    updateData.photo_url = photoUrl;
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json(
      { error: "Nenhum campo válido para atualizar." },
      { status: 400 },
    );
  }

  const { data: updatedEquipment, error: updateError } = await supabase
    .from("equipments")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError) {
    if (updateError.code === "23505") {
      return Response.json(
        { error: "Já existe um equipamento com esse código de patrimônio." },
        { status: 409 },
      );
    }

    logger('error', 'api.error', { route: 'equipments/[id]', method: 'PATCH', error: updateError.message });
    return Response.json(
      { error: "Erro ao atualizar equipamento." },
      { status: 500 },
    );
  }

  if (
    body.photo_url !== undefined
    && existing.photo_url
    && existing.photo_url !== updateData.photo_url
  ) {
    const removalResult = await removeEquipmentPhotoByUrl(existing.photo_url, user.id);

    if (removalResult && !removalResult.ok) {
      logger('error', 'equipment.photo_cleanup_error', {
        userId: user.id,
        equipmentId: id,
        reason: removalResult.reason,
        error: removalResult.message,
      });
    }
  }

  return Response.json({ equipment: updatedEquipment });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

    const { allowed, remaining } = checkRateLimit(`equipments:delete:${user.id}`);
    if (!allowed) {
        logger('warn', 'rate_limit.exceeded', { userId: user.id, route: 'equipments/[id]', method: 'DELETE' });
        return Response.json(
            { error: 'Muitas requisições. Tente novamente mais tarde.' },
            {
                status: 429,
                headers: { 'X-RateLimit-Remaining': String(remaining) },
            },
        );
    }

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
        logger('error', 'api.error', { route: 'equipments/[id]', method: 'DELETE', error: linkedServiceOrdersError.message });
        return Response.json(
            {
                error: "Erro ao verificar ordens vinculadas ao equipamento.",
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
        .select("id, photo_url")
        .maybeSingle();

    if (error) {
        logger('error', 'api.error', { route: 'equipments/[id]', method: 'DELETE', error: error.message });
        return Response.json(
            {
                error: "Erro ao excluir equipamento.",
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

    if (deletedEquipment.photo_url) {
        const removalResult = await removeEquipmentPhotoByUrl(deletedEquipment.photo_url, user.id);

        if (removalResult && !removalResult.ok) {
            logger('error', 'equipment.photo_cleanup_error', {
                userId: user.id,
                equipmentId: id,
                reason: removalResult.reason,
                error: removalResult.message,
            });
        }
    }

    return Response.json({
        message: "Equipamento excluído com sucesso.",
    });
}

