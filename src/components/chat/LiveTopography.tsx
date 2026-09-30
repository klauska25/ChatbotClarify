"use client";

import { useEffect, useRef, useState } from "react";
import { TopographyRenderer } from "@/lib/topography-renderer";
import { BackgroundTopography } from "./BackgroundTopography";

interface LiveTopographyProps {
  conversationId: string;
  // Verdadeiro na conversa vazia: as linhas ondulam devagar até a primeira mensagem.
  isMoving: boolean;
}

// Fundo com linhas de relevo desenhadas ao vivo (ver TopographyRenderer).
// Se o navegador não tiver WebGL 2, mostra as linhas estáticas no lugar.
export function LiveTopography({ conversationId, isMoving }: LiveTopographyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<TopographyRenderer | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = TopographyRenderer.create(canvas);
    if (!renderer) {
      setIsSupported(false);
      return;
    }
    rendererRef.current = renderer;
    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setScene(conversationId, isMoving);
  }, [conversationId, isMoving, isSupported]);

  if (!isSupported) return <BackgroundTopography conversationId={conversationId} />;

  return (
    // text-pattern-line: o desenhista lê a cor das linhas daqui (muda com o tema).
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-10 size-full text-pattern-line"
      aria-hidden="true"
    />
  );
}
