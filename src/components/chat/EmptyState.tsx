const SUGGESTIONS = [
  "Não consigo logar no TimeTrack, meu email é joao@empresa.com",
  "Preciso de um relatório de horas do mês passado",
  "O sistema está fora do ar?",
  "Você sabe quem ganhou a eleição?",
];

interface EmptyStateProps {
  onPickSuggestion: (text: string) => void;
}

export function EmptyState({ onPickSuggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
      <div className="w-full max-w-2xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Como posso ajudar?
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Escolha uma sugestão ou escreva sua dúvida sobre o TimeTrack.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => onPickSuggestion(suggestion)}
                className="h-full w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm leading-snug text-neutral-700 transition-colors hover:border-brand-dark hover:bg-lime-50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
