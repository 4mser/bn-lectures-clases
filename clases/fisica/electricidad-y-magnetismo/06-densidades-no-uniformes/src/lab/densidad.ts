// Distribuciones con densidad variable: el brillo, el grosor y la cantidad de chispas siguen a λ.
// dens(u) devuelve la densidad relativa en [0, 1] para u ∈ [0, 1] a lo largo del trazo.
import { RGB } from "../theme";
import { azar, brillo, chispa, linea, rgba, type Pt } from "./luz";

type Ctx = CanvasRenderingContext2D;

// Trazo cargado a lo largo de camino(u) (u de 0 a 1). hasta: fracción encendida (para barridos); lo demás queda tenue.
export const trazoDensidad = (
  ctx: Ctx,
  camino: (u: number) => Pt,
  dens: (u: number) => number,
  a: number,
  t: number,
  o: { grosor?: number; n?: number; rgb?: string; hasta?: number; chispas?: number; semilla?: number } = {},
) => {
  if (a <= 0.01) return;
  const n = o.n ?? 90;
  const g = o.grosor ?? 7;
  const rgb = o.rgb ?? RGB.pos;
  const hasta = o.hasta ?? 1;
  // Hilo guía tenue, para que se vea dónde está la distribución aunque λ sea casi cero.
  const guia: Pt[] = Array.from({ length: n + 1 }, (_, i) => camino(i / n));
  linea(ctx, guia, RGB.blanco, 0.14 * a, 1, [3, 6]);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "butt";
  for (let i = 0; i < n; i++) {
    const u0 = i / n;
    const u1 = (i + 1) / n;
    const um = (u0 + u1) / 2;
    const d = Math.max(0, dens(um));
    const enc = um <= hasta ? 1 : 0.18;
    const p0 = camino(u0);
    const p1 = camino(u1);
    for (const [ancho, alfa] of [[g * 5, 0.07], [g * 2.2, 0.22], [g * 0.9, 0.85]] as const) {
      ctx.strokeStyle = rgba(rgb, alfa * a * enc * (0.06 + 0.94 * d * d));
      ctx.lineWidth = ancho * (0.12 + 0.88 * d);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
    }
    ctx.strokeStyle = rgba("235,242,255", 0.85 * a * enc * d * d);
    ctx.lineWidth = g * 0.3 * (0.3 + 0.7 * d);
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.stroke();
  }
  ctx.restore();
  // Chispas: más donde hay más carga (muestreo por rechazo, determinista).
  const m = o.chispas ?? 70;
  const s = o.semilla ?? 0;
  for (let k = 0; k < m; k++) {
    const u = azar(k * 3.1 + 5 + s);
    if (azar(k * 7.7 + 1 + s) > dens(u)) continue;
    const [x, y] = camino(u);
    const titila = 0.5 + 0.5 * Math.sin(t * (1.5 + 2 * azar(k)) + k);
    chispa(ctx, x, y, 1.4, rgb, a * 0.85 * titila * (u <= hasta ? 1 : 0.2));
  }
};

// Gráfico chico de una función f(u) ∈ [0, 1] sobre [x0, x1], con base en yBase y alto «alto».
// relleno: hasta qué u se rellena el área bajo la curva (para mostrar la integral que se acumula).
export const grafico = (ctx: Ctx, x0: number, x1: number, yBase: number, alto: number, f: (u: number) => number, a: number, relleno = 0, rgb = RGB.azul) => {
  if (a <= 0.01) return;
  linea(ctx, [[x0 - 10, yBase], [x1 + 16, yBase]], RGB.blanco, 0.3 * a, 1);
  linea(ctx, [[x0, yBase + 6], [x0, yBase - alto - 16]], RGB.blanco, 0.3 * a, 1);
  const n = 120;
  const pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, yBase - alto * f(i / n)]);
  if (relleno > 0.001) {
    const m = Math.max(1, Math.round(n * Math.min(1, relleno)));
    ctx.save();
    ctx.fillStyle = rgba(rgb, 0.22 * a);
    ctx.beginPath();
    ctx.moveTo(x0, yBase);
    for (let i = 0; i <= m; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.lineTo(pts[m][0], yBase);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    linea(ctx, [[pts[m][0], yBase], pts[m]], rgb, 0.8 * a, 1.5);
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  linea(ctx, pts, rgb, 0.25 * a, 6);
  ctx.restore();
  linea(ctx, pts, rgb, a, 2);
};

// Marca de dq: un tramo resaltado en blanco con su halo.
export const marcaDq = (ctx: Ctx, p0: Pt, p1: Pt, a: number) => {
  if (a <= 0.01) return;
  linea(ctx, [p0, p1], "250,252,255", a, 8);
  brillo(ctx, (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, 44, RGB.blanco, 0.4 * a);
};
