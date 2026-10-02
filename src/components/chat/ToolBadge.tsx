import { WrenchIcon } from "@/components/icons";
import { getToolLabel } from "@/lib/tool-labels";
import type { ToolUse } from "@/lib/types";

// Verde quando a ferramenta funcionou; cinza quando o TimeTrack devolveu erro.
const OK_CLASS = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300";
const FAILED_CLASS = "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";

interface ToolBadgeProps {
  tool: ToolUse;
}

export function ToolBadge({ tool }: ToolBadgeProps) {
  const label = getToolLabel(tool.name);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        tool.ok ? OK_CLASS : FAILED_CLASS
      }`}
      title={tool.ok ? label : `${label} (sem sucesso)`}
    >
      <WrenchIcon />
      {label}
    </span>
  );
}
