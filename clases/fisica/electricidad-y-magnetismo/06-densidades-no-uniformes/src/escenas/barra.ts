// Geometría compartida del ejercicio 1 (§3): eje x horizontal, P en el origen y la barra entre a y b.
import { RGB } from "../theme";
import { flecha, linea, puntoP, rotulo, variable, type Pt } from "../lab/luz";
import { A, B, campo1 } from "../fisica";

export const PX = 320; // origen (P) en pantalla
export const YB = 720; // altura del eje
export const ESC = 2200; // px por metro
export const xpx = (x: number) => PX + x * ESC;
export const camino = (a: number, b: number) => (u: number): Pt => [xpx(a + (b - a) * u), YB];
// Densidad relativa λ(x)/λ(b) en el punto u del tramo [a, b].
export const densidad = (a: number, b: number) => (u: number) => (a + (b - a) * u) / B;
// px por N/C en las flechas de campo: el resultado del ejercicio mide 200 px.
export const FESC = 200 / campo1(A, B);

// Eje x con su flecha, marcas en a y b y el punto P en el origen.
export const ejes = (ctx: CanvasRenderingContext2D, k: number, b = B, conP = true) => {
  if (k <= 0.01) return;
  linea(ctx, [[60, YB], [1000, YB]], RGB.blanco, 0.28 * k, 1);
  flecha(ctx, 990, YB, 1018, YB, RGB.blanco, 0.4 * k, 1, 10);
  variable(ctx, "x", "", 1012, YB + 30, 28, RGB.blanco, 0.8 * k, "center");
  for (const [x, s] of [[A, "a"], [b, "b"]] as const) {
    linea(ctx, [[xpx(x), YB + 16], [xpx(x), YB + 30]], RGB.blanco, 0.5 * k, 1.2);
    // Si b se acerca a a, su rótulo se corre a la derecha para no taparlo.
    const xr = s === "b" ? Math.max(xpx(x), xpx(A) + 34) : xpx(x);
    variable(ctx, s, "", xr, YB + 56, 28, RGB.blanco, 0.85 * k, "center");
  }
  if (conP) puntoP(ctx, PX, YB, k, "P", -8, -34);
};

// Campo en P: hacia −x, con su largo en px.
export const flechaCampo = (ctx: CanvasRenderingContext2D, e: number, k: number, y = YB, rgb = RGB.azul) => flecha(ctx, PX, y, PX - e * FESC, y, rgb, k, 5, 24);

export const rotuloCampo = (ctx: CanvasRenderingContext2D, s: string, y: number, k: number) => rotulo(ctx, s, PX + 26, y, { a: k, size: 14 });
