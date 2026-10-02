"use client";

import { useEffect, useState } from "react";
import type { BotConnection } from "@/lib/bot-connections";

const POLL_INTERVAL_MS = 5_000;

interface BotConnectionsState {
  // null enquanto a primeira leitura não terminou.
  connections: BotConnection[] | null;
  hasError: boolean;
}

// Lê /conexoes-do-bot a cada 5 segundos. Se uma leitura falhar, mantém a última lista.
export function useBotConnections(): BotConnectionsState {
  const [state, setState] = useState<BotConnectionsState>({ connections: null, hasError: false });

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const response = await fetch("/conexoes-do-bot", { cache: "no-store" });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const connections = parseConnections(await response.json());
        if (isActive) setState({ connections, hasError: false });
      } catch {
        if (isActive) setState((previous) => ({ ...previous, hasError: true }));
      }
    }

    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      isActive = false;
      clearInterval(timer);
    };
  }, []);

  return state;
}

// A resposta vem da rede: confere o formato antes de usar.
function parseConnections(data: unknown): BotConnection[] {
  if (!Array.isArray(data)) throw new Error("Resposta inesperada");
  return data.filter(isBotConnection);
}

function isBotConnection(value: unknown): value is BotConnection {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.time === "string" &&
    typeof item.path === "string" &&
    typeof item.status === "number" &&
    (item.lastUserMessage === undefined || typeof item.lastUserMessage === "string")
  );
}
