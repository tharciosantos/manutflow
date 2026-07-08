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

export async function GET() {
  const { user, supabase, error: authError } = await getUser();
  if (authError) return authError;

  const { data, error } = await supabase
    .from("equipments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json(
      {
        error: "Erro ao buscar equipamentos.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return Response.json({
    equipments: data ?? [],
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

    return Response.json(
      {
        error: "Erro ao cadastrar equipamento.",
        details: error.message,
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