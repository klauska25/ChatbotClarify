// Arcos concêntricos decorativos atrás das mensagens.
// O centro fica fora da tela, no canto superior esquerdo, então só aparecem as curvas.
// O SVG não tem viewBox: as medidas são em pixels e o espaçamento não muda com o tamanho da tela.

const CENTER_X = -120;
const CENTER_Y = -260;
const FIRST_RADIUS = 340;
const GAP = 64;
const RING_COUNT = 34;

const radii = Array.from({ length: RING_COUNT }, (_, index) => FIRST_RADIUS + index * GAP);

export function BackgroundLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 -z-10 size-full text-pattern-line"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      {radii.map((radius) => (
        <circle key={radius} cx={CENTER_X} cy={CENTER_Y} r={radius} />
      ))}
    </svg>
  );
}
