"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRightIcon, MicIcon } from "@/components/icons";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

// Altura máxima do campo antes de ele ganhar barra de rolagem.
const MAX_TEXTAREA_HEIGHT = 160;

interface MessageInputProps {
  onSend: (text: string) => void;
  // Verdadeiro enquanto o atendente responde. Dá para continuar digitando, mas o envio
  // espera a resposta terminar, para o histórico mandado ao bot ficar na ordem certa.
  isSendBlocked?: boolean;
}

export function MessageInput({ onSend, isSendBlocked = false }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !isSendBlocked;
  // Texto que já estava no campo quando o ditado começou; o que for falado entra depois dele.
  const textBeforeDictation = useRef("");
  const dictation = useSpeechRecognition({
    onTranscript: (transcript) => {
      const separator = textBeforeDictation.current === "" ? "" : " ";
      setValue(textBeforeDictation.current + separator + transcript);
    },
  });

  function toggleDictation() {
    if (dictation.isListening) {
      dictation.stop();
      return;
    }
    textBeforeDictation.current = value.trim();
    dictation.start();
  }

  // O campo cresce conforme o texto, até MAX_TEXTAREA_HEIGHT.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  function submit() {
    const text = value.trim();
    if (!text || isSendBlocked) return;
    // Enviar no meio do ditado encerra o microfone, senão o resto da fala voltaria ao campo.
    if (dictation.isListening) dictation.stop();
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
      className="glass mx-auto w-full max-w-3xl shrink-0 rounded-3xl p-2.5 md:p-3"
    >
      <div className="flex items-end gap-2.5">
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
          placeholder={dictation.isListening ? "Ouvindo, pode falar" : "Escreva sua mensagem"}
          className="neu-inset min-h-11 flex-1 resize-none rounded-2xl border border-transparent bg-neu px-4 py-2.5 text-base leading-6 text-fg outline-none transition-colors placeholder:text-muted focus:border-accent-line/60"
        />
        {dictation.isSupported && (
          <button
            type="button"
            onClick={toggleDictation}
            aria-pressed={dictation.isListening}
            aria-label={dictation.isListening ? "Parar ditado" : "Ditar mensagem por voz"}
            title={dictation.isListening ? "Parar ditado" : "Ditar mensagem por voz"}
            className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-line ${
              dictation.isListening
                ? "animate-pulse bg-red-600 text-white"
                : "text-muted hover:bg-hover hover:text-fg"
            }`}
          >
            <MicIcon />
          </button>
        )}
        <button
          type="submit"
          disabled={!canSend}
          className="glow-brand flex h-11 shrink-0 items-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-ink transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-line disabled:cursor-not-allowed disabled:bg-brand/35 disabled:text-ink/55 disabled:shadow-none"
        >
          Enviar
          <ArrowRightIcon />
        </button>
      </div>
      {dictation.error ? (
        <p role="alert" className="mt-2 px-2 text-xs text-red-600 dark:text-red-400">
          {dictation.error}
        </p>
      ) : (
        <p className="mt-2 hidden px-2 text-xs text-muted md:block">
          Enter envia. Shift+Enter quebra a linha.
          {dictation.isSupported && " Use o microfone para falar em vez de digitar."}
        </p>
      )}
    </form>
  );
}
