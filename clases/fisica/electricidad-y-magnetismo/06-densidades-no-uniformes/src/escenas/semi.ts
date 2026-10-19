// Geometría compartida del ejercicio 2 (§4): semicírculo de radio R centrado en P, θ medido desde el eje y.
import { RGB } from "../theme";
import { angulo, flecha, linea, puntoP, variable, type Pt } from "../lab/luz";
import { E2 } from "../fisica";

export const CX = 540;
export const CY = 740;
export const RPX = 280;
export const thetaDe = (u: number) => -Math.PI / 2 + Math.PI * u;
// Un elemento en θ está en R(sin θ, cos θ): en pantalla, y hacia arriba es negativo.
export const enArco = (th: number, r = RPX): Pt => [CX + r * Math.sin(th), CY - r * Math.cos(th)];
export const camino = (u: number) => enArco(thetaDe(u));
export const dens = (u: number) => Math.cos(thetaDe(u));
// px por N/C en las flechas de campo: el resultado del ejercicio mide 190 px.
export const FESC = 190 / E2;

export const ejes = (ctx: CanvasRenderingContext2D, k: number, conP = true) => {
  if (k <= 0.01) return;
  linea(ctx, [[CX - RPX - 70, CY], [CX + RPX + 70, CY]], RGB.blanco, 0.22 * k, 1);
  linea(ctx, [[CX, CY + 230], [CX, CY - RPX - 60]], RGB.blanco, 0.22 * k, 1);
  flecha(ctx, CX + RPX + 60, CY, CX + RPX + 84, CY, RGB.blanco, 0.4 * k, 1, 10);
  flecha(ctx, CX, CY - RPX - 50, CX, CY - RPX - 74, RGB.blanco, 0.4 * k, 1, 10);
  variable(ctx, "x", "", CX + RPX + 80, CY + 28, 28, RGB.blanco, 0.8 * k, "center");
  variable(ctx, "y", "", CX - 26, CY - RPX - 66, 28, RGB.blanco, 0.8 * k, "center");
  if (conP) puntoP(ctx, CX, CY, k, "P", 18, 28);
};

// Ángulo θ desde el eje y hasta el elemento en th.
export const anguloTheta = (ctx: CanvasRenderingContext2D, th: number, k: number) => {
  if (k <= 0.01) return;
  linea(ctx, [[CX, CY], enArco(th)], RGB.blanco, 0.35 * k, 1, [3, 6]);
  angulo(ctx, CX, CY, 70, -Math.PI / 2, -Math.PI / 2 + th, RGB.blanco, 0.6 * k);
  const [x, y] = enArco(th / 2, 98);
  variable(ctx, "θ", "", x, y, 28, RGB.blanco, k, "center");
};
