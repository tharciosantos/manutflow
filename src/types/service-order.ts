import type { EquipmentStatus } from '@/types/equipment';

export type ServiceOrderStatus = 'open' | 'in_progress' | 'closed';

export type ServiceOrderPriority = 'low' | 'medium' | 'high' | 'critical';

export type ServiceOrderEquipment = {
    id: string;
    name: string;
    patrimony_code: string;
    location: string;
    status: EquipmentStatus;
};

export type ServiceOrder = {
    id: string;
    title: string;
    description: string | null;
    status: ServiceOrderStatus;
    priority: ServiceOrderPriority;
    equipment_id: string;
    user_id: string;
    created_at: string;
    equipment: ServiceOrderEquipment;
    history: ServiceOrderHistory[];
};

export type ServiceOrderHistory = {
    id: string;
    service_order_id: string;
    event_type: string;
    previous_status: ServiceOrderStatus | null;
    new_status: ServiceOrderStatus | null;
    description: string | null;
    created_at: string;
};