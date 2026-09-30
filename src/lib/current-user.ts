// Conta de quem está usando o chat. Ainda não existe login, então é um valor fixo;
// quando houver autenticação, estes dados devem vir da sessão.
export const CURRENT_USER = {
  name: "João Silva",
};

// Iniciais para o avatar: primeira letra do primeiro e do último nome.
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}
