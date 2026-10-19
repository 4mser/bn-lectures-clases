import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { barraLuz, carga, linea, particulas, trazar, type Fuente, type Pt } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 5;
const T_INF = w(E, "infinitos");
const T_INF2 = w(E, "infinitamente");
const T_PEQ = w(E, "pequenos");
const T_INT = w(E, "integral");
export const sfx05: Sfx[] = [
  [E, T_PEQ, "tic"],
  [E, T_INT, "check"],
];

const X0 = 150;
const X1 = 930;
const YB = 700;
const PASOS: [number, number][] = [
  [0, 16],
  [T_INF, 32],
  [T_INF2, 128],
];

// Líneas de campo de la barra continua (40 cargas iguales a lo largo): arriba, abajo y alrededor de las puntas.
const FUENTES: Fuente[] = Array.from({ length: 40 }, (_, i) => ({ x: lerp(X0, X1, (i + 0.5) / 40), y: YB, q: 1 / 40 }));
const CAJA: [number, number, number, number] = [-60, 330, 1140, 1040];
const SEMILLAS: Pt[] = [
  ...Array.from({ length: 10 }, (_, i): Pt => [lerp(X0, X1, (i + 0.5) / 10), YB - 6]),
  ...Array.from({ length: 10 }, (_, i): Pt => [lerp(X0, X1, (i + 0.5) / 10), YB + 6]),
  ...[-1, 1].flatMap((lado) => [-0.9, -0.45, 0, 0.45, 0.9].map((a): Pt => [(lado < 0 ? X0 : X1) + lado * 7 * Math.cos(a), YB + 7 * Math.sin(a)])),
];
const LINEAS = SEMILLAS.map(([x, y]) => trazar(FUENTES, x, y, 1, 120, 6, CAJA));

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kc = eIO(pr(t, T_PEQ - 0.1, 0.8));
  PASOS.forEach(([t0, n], i) => {
    const entra = i === 0 ? eOut(pr(t, 0, 0.4)) : eOut(pr(t, t0, 0.4));
    const sale = i + 1 < PASOS.length ? eIO(pr(t, PASOS[i + 1][0], 0.3)) : kc;
    const a = entra * (1 - sale);
    if (a <= 0.01) return;
    for (let k = 0; k < n; k++) carga(ctx, lerp(X0, X1, (k + 0.5) / n), YB, lerp(6, 2.4, Math.log2(n / 16) / 3), RGB.pos, a, t);
  });
  barraLuz(ctx, X0, YB, X1, YB, RGB.pos, kc, t, 5);
  const kl = eOut(pr(t, T_INT - 0.2, 1.6));
  LINEAS.forEach((pts, i) => {
    const corte = pts.slice(0, Math.max(2, Math.round(pts.length * kl)));
    linea(ctx, corte, RGB.hielo, 0.16 * kl, 1);
    particulas(ctx, corte, t, 70, 3, RGB.hielo, 0.7 * kl, i + 11, 1.4);
  });
};

export const Integral: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const n = PASOS.reduce((m, [t0, k]) => (t >= t0 ? k : m), 16);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Infinitos trozos: *la suma se vuelve integral*" />
      <Formula tex="\vec E=\sum_i k\,\frac{\Delta q_i}{r_i^{2}}\,\hat r_i" t0={0.6} top={930} size={54} tFin={T_INT - 0.35} />
      <Formula tex="\vec E=\int k\,\frac{dq}{r^{2}}\,\hat r" t0={T_INT} top={930} size={54} color="#FFFFFF" />
      <Hud t0={0.8} items={[{ l: "Trozos", v: t >= T_PEQ ? <Tex tex="\infty" size={50} color={C.azul} /> : String(n), azul: t >= T_PEQ }]} />
    </Escena>
  );
};
