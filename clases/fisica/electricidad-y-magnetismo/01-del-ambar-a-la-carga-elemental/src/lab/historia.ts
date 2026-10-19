// Piezas de dibujo para la historia de la carga: cargas con su signo, hitos de la línea de tiempo,
// potencias de diez en el lienzo y constantes. Todo es función pura de sus argumentos (incluido t).
import { MONO, RGB, SANS } from "../theme";
import { TAU, brillo, linea, rgba } from "./luz";

type Ctx = CanvasRenderingContext2D;

// Carga elemental (CODATA, exacta por definición del SI desde 2019).
export const E_CARGA = 1.602176634e-19;
// Año de referencia para «hace cuántos años» (el del curso).
export const AHORA = 2026;

// Carga con su signo: halo de su color (azul +, ámbar −), disco y el signo en blanco.
export const signo = (ctx: Ctx, x: number, y: number, r: number, positivo: boolean, a = 1) => {
  if (a <= 0.01) return;
  const rgb = positivo ? RGB.pos : RGB.neg;
  brillo(ctx, x, y, r * 4.2, rgb, 0.5 * a);
  ctx.save();
  ctx.fillStyle = rgba(rgb, 0.92 * a);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba("250,252,255", a);
  ctx.lineWidth = Math.max(1.4, r * 0.26);
  ctx.lineCap = "round";
  const l = r * 0.55;
  ctx.beginPath();
  ctx.moveTo(x - l, y);
  ctx.lineTo(x + l, y);
  if (positivo) {
    ctx.moveTo(x, y - l);
    ctx.lineTo(x, y + l);
  }
  ctx.stroke();
  ctx.restore();
};

// Hito de la línea de tiempo: año grande y nombre en mono debajo.
export const hito = (ctx: Ctx, anio: string, nombre: string, x: number, y: number, a = 1, align: CanvasTextAlign = "center", azul = false) => {
  if (a <= 0.01) return;
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 46px "${SANS}"`;
  ctx.letterSpacing = "-1px";
  ctx.fillStyle = rgba(azul ? RGB.azul : RGB.blanco, a);
  ctx.fillText(anio, x, y);
  ctx.font = `400 15px "${MONO}"`;
  ctx.letterSpacing = "2.7px";
  ctx.fillStyle = rgba(RGB.blanco, 0.62 * a);
  ctx.fillText(nombre.toUpperCase(), x, y + 32);
  ctx.restore();
};

// «m × 10^e» en el lienzo, con la potencia en superíndice (fuente de KaTeX, como las fórmulas).
export const potencia = (ctx: Ctx, mant: string, exp: number, x: number, y: number, size: number, rgb: string, a = 1, align: CanvasTextAlign = "left", unidad = "") => {
  if (a <= 0.01) return;
  ctx.save();
  ctx.textBaseline = "middle";
  const base = mant ? `${mant} × 10` : "10";
  const sup = String(exp).replace("-", "−");
  const cola = unidad ? ` ${unidad}` : "";
  ctx.font = `${size}px KaTeX_Main`;
  const wb = ctx.measureText(base).width;
  const wc = ctx.measureText(cola).width;
  ctx.font = `${size * 0.66}px KaTeX_Main`;
  const ws = ctx.measureText(sup).width;
  const total = wb + ws + 2 + wc;
  const x0 = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  ctx.fillStyle = rgba(rgb, a);
  ctx.font = `${size}px KaTeX_Main`;
  ctx.fillText(base, x0, y);
  if (cola) ctx.fillText(cola, x0 + wb + ws + 2, y);
  ctx.font = `${size * 0.66}px KaTeX_Main`;
  ctx.fillText(sup, x0 + wb + 2, y - size * 0.38);
  ctx.restore();
};

// Mantisa y exponente de un número positivo, con coma decimal: 6,24 y 18.
export const cientifica = (v: number, d = 2): [string, number] => {
  let e = Math.floor(Math.log10(v));
  let m = v / Math.pow(10, e);
  if (Number(m.toFixed(d)) >= 10) {
    m /= 10;
    e += 1;
  }
  return [m.toFixed(d).replace(".", ","), e];
};
// Lo mismo en KaTeX, para el HUD: 6{,}24\times10^{18}.
export const cientificaTex = (v: number, d = 2) => {
  const [m, e] = cientifica(v, d);
  return `${m.replace(",", "{,}")}\\times10^{${e}}`;
};
// Entero con espacios de miles: 6 241 509 074.
export const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Rótulo en Space Grotesk (para palabras sueltas sobre la simulación).
export const palabra = (ctx: Ctx, s: string, x: number, y: number, size: number, rgb: string, a = 1, align: CanvasTextAlign = "center", peso = 500) => {
  if (a <= 0.01) return;
  ctx.save();
  ctx.font = `${peso} ${size}px "${SANS}"`;
  ctx.letterSpacing = `${-size * 0.02}px`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(rgb, a);
  ctx.fillText(s, x, y);
  ctx.restore();
};

// Esfera con volumen: degradado radial del color dado y un borde tenue.
export const esfera = (ctx: Ctx, x: number, y: number, r: number, rgb: string, a = 1, borde = 0.5) => {
  if (a <= 0.01 || r <= 0) return;
  ctx.save();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, rgba(rgb, 0.55 * a));
  g.addColorStop(0.6, rgba(rgb, 0.2 * a));
  g.addColorStop(1, rgba(rgb, 0.08 * a));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(rgb, borde * a);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
};

// Símbolo de tierra: tres rayas que se acortan.
export const tierra = (ctx: Ctx, x: number, y: number, a = 1) => {
  if (a <= 0.01) return;
  [34, 22, 10].forEach((l, i) => linea(ctx, [[x - l, y + i * 9], [x + l, y + i * 9]], RGB.blanco, 0.75 * a, 2));
};
