import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

describe("getSafeRedirectPath", () => {
    it.each([
        [null, "/"],
        [undefined, "/"],
        ["", "/"],
        ["ordens", "/"],
        ["https://example.com", "/"],
        ["//example.com", "/"],
        ["/\\example.com", "/"],
        ["javascript:alert(1)", "/"],
    ])("retorna o fallback para um destino inseguro: %s", (redirect, expected) => {
        expect(getSafeRedirectPath(redirect)).toBe(expected);
    });

    it.each([
        ["/", "/"],
        ["/ordens", "/ordens"],
        ["/ordens?page=2", "/ordens?page=2"],
        ["/ordens/123?tab=history#eventos", "/ordens/123?tab=history#eventos"],
        ["/equipamentos/../ordens", "/ordens"],
    ])("preserva um destino interno seguro: %s", (redirect, expected) => {
        expect(getSafeRedirectPath(redirect)).toBe(expected);
    });

    it("aceita um fallback personalizado", () => {
        expect(getSafeRedirectPath("https://example.com", "/login")).toBe("/login");
    });
});
