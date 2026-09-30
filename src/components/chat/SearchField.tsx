import { CloseIcon, SearchIcon } from "@/components/icons";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onChange("");
        }}
        placeholder="Buscar atendimentos"
        aria-label="Buscar atendimentos"
        className="w-full rounded-full border border-line-strong bg-field py-2.5 pr-10 pl-10 text-sm text-fg outline-none transition-colors placeholder:text-muted focus:border-accent-line [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2.5 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-hover hover:text-fg"
          aria-label="Limpar busca"
        >
          <CloseIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}
