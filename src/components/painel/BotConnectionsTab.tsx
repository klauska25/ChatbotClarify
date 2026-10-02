"use client";

import { useBotConnections } from "@/hooks/use-bot-connections";
import type { BotConnection } from "@/lib/bot-connections";

export function BotConnectionsTab() {
  const { connections, hasError } = useBotConnections();

  return (
    <div>
      {hasError && (
        <p className="mb-4 text-sm text-muted">
          Não foi possível atualizar a lista agora. Tentando de novo em alguns segundos.
        </p>
      )}

      {connections === null && !hasError && <p className="text-sm text-muted">Carregando...</p>}

      {connections?.length === 0 && (
        <p className="text-sm text-muted">
          Nenhuma conversa ainda. Quando o seu bot falar, ela aparece aqui.
        </p>
      )}

      {connections && connections.length > 0 && (
        <ul className="divide-y divide-line">
          {/* A lista vem do mais antigo para o mais recente; aqui o mais recente fica em cima. */}
          {[...connections].reverse().map((connection, index) => (
            <ConnectionRow key={`${connection.time}-${index}`} connection={connection} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ConnectionRow({ connection }: { connection: BotConnection }) {
  const isError = connection.status >= 400;

  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-1 py-3">
      <time dateTime={connection.time} className="font-mono text-xs text-muted">
        {formatTime(connection.time)}
      </time>
      <span className="truncate font-mono text-sm text-fg">{connection.path}</span>
      <span
        className={`font-mono text-sm ${isError ? "text-red-600 dark:text-red-400" : "text-fg"}`}
      >
        {connection.status}
      </span>
      {connection.lastUserMessage && (
        <p className="col-start-2 col-end-4 text-sm text-muted">
          &ldquo;{connection.lastUserMessage}&rdquo;
        </p>
      )}
    </li>
  );
}

// Hora local com segundos, para diferenciar conversas próximas.
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
