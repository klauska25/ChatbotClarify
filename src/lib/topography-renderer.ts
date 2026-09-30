import { hashString } from "./topography";

// Desenha as linhas de relevo ao vivo com WebGL: a cada quadro, a placa de vídeo calcula a
// altura de um "terreno" em cada pixel e pinta onde essa altura cruza um nível, como num
// mapa topográfico. Mudando o terreno aos poucos com o tempo, as próprias linhas ondulam,
// se juntam e se separam, em vez de a imagem inteira se mover.
//
// O terreno segue a mesma receita de scripts/generate-topography.mjs (ruído suave distorcido
// mais uma inclinação), para as linhas terem o mesmo estilo das versões estáticas.

// Velocidades bem baixas de propósito: as linhas andam só uns 3 a 5 pixels por segundo.
// Quanto o terreno muda por segundo (a forma das linhas).
const MORPH_SPEED = 0.005;
// Quanto as linhas escorrem por segundo na direção da inclinação (evita parecer travado).
const FLOW_SPEED = 0.0012;
// Espessura das linhas em pixels de tela.
const LINE_WIDTH = 1.15;
// Pixels do canvas por pixel de tela. Acima de 1.5 o custo cresce e a diferença quase some.
const MAX_PIXEL_RATIO = 1.5;
// Maior passo de tempo por quadro, para não dar um salto ao voltar de outra aba.
const MAX_FRAME_SECONDS = 0.1;

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Ruído simplex 3D: "Array and textureless GLSL 2D/3D/4D simplex noise functions",
// Ian McEwan e Ashima Arts (licença MIT), https://github.com/ashima/webgl-noise
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float uPixelRatio;
uniform float uTime;
uniform vec2 uOffset;
uniform vec2 uSlope;
uniform vec4 uColor;
uniform float uLineWidth;

out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Mesmas escalas do script das versões estáticas.
const float BASE_FREQUENCY = 1.0 / 600.0;
const float NOISE_AMPLITUDE = 0.5;
const float WARP = 60.0;
const float LEVEL_SPACING = 0.062;

float fbm(vec2 p, float z) {
  float value = snoise(vec3(p * BASE_FREQUENCY, z));
  value += 0.25 * snoise(vec3(p * BASE_FREQUENCY * 2.1, z * 1.3));
  return value * NOISE_AMPLITUDE;
}

void main() {
  // Posição em pixels de tela, deslocada para cada conversa ter um terreno próprio.
  vec2 screen = gl_FragCoord.xy / uPixelRatio;
  vec2 p = screen + uOffset;
  float z = uTime * ${MORPH_SPEED.toFixed(4)};

  vec2 warp = vec2(fbm(p + vec2(311.0, 97.0), z), fbm(p + vec2(-523.0, 431.0), z)) * WARP;
  float height = fbm(p + warp, z) + dot(uSlope, screen) + uTime * ${FLOW_SPEED.toFixed(4)};

  // Distância até a curva de nível mais próxima, medida em pixels para a espessura
  // ficar igual em todo lugar, com borda suavizada.
  float level = height / LEVEL_SPACING;
  float distanceToLine = abs(fract(level + 0.5) - 0.5) / max(fwidth(level), 1e-5);
  float halfWidth = uLineWidth * uPixelRatio * 0.5;
  float line = 1.0 - smoothstep(halfWidth - 0.5, halfWidth + 0.5, distanceToLine);

  // Cor com alfa pré-multiplicado, como o canvas espera.
  fragColor = vec4(uColor.rgb * uColor.a, uColor.a) * line;
}
`;

interface Uniforms {
  pixelRatio: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  offset: WebGLUniformLocation | null;
  slope: WebGLUniformLocation | null;
  color: WebGLUniformLocation | null;
  lineWidth: WebGLUniformLocation | null;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Lê uma cor CSS como "rgba(163, 230, 53, 0.13)" e devolve valores de 0 a 1.
function parseCssColor(value: string): [number, number, number, number] {
  const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
  const [r = 0, g = 0, b = 0, a = 1] = numbers;
  return [r / 255, g / 255, b / 255, a];
}

// Terreno próprio de cada conversa: um ponto de partida distante no ruído e uma direção
// para a inclinação, ambos derivados do id (a mesma conversa sempre gera o mesmo terreno).
function sceneFromId(conversationId: string) {
  const hash = hashString(conversationId);
  const angle = ((hash >>> 24) / 255) * Math.PI * 2;
  const slope = 0.0008 * Math.SQRT2;
  return {
    offset: [(hash % 4096) * 7.3, ((hash >>> 12) % 4096) * 5.9] as const,
    slope: [Math.cos(angle) * slope, Math.sin(angle) * slope] as const,
  };
}

export class TopographyRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly uniforms: Uniforms;
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly resizeObserver: ResizeObserver;
  private readonly themeObserver: MutationObserver;

  // Tempo de cada conversa: ao voltar para ela, as linhas estão onde ficaram.
  private readonly timeByConversation = new Map<string, number>();
  private conversationId: string | null = null;
  private time = 0;
  private wantsMotion = false;
  private frameId: number | null = null;
  private lastFrameAt = 0;

  // Devolve null se o navegador não tiver WebGL 2; aí usamos as linhas estáticas.
  static create(canvas: HTMLCanvasElement): TopographyRenderer | null {
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return null;
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    return new TopographyRenderer(canvas, gl, program);
  }

  private constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.canvas = canvas;
    this.gl = gl;
    this.program = program;
    gl.useProgram(program);

    // Um triângulo que cobre a tela inteira; o trabalho todo acontece no fragment shader.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    this.uniforms = {
      pixelRatio: gl.getUniformLocation(program, "uPixelRatio"),
      time: gl.getUniformLocation(program, "uTime"),
      offset: gl.getUniformLocation(program, "uOffset"),
      slope: gl.getUniformLocation(program, "uSlope"),
      color: gl.getUniformLocation(program, "uColor"),
      lineWidth: gl.getUniformLocation(program, "uLineWidth"),
    };
    gl.uniform1f(this.uniforms.lineWidth, LINE_WIDTH);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();

    // A cor das linhas vem da variável --pattern-line e muda com o tema claro/escuro.
    this.themeObserver = new MutationObserver(() => {
      this.updateColor();
      this.draw();
    });
    this.themeObserver.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    this.updateColor();

    this.reducedMotion.addEventListener("change", this.handleMotionPreference);
  }

  // Mostra o terreno de uma conversa e diz se as linhas devem se mover.
  setScene(conversationId: string, moving: boolean) {
    if (conversationId !== this.conversationId) {
      if (this.conversationId !== null) {
        this.timeByConversation.set(this.conversationId, this.time);
      }
      this.conversationId = conversationId;
      this.time = this.timeByConversation.get(conversationId) ?? 0;

      const scene = sceneFromId(conversationId);
      this.gl.uniform2f(this.uniforms.offset, scene.offset[0], scene.offset[1]);
      this.gl.uniform2f(this.uniforms.slope, scene.slope[0], scene.slope[1]);

      if (!this.reducedMotion.matches) {
        this.canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: "ease-out" });
      }
    }

    this.wantsMotion = moving;
    this.draw();
    this.updateLoop();
  }

  destroy() {
    this.stopLoop();
    this.resizeObserver.disconnect();
    this.themeObserver.disconnect();
    this.reducedMotion.removeEventListener("change", this.handleMotionPreference);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  private handleMotionPreference = () => this.updateLoop();

  private updateLoop() {
    const shouldMove = this.wantsMotion && !this.reducedMotion.matches;
    if (shouldMove && this.frameId === null) {
      this.lastFrameAt = performance.now();
      this.frameId = requestAnimationFrame(this.tick);
    } else if (!shouldMove) {
      this.stopLoop();
    }
  }

  private stopLoop() {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  private tick = (now: number) => {
    const elapsed = Math.min((now - this.lastFrameAt) / 1000, MAX_FRAME_SECONDS);
    this.lastFrameAt = now;
    this.time += elapsed;
    this.draw();
    this.frameId = requestAnimationFrame(this.tick);
  };

  private resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const width = Math.max(1, Math.round(this.canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.round(this.canvas.clientHeight * pixelRatio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.gl.viewport(0, 0, width, height);
    this.gl.uniform1f(this.uniforms.pixelRatio, pixelRatio);
    this.draw();
  }

  private updateColor() {
    const [r, g, b, a] = parseCssColor(getComputedStyle(this.canvas).color);
    this.gl.uniform4f(this.uniforms.color, r, g, b, a);
  }

  private draw() {
    if (this.conversationId === null) return;
    this.gl.uniform1f(this.uniforms.time, this.time);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }
}
