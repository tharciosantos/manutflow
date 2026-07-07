-- ========== ROW LEVEL SECURITY (RLS) ==========
-- Task 6: Isolamento de dados no nível do banco
--
// O que é RLS?
// RLS é como um segurança na porta do banco. Mesmo que alguém
// consiga a senha (conexão), o segurança pergunta: "esse dado
// é seu?". Se não for, barra na hora.
//
// 4 tipos de política:
// - SELECT → controla quem pode VER os dados
// - INSERT → controla quem pode CRIAR dados
// - UPDATE → controla quem pode EDITAR dados
// - DELETE → controla quem pode REMOVER dados


-- ========== PASSO 1: HABILITAR RLS ==========
-- ⚠️ IMPORTANTE: RLS sem policies BLOQUEIA TUDO!
-- Execute este script COMPLETO (não pare no meio)

ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_history ENABLE ROW LEVEL SECURITY;

-- profiles já teve RLS habilitado na Task 2


-- ==============================================
-- EQUIPMENTS
-- ==============================================

CREATE POLICY "Usuarios podem ver seus equipamentos"
    ON equipments FOR SELECT
    USING (auth.uid() = user_id);
-- "auth.uid()" é o ID do usuário logado no momento
-- "user_id" é o dono do registro
-- Só mostra se os dois forem iguais

CREATE POLICY "Usuarios podem criar equipamentos"
    ON equipments FOR INSERT
    WITH CHECK (auth.uid() = user_id);
-- WITH CHECK = verifica se o user_id do NOVO registro é seu

CREATE POLICY "Usuarios podem editar seus equipamentos"
    ON equipments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
-- USING = verifica o registro ANTIGO
-- WITH CHECK = verifica o registro DEPOIS da edição
-- (impede que você mude o user_id para outro usuário)

CREATE POLICY "Usuarios podem deletar seus equipamentos"
    ON equipments FOR DELETE
    USING (auth.uid() = user_id);


-- ==============================================
-- SERVICE ORDERS
-- ==============================================

CREATE POLICY "Usuarios podem ver suas ordens"
    ON service_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem criar ordens"
    ON service_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem editar suas ordens"
    ON service_orders FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem deletar suas ordens"
    ON service_orders FOR DELETE
    USING (auth.uid() = user_id);


-- ==============================================
-- SERVICE ORDER HISTORY
-- ==============================================
-- O histórico também tem user_id (adicionado na Task 5)

CREATE POLICY "Usuarios podem ver historico"
    ON service_order_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem criar historico"
    ON service_order_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem editar historico"
    ON service_order_history FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem deletar historico"
    ON service_order_history FOR DELETE
    USING (auth.uid() = user_id);


-- ========== VERIFICAR POLICIES CRIADAS ==========
-- Execute depois para confirmar que está tudo certo:
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;
