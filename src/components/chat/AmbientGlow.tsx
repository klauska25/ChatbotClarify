// Brilhos verdes difusos no fundo da página. Eles aparecem através dos painéis de vidro
// e dão profundidade ao efeito de vidro fosco.
export function AmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-48 -left-40 size-[560px] rounded-full bg-glow blur-[130px]" />
      <div className="absolute -right-32 -bottom-56 size-[620px] rounded-full bg-glow blur-[150px]" />
    </div>
  );
}
