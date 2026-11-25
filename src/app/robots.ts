import type { MetadataRoute } from "next";

/**
 * AUD-13: o app é uma ferramenta autenticada; só a landing (`/`) precisa ser
 * indexada. O resto exige sessão e, para um crawler, só produziria redirects
 * para `/login`.
 */
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://manutflow.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/register", "/auth/", "/perfil", "/equipamentos", "/ordens"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
