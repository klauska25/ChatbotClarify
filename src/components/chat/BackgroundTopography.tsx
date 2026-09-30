import type { CSSProperties } from "react";
import { getTopographyUrl } from "@/lib/topography";

// O desenho aparece em tamanho real (1600 px de largura) para as curvas não encolherem
// em telas menores. 160dvh garante que ele também cubra a altura em telas muito altas
// (o SVG tem proporção 16:10).
const MASK_SIZE = "max(100%, 1600px, 160dvh) auto";

interface BackgroundTopographyProps {
  conversationId: string;
}

// Linhas de relevo decorativas no fundo da página, visíveis através dos painéis de vidro. Cada conversa usa um dos desenhos de
// public/topography/, aplicado como máscara: as linhas recebem a cor --pattern-line do tema.
export function BackgroundTopography({ conversationId }: BackgroundTopographyProps) {
  const url = `url(${getTopographyUrl(conversationId)})`;
  const maskStyle: CSSProperties = {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: MASK_SIZE,
    WebkitMaskSize: MASK_SIZE,
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };

  return (
    <div
      // key faz o elemento ser recriado ao trocar de desenho, o que dispara o fade-in.
      key={url}
      className="pointer-events-none absolute inset-0 -z-10 bg-pattern-line motion-safe:animate-fade-in"
      style={maskStyle}
      aria-hidden="true"
    />
  );
}
