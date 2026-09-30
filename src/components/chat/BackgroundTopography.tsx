import type { CSSProperties } from "react";
import { getTopographyUrl } from "@/lib/topography";

// O desenho aparece em tamanho real (1600 px de largura) para as curvas não encolherem
// em telas menores. 160dvh garante que ele também cubra a altura em telas muito altas
// (o SVG tem proporção 16:10).
const MASK_SIZE = "max(100%, 1600px, 160dvh) auto";

interface BackgroundTopographyProps {
  conversationId: string;
  // Verdadeiro na conversa vazia: as linhas derivam devagar até a primeira mensagem.
  isMoving: boolean;
}

// Linhas de relevo decorativas no fundo da página, visíveis através dos painéis de vidro.
// Cada conversa usa um dos desenhos de public/topography/, aplicado como máscara:
// as linhas recebem a cor --pattern-line do tema.
export function BackgroundTopography({ conversationId, isMoving }: BackgroundTopographyProps) {
  const url = `url(${getTopographyUrl(conversationId)})`;
  const linesStyle: CSSProperties = {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: MASK_SIZE,
    WebkitMaskSize: MASK_SIZE,
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    // Pausar (em vez de tirar a animação) congela as linhas onde estão, sem salto.
    animationPlayState: isMoving ? "running" : "paused",
  };

  return (
    // key recria o fundo ao trocar de desenho, o que dispara o fade-in.
    <div
      key={url}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden motion-safe:animate-fade-in"
      aria-hidden="true"
    >
      {/* Maior que a tela (-8% em cada lado) para as bordas não aparecerem enquanto se move.
          will-change deixa o movimento na placa de vídeo, sem redesenhar as linhas. */}
      <div
        data-topography-lines
        className="absolute -inset-[8%] bg-pattern-line will-change-transform motion-safe:animate-topography-drift"
        style={linesStyle}
      />
    </div>
  );
}
