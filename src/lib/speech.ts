// Acesso às APIs de voz do navegador (Web Speech API): reconhecimento de fala para ditar
// mensagens e síntese de fala para ouvir as respostas. Tudo roda no navegador, sem servidor.
//
// O reconhecimento ainda não faz parte dos tipos padrão do TypeScript e no Chrome e no Safari
// ele vem com o prefixo "webkit". Por isso os tipos mínimos que usamos estão declarados aqui.

export const SPEECH_LANGUAGE = "pt-BR";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

// Devolve o construtor do reconhecimento de fala, ou null se o navegador não tiver (ex.: Firefox).
export function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const candidates = window as unknown as Record<string, unknown>;
  const constructor = candidates.SpeechRecognition ?? candidates.webkitSpeechRecognition;
  return typeof constructor === "function" ? (constructor as SpeechRecognitionConstructor) : null;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Prefere uma voz instalada em português do Brasil; se não houver, o navegador escolhe pelo lang.
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === SPEECH_LANGUAGE) ?? voices.find((voice) => voice.lang.startsWith("pt")) ?? null;
}

// Lê o texto em voz alta. Cancela qualquer leitura anterior para nunca ter duas vozes juntas.
export function speak(text: string, onEnd: () => void): void {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LANGUAGE;
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
