import { NextResponse } from 'next/server';
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, role, created_at, updated_at')
        .eq('id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Erro ao buscar perfil:', error);
        return NextResponse.json(
            { error: 'Erro ao carregar perfil.' },
            { status: 500 },
        );
    }

    if (!data) {
        return NextResponse.json(
            { error: 'Perfil não encontrado.' },
            { status: 404 },
        );
    }

    return NextResponse.json({ profile: data });
}

export async function PATCH(request: Request) {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

    let body: { full_name?: unknown; phone?: unknown; role?: unknown };

    try {
        body = (await request.json()) as typeof body;
    } catch {
        return NextResponse.json(
            { error: 'JSON inválido.' },
            { status: 400 },
        );
    }

    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : undefined;
    const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
    const role = typeof body.role === 'string' ? body.role.trim() : undefined;

    if (fullName !== undefined && fullName.length > 255) {
        return NextResponse.json(
            { error: 'O nome deve ter no máximo 255 caracteres.' },
            { status: 400 },
        );
    }

    if (phone !== undefined && phone.length > 50) {
        return NextResponse.json(
            { error: 'O telefone deve ter no máximo 50 caracteres.' },
            { status: 400 },
        );
    }

    if (role !== undefined && role.length > 100) {
        return NextResponse.json(
            { error: 'O cargo deve ter no máximo 100 caracteres.' },
            { status: 400 },
        );
    }

    const updateData: Record<string, string> = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
            { error: 'Nenhum campo para atualizar.' },
            { status: 400 },
        );
    }

    const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select('id, email, full_name, phone, role, created_at, updated_at')
        .single();

    if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar perfil.' },
            { status: 500 },
        );
    }

    return NextResponse.json({ profile: data });
}
