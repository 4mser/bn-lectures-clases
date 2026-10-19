import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { barraLuz, carga, flecha, linea, puntoP, rotulo } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 4;
const T_PARTE = w(E, "partimos");
const T_DOS = w(E, "dos");
const T_OCHO = w(E, "ocho");
const T_16 = w(E, "dieciseis");

// Barra de largo L con P en su mediatriz, a 0,1 L: el mismo caso que se revisó al escribir el guion.
const X0 = 110;
const X1 = 970;
const L = X1 - X0;
const YB = 900;
const ALTO = 0.1;
const P = { x: (X0 + X1) / 2, y: YB - ALTO * L };

// Campo vertical exacto en P y la suma de N cargas puntuales (regla del punto medio), en unidades kλ/L.
const EXACTO = (2 * (0.5 / Math.hypot(0.5, ALTO))) / ALTO;
const suma = (n: number) => {
  let s = 0;
  for (let i = 0; i < n; i++) {
    const x = -0.5 + (i + 0.5) / n;
    s += ((1 / n) * ALTO) / Math.pow(x * x + ALTO * ALTO, 1.5);
  }
  return s;
};
const ESCALA = 320 / EXACTO; // la flecha exacta mide 320 px

// Qué N se muestra en cada momento: 2 con «dos», 4 entre medio, 8 con «ocho» y 16 con «dieciséis».
const PASOS: [number, number][] = [
  [T_PARTE + 0.4, 2],
  [(T_DOS + T_OCHO) / 2 + 0.6, 4],
  [T_OCHO - 0.15, 8],
  [T_16 - 0.15, 16],
];
const nEn = (t: number) => PASOS.reduce((n, [t0, k]) => (t >= t0 ? k : n), 0);
const ERROR = (n: number) => (suma(n) / EXACTO - 1) * 100;
const fmtError = (e: number) => `${num(e, Math.abs(e) >= 10 ? 1 : Math.abs(e) >= 1 ? 2 : 3)} %`;

export const sfx04: Sfx[] = PASOS.map(([t0]): Sfx => [E, t0, "tic"]);

// Las N cargas de un paso, con sus aportes en P (finos) y la resultante (azul).
const trozos = (ctx: CanvasRenderingContext2D, t: number, n: number, a: number) => {
  if (a <= 0.01 || n === 0) return;
  for (let i = 0; i < n; i++) {
    const u = -0.5 + (i + 0.5) / n;
    const x = P.x + u * L;
    carga(ctx, x, YB, lerp(10, 5, Math.log2(n) / 4), RGB.pos, a, t);
    linea(ctx, [[x, YB], [P.x, P.y]], RGB.hielo, 0.12 * a, 1);
    const r = Math.hypot(u, ALTO);
    const k = ((1 / n) / (r * r)) * ESCALA;
    flecha(ctx, P.x, P.y, P.x - (u / r) * k, P.y - (ALTO / r) * k, RGB.hielo, 0.55 * a, 1.6, 11);
  }
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  // Al principio la barra es continua; con «partimos» se apaga y aparecen los trozos.
  const kb = eOut(pr(t, 0.1, 0.8)) * (1 - eIO(pr(t, T_PARTE, 0.6)));
  barraLuz(ctx, X0, YB, X1, YB, RGB.pos, kb, t, 5);
  linea(ctx, [[X0, YB], [X1, YB]], RGB.pos, 0.25 * (1 - kb) * eOut(pr(t, T_PARTE, 0.5)), 1, [3, 6]);
  // Cada cambio de N funde el paso anterior con el nuevo.
  PASOS.forEach(([t0, n], i) => {
    const sale = i + 1 < PASOS.length ? eIO(pr(t, PASOS[i + 1][0], 0.35)) : 0;
    trozos(ctx, t, n, eOut(pr(t, t0, 0.45)) * (1 - sale));
  });
  puntoP(ctx, P.x, P.y, eOut(pr(t, 0.5, 0.6)), "P", 22, -6);
  // Flecha exacta (fantasma punteado) y la resultante de la suma, que se acerca paso a paso.
  const ke = eOut(pr(t, T_PARTE + 0.2, 0.8));
  linea(ctx, [[P.x + 26, P.y], [P.x + 26, P.y - EXACTO * ESCALA]], RGB.blanco, 0.35 * ke, 1.5, [5, 6]);
  rotulo(ctx, "exacto", P.x + 40, P.y - EXACTO * ESCALA + 4, { a: ke, size: 14 });
  let largo = 0;
  PASOS.forEach(([t0, n], i) => {
    const antes = i === 0 ? 0 : suma(PASOS[i - 1][1]);
    largo = t >= t0 ? lerp(antes, suma(n), eIO(pr(t, t0, 0.5))) : largo;
  });
  const kr = eOut(pr(t, PASOS[0][0], 0.5));
  flecha(ctx, P.x, P.y, P.x, P.y - largo * ESCALA * kr, RGB.azul, kr, 5, 24);
};

export const Riemann: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const n = Math.max(2, nEn(t));
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Más trozos, más chicos: *la suma converge*" />
      <Hud
        t0={T_DOS - 0.3}
        items={[
          { l: "Trozos", v: String(n) },
          { l: "Suma / exacto", v: num(suma(n) / EXACTO, 3) },
          { l: "Error", v: fmtError(ERROR(n)), azul: true },
        ]}
      />
    </Escena>
  );
};
