// Identifica quem está sendo atendido a partir do e-mail que a pessoa escreve no chat.
// O atendente costuma pedir o e-mail logo no começo; quando ele aparece, a conversa deixa
// de se chamar "Visitante" na barra lateral.

// Simples de propósito: só precisa achar algo com cara de e-mail no meio de uma frase.
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;

export function findEmail(text: string): string | null {
  const match = text.match(EMAIL_PATTERN);
  return match ? match[0].toLowerCase() : null;
}

// "joao.silva@acme.com.br" vira "Joao Silva": pega a parte antes do @, troca pontos,
// traços e sublinhados por espaço e deixa cada palavra com a inicial maiúscula.
export function nameFromEmail(email: string): string {
  const localPart = email.split("@")[0];
  const words = localPart
    .replace(/\+.*$/, "") // ignora apelidos do tipo "maria+teste"
    .split(/[._-]+/)
    .filter((word) => word !== "");
  if (words.length === 0) return localPart;
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}
