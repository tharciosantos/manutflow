import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const allowedStatuses = ["active", "inactive", "maintenance"] as const;

type EquipmentStatus = (typeof allowedStatuses)[number];

type CreateEquipmentBody = {
  name?: unknown;
  patrimony_code?: unknown;
  location?: unknown;
  status?: unknown;
};

function isEquipmentStatus(value: unknown): value is EquipmentStatus {
  return (
    typeof value === "string" &&
    allowedStatuses.includes(value as EquipmentStatus)
  );
}

export async function GET(request: Request) {
  const { user, supabase, error: authError } = await getUser();
  if (authError) return authError;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 10));
  const offset = (page - 1) * limit;

  const searchQuery = url.searchParams.get("q")?.trim() || "";
  const statusFilter = url.searchParams.get("status") || "";

  // Construir query com filtros
  let query = supabase
    .from("equipments")
    .select("*", { count: "exact", head: false })
    .eq("user_id", user.id);

  // Filtro por status
  if (statusFilter && allowedStatuses.includes(statusFilter as EquipmentStatus)) {
    query = query.eq("status", statusFilter);
  }

  // Filtro por busca textual
  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,patrimony_code.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Erro ao buscar equipamentos:", error);
    return Response.json(
      {
        error: "Erro ao buscar equipamentos.",
      },
      { status: 500 }
    );
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return Response.json({
    equipments: data ?? [],
    total,
    page,
    totalPages,
  });
}

export async function POST(request: Request) {
  const { user, supabase, error: authError } = await getUser();
  if (authError) return authError;
  let body: CreateEquipmentBody;

  try {
    body = (await request.json()) as CreateEquipmentBody;
  } catch {
    return Response.json(
      {
        error: "JSON inválido.",
      },
      {
        status: 400,
      },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const patrimonyCode =
    typeof body.patrimony_code === "string" ? body.patrimony_code.trim() : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  const status = body.status ?? "active";

  if (name.length > 255) {
    return Response.json(
      { error: "Nome deve ter no máximo 255 caracteres." },
      { status: 400 },
    );
  }

  if (patrimonyCode.length > 100) {
    return Response.json(
      { error: "Código de patrimônio deve ter no máximo 100 caracteres." },
      { status: 400 },
    );
  }

  if (location.length > 255) {
    return Response.json(
      { error: "Localização deve ter no máximo 255 caracteres." },
      { status: 400 },
    );
  }

  if (!name) {
    return Response.json(
      {
        error: "O nome do equipamento é obrigatório.",
      },
      {
        status: 400,
      },
    );
  }

  if (!patrimonyCode) {
    return Response.json(
      {
        error: "O código de patrimônio é obrigatório.",
      },
      {
        status: 400,
      },
    );
  }

  if (!location) {
    return Response.json(
      {
        error: "A localização é obrigatória.",
      },
      {
        status: 400,
      },
    );
  }

  if (!isEquipmentStatus(status)) {
    return Response.json(
      {
        error: "Status inválido.",
      },
      {
        status: 400,
      },
    );
  }

  // Verifica se o patrimônio já existe SOMENTE para este usuário
  const { data: existingEquipment } = await supabase
    .from("equipments")
    .select("id")
    .eq("user_id", user.id)
    .eq("patrimony_code", patrimonyCode)
    .maybeSingle();

  if (existingEquipment) {
    return Response.json(
      {
        error: "Já existe um equipamento com esse código de patrimônio.",
      },
      {
        status: 409,
      },
    );
  }

  const { data, error } = await supabase
    .from("equipments")
    .insert({
      name,
      patrimony_code: patrimonyCode,
      location,
      status,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json(
        {
          error: "Já existe um equipamento com esse código de patrimônio.",
        },
        { status: 409 },
      );
    }

    console.error("Erro ao cadastrar equipamento:", error);
    return Response.json(
      {
        error: "Erro ao cadastrar equipamento.",
      },
      {
        status: 500,
      },
    );
  }

  return Response.json(
    {
      equipment: data,
    },
    {
      status: 201,
    },
  );
}