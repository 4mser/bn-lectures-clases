// Piezas comunes del video «Una carga en un campo»: placas paralelas con su campo uniforme, rastros de
// trayectorias y las constantes del ejemplo 4 de los apuntes (§10.4). Todo es función pura de t.
import { RGB } from "../theme";
import { barraLuz, chispa, flecha, linea, particulas, rgba, rotulo, variable, type Pt } from "./luz";

type Ctx = CanvasRenderingContext2D;

// Constantes (CODATA 2022) y los valores del ejemplo 4 de §10.4.
export const QE = 1.602176634e-19; // C, exacta
export const ME = 9.1093837139e-31; // kg
export const G = 9.8; // m/s², el valor que usan los apuntes
export const E_LAB = 1.0e3; // N/C, «un valor modesto de laboratorio»
export const A_E = (QE * E_LAB) / ME; // aceleración del electrón, m/s²

// Placas paralelas: la de arriba positiva, la de abajo negativa, así el campo apunta hacia abajo (E = −E ŷ),
// como en las figuras 1.20 y 1.21 de los apuntes.
export type Placas = { x0: number; x1: number; y0: number; y1: number };
export const PL: Placas = { x0: 110, x1: 970, y0: 470, y1: 930 };

// Dibuja las placas, las líneas de campo (rectas, paralelas e igualmente espaciadas) con partículas que bajan,
// y un rótulo E a la derecha. kl permite encender las líneas después que las placas; brillo escala la intensidad.
export const placas = (ctx: Ctx, t: number, p: Placas, a: number, o: { kl?: number; n?: number; vel?: number; brilloLineas?: number; etiqueta?: boolean } = {}) => {
  if (a <= 0.01) return;
  const kl = (o.kl ?? 1) * a;
  const n = o.n ?? 9;
  const b = o.brilloLineas ?? 1;
  const paso = (p.x1 - p.x0) / n;
  for (let i = 0; i < n; i++) {
    const x = p.x0 + paso * (i + 0.5);
    const pts: Pt[] = [[x, p.y0 + 10], [x, p.y1 - 10]];
    linea(ctx, pts, RGB.hielo, 0.16 * kl * b, 1);
    particulas(ctx, pts, t, o.vel ?? 70, 3, RGB.hielo, 0.6 * kl * b, i * 3 + 7, 1.4);
    // Punta de flecha a media altura, apuntando hacia abajo.
    const ym = (p.y0 + p.y1) / 2;
    ctx.save();
    ctx.fillStyle = rgba(RGB.hielo, 0.35 * kl * b);
    ctx.beginPath();
    ctx.moveTo(x, ym + 6);
    ctx.lineTo(x - 5, ym - 4);
    ctx.lineTo(x + 5, ym - 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  barraLuz(ctx, p.x0, p.y0, p.x1, p.y0, RGB.pos, a, t, 4);
  barraLuz(ctx, p.x0, p.y1, p.x1, p.y1, RGB.neg, a, t, 4);
  for (let i = 0; i < n; i++) {
    const x = p.x0 + paso * (i + 0.5);
    rotulo(ctx, "+", x, p.y0 - 24, { a: 0.8 * a, size: 16, rgb: RGB.pos, align: "center" });
    rotulo(ctx, "−", x, p.y1 + 24, { a: 0.8 * a, size: 16, rgb: RGB.neg, align: "center" });
  }
  if (o.etiqueta !== false) {
    const xe = p.x1 + 40;
    flecha(ctx, xe, p.y0 + 60, xe, p.y0 + 150, RGB.hielo, 0.7 * kl, 2, 12);
    variable(ctx, "E", "", xe + 2, p.y0 + 36, 30, RGB.hielo, 0.85 * kl, "center");
  }
};

// Rastro de una trayectoria: línea con brillo que se desvanece hacia atrás.
export const rastro = (ctx: Ctx, pts: Pt[], rgb: string, a: number, ancho = 2) => {
  if (a <= 0.01 || pts.length < 2) return;
  const n = pts.length;
  for (let i = 1; i < n; i++) {
    const f = 0.25 + 0.75 * (i / n);
    linea(ctx, [pts[i - 1], pts[i]], rgb, a * f * 0.9, ancho);
  }
};

// Puntos de una trayectoria con aceleración constante, de s = 0 a s = s1 (s en segundos de animación).
export const camino = (x0: number, y0: number, vx: number, vy: number, ax: number, ay: number, s1: number, n = 60): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const s = (s1 * i) / n;
    return [x0 + vx * s + 0.5 * ax * s * s, y0 + vy * s + 0.5 * ay * s * s] as Pt;
  });

// Estela de puntos a intervalos iguales de tiempo (estroboscopio).
export const estrobo = (ctx: Ctx, pts: Pt[], rgb: string, a: number) => pts.forEach(([x, y]) => chispa(ctx, x, y, 2.6, rgb, a));

// Número en notación científica para KaTeX, con coma decimal: 1,8 × 10^{14}.
export const cient = (v: number, cifras = 2) => {
  const exp = Math.floor(Math.log10(Math.abs(v)));
  let m = v / Math.pow(10, exp);
  let e = exp;
  if (Number(m.toFixed(cifras - 1)) >= 10) {
    m /= 10;
    e += 1;
  }
  const mant = m.toFixed(cifras - 1).replace(".", "{,}");
  return e === 0 ? mant : `${mant}\\times10^{${e}}`;
};

// Potencia de diez en el canvas: mantisa opcional, «×10» y el exponente chico y arriba (las fuentes mono no
// traen superíndices). align: dónde queda x respecto del texto completo.
export const potencia = (ctx: Ctx, mant: string, exp: number, x: number, y: number, size: number, rgb: string, a = 1, align: "left" | "right" | "center" = "left") => {
  if (a <= 0.01) return;
  ctx.save();
  const base = (mant ? `${mant}×` : "") + "10";
  const sup = String(exp).replace("-", "−");
  ctx.font = `500 ${size}px "Space Grotesk"`;
  const wb = ctx.measureText(base).width;
  ctx.font = `500 ${size * 0.62}px "Space Grotesk"`;
  const ws = ctx.measureText(sup).width;
  const total = wb + ws + 2;
  const x0 = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  ctx.fillStyle = rgba(rgb, a);
  ctx.textBaseline = "middle";
  ctx.font = `500 ${size}px "Space Grotesk"`;
  ctx.fillText(base, x0, y);
  ctx.font = `500 ${size * 0.62}px "Space Grotesk"`;
  ctx.fillText(sup, x0 + wb + 2, y - size * 0.38);
  ctx.restore();
};

// Mantisa y exponente con coma decimal: 1,8 y 14.
export const partes = (v: number, cifras = 2): [string, number] => {
  let e = Math.floor(Math.log10(Math.abs(v)));
  let m = v / Math.pow(10, e);
  if (Number(m.toFixed(cifras - 1)) >= 10) {
    m /= 10;
    e += 1;
  }
  return [m.toFixed(cifras - 1).replace(".", ","), e];
};
