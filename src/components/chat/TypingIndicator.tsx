// Três pontos animados enquanto o atendente "digita" a resposta.
export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-neutral-100 px-4 py-3.5"
        role="status"
        aria-label="Atendente digitando"
      >
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" />
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
