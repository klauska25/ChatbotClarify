"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRightIcon } from "@/components/icons";

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
      className="shrink-0 border-t border-line bg-panel px-4 py-4"
    >
      <div className="mx-auto flex max-w-[770px] items-end gap-3">
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
          className="min-h-11 flex-1 resize-none rounded-md border border-line-strong bg-field px-4 py-2.5 text-base leading-6 text-fg outline-none transition-colors placeholder:text-muted focus:border-accent-line"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-ink transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-line disabled:cursor-not-allowed disabled:bg-lime-200 disabled:text-ink/45 dark:disabled:bg-brand-dark dark:disabled:text-ink/80"
        >
          Enviar
          <ArrowRightIcon />
        </button>
      </div>
      <p className="mx-auto mt-1.5 hidden max-w-[770px] px-1 text-xs text-muted md:block">
        Enter envia. Shift+Enter quebra a linha.
      </p>
    </form>
  );
}
