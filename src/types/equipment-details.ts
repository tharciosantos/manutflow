import type { Equipment } from "@/types/equipment";
import type {
    ServiceOrderPriority,
    ServiceOrderStatus,
} from "@/types/service-order";

export type EquipmentDetailsServiceOrder = {
    id: string;
    title: string;
    description: string | null;
    status: ServiceOrderStatus;
    priority: ServiceOrderPriority;
    equipment_id: string;
    due_date: string | null;
    created_at: string;
};

export type EquipmentDetails = {
    equipment: Equipment;
    serviceOrders: EquipmentDetailsServiceOrder[];
}
