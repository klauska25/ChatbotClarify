// Gera ids únicos no navegador. Não usamos crypto.randomUUID porque ele só existe em
// contexto seguro (HTTPS ou localhost) e falharia ao testar pelo celular via IP da rede.
export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
