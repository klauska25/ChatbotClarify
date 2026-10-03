"use client";

import { useEffect, useRef, useState } from "react";
import {
  getSpeechRecognition,
  SPEECH_LANGUAGE,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionLike,
} from "@/lib/speech";

// Mensagens mostradas quando o ditado falha. Os códigos vêm da Web Speech API.
const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Permita o uso do microfone para ditar a mensagem.",
  "service-not-allowed": "Permita o uso do microfone para ditar a mensagem.",
  "no-speech": "Não ouvi nada. Tente falar de novo.",
  "audio-capture": "Nenhum microfone encontrado.",
  network: "O ditado precisa de internet. Confira sua conexão.",
};
const GENERIC_ERROR = "Não consegui entender o áudio. Tente de novo.";

interface SpeechRecognitionOptions {
  // Recebe o texto ditado até agora (parcial e final juntos), a cada atualização.
  onTranscript: (transcript: string) => void;
}

export function useSpeechRecognition({ onTranscript }: SpeechRecognitionOptions) {
  // Começa falso e só é conferido depois da montagem, para o HTML do servidor e do
  // navegador serem iguais (o servidor não sabe se o navegador tem microfone).
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Guardado em ref para o reconhecimento sempre chamar a versão mais nova do callback.
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setIsSupported(getSpeechRecognition() !== null);
    return () => recognitionRef.current?.abort();
  }, []);

  function start() {
    const Recognition = getSpeechRecognition();
    if (!Recognition || recognitionRef.current) return;

    const recognition = new Recognition();
    recognition.lang = SPEECH_LANGUAGE;
    // Parciais deixam o texto aparecer enquanto a pessoa fala, o que dá a sensação de tempo real.
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onTranscriptRef.current(transcript);
    };
    recognition.onerror = (event) => {
      // "aborted" acontece quando nós mesmos cancelamos; não é erro para a pessoa.
      if (event.error !== "aborted") setError(ERROR_MESSAGES[event.error] ?? GENERIC_ERROR);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return { isSupported, isListening, error, start, stop };
}
