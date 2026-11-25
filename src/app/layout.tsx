import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// AUD-13: metadata-base com OpenGraph/Twitter. `metadataBase` faz o Next resolver
// as URLs relativas (imagem OG, canonical) contra a origem real; NEXT_PUBLIC_SITE_URL
// cobre um domínio próprio sem tocar no código.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://manutflow.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ManutFlow — Gestão de Manutenção e Ordens de Serviço",
    template: "%s · ManutFlow",
  },
  description:
    "CMMS para controle de ativos, ordens de serviço preventivas e corretivas, SLAs dinâmicos e auditoria de eventos.",
  applicationName: "ManutFlow",
  keywords: ["CMMS", "manutenção industrial", "ordem de serviço", "gestão de ativos", "SLA"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "ManutFlow",
    title: "ManutFlow — Gestão de Manutenção e Ordens de Serviço",
    description:
      "CMMS para controle de ativos, ordens de serviço preventivas e corretivas, SLAs dinâmicos e auditoria de eventos.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ManutFlow — Gestão de Manutenção e Ordens de Serviço",
    description:
      "CMMS para controle de ativos, ordens de serviço preventivas e corretivas, SLAs dinâmicos e auditoria de eventos.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
