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
      <div className="w-full max-w-[680px]">
        <h2 className="text-center font-display text-2xl font-medium text-white">
          Como posso ajudar?
        </h2>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => onPickSuggestion(suggestion)}
                className="h-full w-full rounded-lg border border-neutral-600 bg-surface px-4 py-3 text-left text-sm leading-snug text-neutral-100 transition-colors hover:border-brand hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
