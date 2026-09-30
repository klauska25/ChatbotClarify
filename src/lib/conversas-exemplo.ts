import type { Conversation, Message, MessageRole } from "./types";

// Conversas fictícias para a tela funcionar antes da IA existir.
// Pessoas e emails vêm da lista de usuários de teste em docs/timetrack-api.md (seção 7).

const MINUTE = 60_000;
const loadedAt = Date.now();

function minutesAgo(minutes: number): number {
  return loadedAt - minutes * MINUTE;
}

type ScriptLine = [role: MessageRole, text: string, minutesAgo: number];

function buildMessages(conversationId: string, script: ScriptLine[]): Message[] {
  return script.map(([role, text, minutes], index) => ({
    id: `${conversationId}-m${index + 1}`,
    role,
    text,
    sentAt: minutesAgo(minutes),
  }));
}

export const sampleConversations: Conversation[] = [
  {
    id: "c1",
    title: "Conta bloqueada após tentativas de senha",
    contactName: "João Pereira",
    contactEmail: "joao@empresa.com",
    category: "acesso",
    createdAt: minutesAgo(9),
    messages: buildMessages("c1", [
      ["user", "Não consigo entrar no TimeTrack desde hoje cedo.", 9],
      ["assistant", "Sinto muito pelo transtorno. Qual é o email da sua conta?", 8],
      ["user", "É joao@empresa.com. Aparece que a conta está bloqueada.", 4],
    ]),
  },
  {
    id: "c2",
    title: "Horas de março aparecem erradas no relatório",
    contactName: "Maria Costa",
    contactEmail: "maria.costa@techcorp.com",
    category: "dados",
    createdAt: minutesAgo(70),
    messages: buildMessages("c2", [
      ["user", "O relatório de março mostra 12 horas a menos para a equipe de vendas.", 70],
      ["assistant", "Vou verificar. Isso acontece com todos da equipe ou com algumas pessoas?", 66],
      ["user", "Com todos que bateram ponto pelo aplicativo no dia 14.", 52],
    ]),
  },
  {
    id: "c3",
    title: "Exportação para a folha de pagamento falhando",
    contactName: "Rafael Souza",
    contactEmail: "rafael.souza@logistica-sul.com.br",
    category: "integracao",
    createdAt: minutesAgo(200),
    messages: buildMessages("c3", [
      ["user", "A integração com o sistema da folha parou de enviar os arquivos ontem.", 200],
      ["assistant", "Obrigado por avisar. Aparece alguma mensagem de erro na tela de integrações?", 195],
      ["user", "Aparece \"token inválido\", mas ninguém mexeu na configuração.", 180],
    ]),
  },
  {
    id: "c4",
    title: "Como cadastrar feriados municipais",
    contactName: "Ana Ribeiro",
    contactEmail: "ana.ribeiro@pequenosnegocios.com.br",
    category: "duvida",
    createdAt: minutesAgo(60 * 20),
    messages: buildMessages("c4", [
      ["user", "Onde eu cadastro o feriado de aniversário da cidade?", 60 * 20],
      [
        "assistant",
        "Em Configurações, abra Calendário e clique em Adicionar feriado. Dá para escolher se ele vale só para uma filial.",
        60 * 20 - 3,
      ],
      ["user", "Achei, obrigada!", 60 * 20 - 5],
    ]),
  },
  {
    id: "c5",
    title: "Aplicativo fecha ao registrar o ponto",
    contactName: "Marina Costa",
    contactEmail: "marina@empresa.com",
    category: "bug",
    createdAt: minutesAgo(60 * 28),
    messages: buildMessages("c5", [
      ["user", "O app fecha sozinho quando toco em Registrar entrada.", 60 * 28],
      ["assistant", "Entendi. Qual é o modelo do seu celular e a versão do aplicativo?", 60 * 28 - 2],
      ["user", "Moto G54, versão 3.8.1. Já reinstalei e continua igual.", 60 * 27],
    ]),
  },
  {
    id: "c6",
    title: "Registro de ponto por QR code",
    contactName: "Lucas Martins",
    contactEmail: "lucas.martins@supermercadobom.com.br",
    category: "feature",
    createdAt: minutesAgo(60 * 24 * 3),
    messages: buildMessages("c6", [
      [
        "user",
        "Seria ótimo bater o ponto lendo um QR code no caixa da loja. Vocês pensam em fazer isso?",
        60 * 24 * 3,
      ],
      [
        "assistant",
        "Ótima sugestão. Vou registrar para o time de produto e aviso você quando houver novidade.",
        60 * 24 * 3 - 4,
      ],
    ]),
  },
];
