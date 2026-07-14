const INTERNAL_REDIRECT_BASE = "https://manutflow.local";

export function getSafeRedirectPath(
    redirect: string | null | undefined,
    fallback = "/",
): string {
    if (!redirect || !redirect.startsWith("/")) {
        return fallback;
    }

    try {
        const target = new URL(redirect, INTERNAL_REDIRECT_BASE);

        if (target.origin !== INTERNAL_REDIRECT_BASE) {
            return fallback;
        }

        return `${target.pathname}${target.search}${target.hash}`;
    } catch {
        return fallback;
    }
}
