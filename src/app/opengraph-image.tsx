import { ImageResponse } from "next/og";

/**
 * AUD-13: imagem de compartilhamento gerada no build (sem arquivo binário novo
 * no repositório). 1200×630 é o tamanho recomendado para OG/Twitter.
 */
export const alt = "ManutFlow — gestão de manutenção, ativos e ordens de serviço";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 55%, #134e4a 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: "#14b8a6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
              color: "#020617",
            }}
          >
            MF
          </div>
          <div style={{ fontSize: 64, fontWeight: 700 }}>ManutFlow</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 38, color: "#94a3b8", lineHeight: 1.3 }}>
          Gestão de manutenção, ativos e ordens de serviço
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: "#5eead4" }}>
          CMMS com SLAs dinâmicos e auditoria de eventos
        </div>
      </div>
    ),
    size,
  );
}
