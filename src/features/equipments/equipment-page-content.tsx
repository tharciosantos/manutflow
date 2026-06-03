"use client";

import { useState } from "react";

import { EquipmentForm } from "@/features/equipments/equipment-form";
import { EquipmentList } from "@/features/equipments/equipment-list";

export function EquipmentPageContent() {
    const [ refreshkey, setRefreshkey ] = useState(0);

    function handleEquipmentCreated() {
        setRefreshkey((currentValue) => currentValue + 1);
    }

    return (
        <>
        <EquipmentForm  onEquipmentCreated={handleEquipmentCreated}/>
        <EquipmentList  refreshkey={refreshkey}/>
        </>
    );
}
