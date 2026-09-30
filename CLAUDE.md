# ChatbotClarify

Chatbot de suporte do TimeTrack, um sistema fictício de controle de ponto.
Projeto feito no curso Desenvolvimento Web com Claude.

## Stack

- Next.js 15 com App Router (`src/app/`).
- TypeScript estrito. Não usar `any`; quando o tipo for desconhecido, use `unknown` e valide.
- Tailwind CSS puro. Não usar bibliotecas de componentes (shadcn, MUI, Chakra etc.).

Comandos: `npm run dev` (desenvolvimento) e `npm run build` (confirma que o projeto compila).

## Idiomas

- Textos que aparecem na tela: português do Brasil.
- Código (variáveis, funções, arquivos, tipos): inglês.
- Comentários: português.

## TimeTrack

O TimeTrack é um sistema EXTERNO, documentado em `docs/timetrack-api.md`.
Sempre leia esse arquivo antes de programar qualquer coisa ligada ao TimeTrack ou ao Claude
(endpoints, tools, loop de tool use, cliente do SDK, variáveis de ambiente).

## Segurança

- Nunca colocar chaves, senhas ou tokens no código. Tudo vem de variáveis de ambiente
  (`.env.local`, que já está no `.gitignore`, e Environment Variables da Vercel).

## Código público

O repositório é público. Escreva pensando que outras pessoas vão ler o código e continuar o sistema:
nomes claros, arquivos organizados por responsabilidade, funções pequenas e comentários que
expliquem o porquê das decisões menos óbvias.

## Frontend e design

- NUNCA usar emojis nem travessões (— ou –) em textos da interface.
- O design deve parecer natural, feito por uma pessoa, sem "cara de IA": evitar gradientes
  roxos genéricos, excesso de sombras e brilhos, cards e ícones decorativos sem função e
  textos de marketing vazios. Priorizar tipografia legível, espaçamento consistente, paleta
  contida e uma hierarquia visual simples.
