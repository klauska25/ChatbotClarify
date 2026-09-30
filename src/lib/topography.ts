// Linhas de relevo estáticas em public/topography/ (geradas por scripts/generate-topography.mjs).
// São usadas quando o navegador não consegue desenhar as linhas ao vivo (WebGL 2).
//
// Quantidade de desenhos em public/topography/.
// Precisa ser igual ao número de SEEDS no script.
export const TOPOGRAPHY_VARIANTS = 8;

// Hash simples e estável de texto (djb2): o mesmo id sempre dá o mesmo número.
export function hashString(text: string): number {
  let hash = 5381;
  for (let index = 0; index < text.length; index++) {
    hash = (hash * 33) ^ text.charCodeAt(index);
  }
  return hash >>> 0;
}

// Escolhe o desenho de fundo de uma conversa. Cada conversa mantém sempre o mesmo desenho,
// e conversas diferentes tendem a ter desenhos diferentes.
export function getTopographyUrl(conversationId: string): string {
  const variant = (hashString(conversationId) % TOPOGRAPHY_VARIANTS) + 1;
  return `/topography/${variant}.svg`;
}
