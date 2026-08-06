"use client";

import { useState } from "react";

type EquipmentPhotoProps = {
  src: string;
  alt: string;
  className: string;
};

export function EquipmentPhoto({ src, alt, className }: EquipmentPhotoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = failedSrc === src;

  if (hasError) {
    return (
      <span
        role="img"
        aria-label={`${alt} (imagem indisponível)`}
        className={`${className} inline-flex items-center justify-center bg-slate-900 text-slate-500`}
      >
        <svg aria-hidden="true" className="h-1/2 w-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m3 16 5-5 4 4 3-3 6 6M5 5h14v14H5z" />
        </svg>
      </span>
    );
  }

  // next/image não é adequado aqui: src pode ser blob: local ou um host Supabase definido por ambiente.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />;
}
