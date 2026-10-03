"use client";

import { useEffect, useState } from "react";
import { SpeakerIcon, StopIcon } from "@/components/icons";
import { canSpeak, speak, stopSpeaking } from "@/lib/speech";

interface SpeakButtonProps {
  text: string;
}

// Botão "Ouvir" das respostas do atendente: lê o texto em voz alta com a voz do navegador.
export function SpeakButton({ text }: SpeakButtonProps) {
  // Só aparece depois da montagem: o servidor não sabe se o navegador tem síntese de voz.
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setIsAvailable(canSpeak());
  }, []);

  // Para a leitura se a mensagem sair da tela (ex.: troca de conversa).
  useEffect(() => {
    if (!isSpeaking) return;
    return () => stopSpeaking();
  }, [isSpeaking]);

  if (!isAvailable) return null;

  function toggle() {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speak(text, () => setIsSpeaking(false));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-muted transition-colors hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent-line"
      aria-label={isSpeaking ? "Parar leitura" : "Ouvir resposta"}
    >
      {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
      {isSpeaking ? "Parar" : "Ouvir"}
    </button>
  );
}
