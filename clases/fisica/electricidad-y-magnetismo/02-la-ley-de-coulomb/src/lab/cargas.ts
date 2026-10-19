// Piezas del video de la ley de Coulomb: carga con su color según el signo, fuerza sobre una carga y esfera cargada.
import { RGB } from "../theme";
import { azar, brillo, carga, chispa, flecha, rgba, TAU } from "./luz";

type Ctx = CanvasRenderingContext2D;

// Carga puntual: azul si es positiva, ámbar si es negativa. s es el tamaño (crece con √|q| si se quiere).
export const cargaQ = (ctx: Ctx, x: number, y: number, s: number, q: number, a = 1, t = 0) =>
  carga(ctx, x, y, s, q >= 0 ? RGB.pos : RGB.neg, a, t);

// Fuerza sobre la carga en (x, y): flecha en la dirección (ux, uy) de largo con signo `largo`,
// que arranca a `sep` px del centro (para no tapar la carga). largo < 0 la invierte.
export const fuerza = (ctx: Ctx, x: number, y: number, ux: number, uy: number, largo: number, rgb: string, a = 1, sep = 22, ancho = 3.2, cabeza = 18) => {
  if (Math.abs(largo) < 0.5) return;
  const s = Math.sign(largo);
  const x0 = x + ux * sep * s;
  const y0 = y + uy * sep * s;
  flecha(ctx, x0, y0, x0 + ux * largo, y0 + uy * largo, rgb, a, ancho, cabeza);
};

// Esfera cargada de radio R: disco tenue con borde y cargas que titilan adentro.
export const esfera = (ctx: Ctx, x: number, y: number, R: number, rgb: string, a: number, t: number, semilla = 0) => {
  if (a <= 0.01 || R <= 0.5) return;
  brillo(ctx, x, y, R * 1.8, rgb, 0.22 * a);
  ctx.save();
  ctx.fillStyle = rgba(rgb, 0.16 * a);
  ctx.strokeStyle = rgba(rgb, 0.75 * a);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  const n = Math.max(4, Math.min(40, Math.round(R / 2.5)));
  for (let j = 0; j < n; j++) {
    const r = R * 0.85 * Math.sqrt(azar(semilla + j * 1.7));
    const ang = TAU * azar(semilla + j * 3.3 + 1);
    chispa(ctx, x + r * Math.cos(ang), y + r * Math.sin(ang), Math.max(0.8, Math.min(1.8, R / 30)), rgb, a * (0.55 + 0.45 * Math.sin(t * 2.2 + j)));
  }
};

// Masa: esfera blanca sin destello en cruz (para la gravitación).
export const masa = (ctx: Ctx, x: number, y: number, s: number, a = 1) => {
  if (a <= 0.01) return;
  brillo(ctx, x, y, s * 6, RGB.blanco, 0.18 * a);
  ctx.save();
  const g = ctx.createRadialGradient(x - s * 0.35, y - s * 0.35, s * 0.1, x, y, s);
  g.addColorStop(0, rgba("250,250,252", 0.95 * a));
  g.addColorStop(1, rgba("150,155,170", 0.85 * a));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, s, 0, TAU);
  ctx.fill();
  ctx.restore();
};
