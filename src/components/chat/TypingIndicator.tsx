// Três pontos animados enquanto o atendente "digita" a resposta.
export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="glass-soft flex items-center gap-1 rounded-[22px] px-4 py-4"
        role="status"
        aria-label="Atendente digitando"
      >
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-500" />
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
