export type EquipmentStatus = "active" | "inactive" | "maintenance";

export type Equipment = {
    id: string;
    name: string;
    patrimony_code: string;
    location: string;
    status: EquipmentStatus;
    user_id: string;
    created_at: string;
    updated_at: string;
};