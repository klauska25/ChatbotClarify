import type { Metadata } from "next";
import Link from "next/link";
import { BotConnectionsTab } from "@/components/painel/BotConnectionsTab";
import { ThemeToggle } from "@/components/chat/ThemeToggle";

export const metadata: Metadata = {
  title: "Painel | TimeTrack Suporte",
};

// As outras abas do painel (ações do bot, cérebro usado etc.) ficam no TimeTrack do curso.
// Esta página existe porque, sem ela, /painel seria repassado para lá pela rota coringa.
const COURSE_PANEL_URL = "https://timetrack-curso.vercel.app/painel";

export default function PainelPage() {
  return (
    <div className="min-h-dvh bg-surface text-fg">
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-medium">Painel</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted hover:text-fg">
              Voltar ao chat
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <nav className="mt-6 flex gap-6 border-b border-line text-sm" aria-label="Abas do painel">
          <a
            href={COURSE_PANEL_URL}
            target="_blank"
            rel="noreferrer"
            className="-mb-px border-b-2 border-transparent pb-2 text-muted hover:text-fg"
          >
            Painel do TimeTrack
          </a>
          <span
            aria-current="page"
            className="-mb-px border-b-2 border-accent-line pb-2 font-medium text-fg"
          >
            Conexões do bot
          </span>
        </nav>

        <section className="mt-6">
          <p className="mb-6 text-sm text-muted">
            Cada pedido que este projeto repassa ao TimeTrack do curso. Atualiza a cada 5
            segundos.
          </p>
          <BotConnectionsTab />
        </section>
      </div>
    </div>
  );
}
