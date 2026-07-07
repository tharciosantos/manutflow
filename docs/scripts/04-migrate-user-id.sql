-- ========== VERIFICAR REGISTROS EXISTENTES ==========
-- Antes de migrar, confira quantos registros serão afetados
SELECT 'equipments', COUNT(*) FROM equipments
UNION ALL
SELECT 'service_orders', COUNT(*) FROM service_orders
UNION ALL
SELECT 'service_order_history', COUNT(*) FROM service_order_history;


-- ========== ETAPA 1: CRIAR USUÁRIO SISTEMA ==========
-- (Faça manualmente no Supabase Dashboard: Authentication > Users > Add User)
-- Email sugerido: sistema@manutflow.com
-- Copie o UUID gerado para usar no UPDATE abaixo


-- ========== ETAPA 2: ATRIBUIR DADOS AO USUÁRIO SISTEMA ==========
-- Substitua 'SEU_USER_UUID' pelo UUID do usuário sistema criado
UPDATE equipments SET user_id = 'SEU_USER_UUID' WHERE user_id IS NULL;
UPDATE service_orders SET user_id = 'SEU_USER_UUID' WHERE user_id IS NULL;
UPDATE service_order_history SET user_id = 'SEU_USER_UUID' WHERE user_id IS NULL;


-- ========== ETAPA 3: VERIFICAR MIGRAÇÃO ==========
-- Confirmar que NENHUM registro ficou sem user_id
SELECT COUNT(*) FROM equipments WHERE user_id IS NULL;
SELECT COUNT(*) FROM service_orders WHERE user_id IS NULL;
SELECT COUNT(*) FROM service_order_history WHERE user_id IS NULL;
-- Todos devem retornar 0


-- ========== ETAPA 4: TORNAR NOT NULL ==========
-- Só após confirmar que todos os registros têm user_id
ALTER TABLE equipments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE service_orders ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE service_order_history ALTER COLUMN user_id SET NOT NULL;
