const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Texto de "há quanto tempo", usado na lista de conversas.
export function formatRelativeTime(timestamp: number, now: number): string {
  const elapsed = Math.max(0, now - timestamp);

  if (elapsed < MINUTE) return "agora";
  if (elapsed < HOUR) return `há ${Math.floor(elapsed / MINUTE)} min`;
  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);
    return hours === 1 ? "há 1 hora" : `há ${hours} horas`;
  }

  const days = Math.floor(elapsed / DAY);
  if (days === 1) return "ontem";
  if (days === 2) return "anteontem";
  return `há ${days} dias`;
}

// Hora e minuto no fuso de quem está usando, por exemplo "21:41".
// Só deve ser chamada no navegador: no servidor o fuso seria outro.
export function formatClockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
