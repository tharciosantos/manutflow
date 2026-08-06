import { describe, expect, it } from "vitest";

import { equipmentStatusFilterOptions } from "@/features/equipments/equipment-status-config";

describe("equipmentStatusFilterOptions", () => {
  it("mantém valores únicos no filtro", () => {
    const values = equipmentStatusFilterOptions.map((option) => option.value);

    expect(new Set(values).size).toBe(values.length);
    expect(values.filter((value) => value === "all")).toHaveLength(1);
  });
});
