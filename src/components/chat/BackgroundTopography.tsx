import type { CSSProperties } from "react";

// Linhas de relevo decorativas atrás das mensagens.
// O desenho vem de public/topography.svg (gerado por scripts/generate-topography.mjs)
// e é usado como máscara: as linhas recebem a cor --pattern-line de cada tema.
//
// O desenho aparece em tamanho real (1600 px de largura) para as curvas não encolherem
// em telas menores. 160dvh garante que ele também cubra a altura em telas muito altas
// (o SVG tem proporção 16:10).
const MASK_SIZE = "max(100%, 1600px, 160dvh) auto";

const maskStyle: CSSProperties = {
  maskImage: "url(/topography.svg)",
  WebkitMaskImage: "url(/topography.svg)",
  maskSize: MASK_SIZE,
  WebkitMaskSize: MASK_SIZE,
  maskPosition: "center",
  WebkitMaskPosition: "center",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
};

export function BackgroundTopography() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 bg-pattern-line"
      style={maskStyle}
      aria-hidden="true"
    />
  );
}
