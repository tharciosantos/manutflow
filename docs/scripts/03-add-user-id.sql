-- ========== ADICIONAR COLUNA USER_ID ==========
-- Permite NULL temporariamente (dados existentes não têm user_id)
ALTER TABLE equipments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE service_orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE service_order_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ========== CRIAR ÍNDICES ==========
-- Performance para consultas com WHERE user_id = X
CREATE INDEX idx_equipments_user_id ON equipments(user_id);
CREATE INDEX idx_service_orders_user_id ON service_orders(user_id);
CREATE INDEX idx_service_order_history_user_id ON service_order_history(user_id);
