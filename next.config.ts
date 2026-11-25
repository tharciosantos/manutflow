import type { NextConfig } from "next";

/**
 * AUD-13: headers de segurança aplicados a todas as rotas.
 *
 * A CSP é a mais estrita que o app aceita hoje. `connect-src` precisa alcançar o
 * Supabase (Auth + REST), cujo host vem de NEXT_PUBLIC_SUPABASE_URL — por isso
 * ele entra na lista. `script-src` não usa 'unsafe-eval', mas o Next injeta
 * scripts inline no bootstrap, então 'unsafe-inline' fica enquanto não houver
 * nonce via proxy.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigins = supabaseUrl
  ? [supabaseUrl, supabaseUrl.replace("https://", "wss://")]
  : [];

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  ["connect-src 'self'", ...supabaseOrigins].join(" "),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    // O HSTS só faz sentido sobre HTTPS; em `npm run dev` (http) ele atrapalha
    // o navegador a lembrar de localhost. A CSP também sai mais frouxa em dev,
    // porque o HMR do Next usa websocket e eval.
    const isDev = process.env.NODE_ENV !== "production";

    const headers = securityHeaders.filter(
      (header) => !(isDev && header.key === "Strict-Transport-Security"),
    );

    return [
      {
        source: "/:path*",
        headers: isDev
          ? headers.map((header) =>
              header.key === "Content-Security-Policy"
                ? {
                    key: header.key,
                    value:
                      "default-src 'self'; connect-src 'self' ws: http: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; frame-ancestors 'none'",
                  }
                : header,
            )
          : headers,
      },
    ];
  },
};

export default nextConfig;
