// Textos dos selos que aparecem acima da resposta quando o atendente usa uma ferramenta.
// Os nomes técnicos são os da seção 4 de docs/timetrack-api.md.
const TOOL_LABELS: Record<string, string> = {
  consultar_usuario: "Consultou a conta",
  abrir_chamado: "Abriu chamado",
  resetar_senha: "Enviou link de nova senha",
  consultar_status_sistema: "Verificou o sistema",
  escalar_para_humano: "Chamou um atendente",
};

// Ferramentas novas ou sem texto próprio ainda aparecem, só que com um rótulo genérico.
const UNKNOWN_TOOL_LABEL = "Usou uma ferramenta";

export function getToolLabel(name: string): string {
  return Object.hasOwn(TOOL_LABELS, name) ? TOOL_LABELS[name] : UNKNOWN_TOOL_LABEL;
}
