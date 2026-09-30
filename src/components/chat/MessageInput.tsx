"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

// Altura máxima do campo antes de ele ganhar barra de rolagem.
const MAX_TEXTAREA_HEIGHT = 160;

interface MessageInputProps {
  onSend: (text: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0;

  // O campo cresce conforme o texto, até MAX_TEXTAREA_HEIGHT.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  function submit() {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envia e Shift+Enter quebra a linha. isComposing evita enviar no meio
    // de uma composição de acento em alguns teclados.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="shrink-0 border-t border-neutral-200 bg-white px-4 py-3 md:px-6 md:py-4"
    >
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-neutral-300 bg-white p-1.5 transition-colors focus-within:border-brand-dark focus-within:ring-2 focus-within:ring-brand/50">
        <label htmlFor="message-input" className="sr-only">
          Mensagem
        </label>
        <textarea
          id="message-input"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua mensagem"
          className="flex-1 resize-none bg-transparent px-2.5 py-2 text-base leading-6 text-ink outline-none placeholder:text-neutral-400"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
        >
          Enviar
        </button>
      </div>
      <p className="mx-auto mt-2 hidden max-w-3xl px-1 text-xs text-neutral-400 md:block">
        Enter envia. Shift+Enter quebra a linha.
      </p>
    </form>
  );
}
