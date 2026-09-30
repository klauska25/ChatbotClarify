"use client";

import { useEffect, useState } from "react";

// Devolve o horário atual e o atualiza a cada intervalo.
// Começa como null para que o HTML do servidor e o do navegador sejam iguais
// (textos como "há 5 min" só aparecem depois que a página carrega).
export function useNow(intervalMs = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}
