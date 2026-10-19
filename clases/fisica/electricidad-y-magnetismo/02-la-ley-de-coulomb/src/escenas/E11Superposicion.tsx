import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { cargaQ } from "../lab/cargas";
import { flecha, linea, variable, type Fuente, type Pt } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 11;
const T_SUP = w(E, "superposicion");
const T_ENTRE = w(E, "entre");
const T_PRUEBA = w(E, "prueba");
const T_SUMA = w(E, "suma");
const T_VECT = w(E, "vectorial");
export const sfx11: Sfx[] = [
  [E, T_ENTRE, "tic"],
  [E, T_VECT + 0.5, "check"],
];

const CARGAS: Fuente[] = [
  { x: 210, y: 560, q: 1 },
  { x: 300, y: 900, q: -1.3 },
  { x: 800, y: 500, q: 0.8 },
  { x: 880, y: 860, q: 1.4 },
  { x: 560, y: 960, q: -0.7 },
];
const P = { x: 560, y: 700 };
const A = 300; // largo de referencia: fuerzas en unidades de k q₀ |q|/A²

// Fuerza de cada carga sobre q₀ (positiva): k qₙ q₀ (r − rₙ)/|r − rₙ|³, y su suma vectorial.
const APORTES: Pt[] = CARGAS.map((c) => {
  const dx = P.x - c.x;
  const dy = P.y - c.y;
  const r = Math.hypot(dx, dy);
  const k = (c.q * A * A) / (r * r * r);
  return [k * dx, k * dy];
});
const NETA: Pt = APORTES.reduce<Pt>((s, a) => [s[0] + a[0], s[1] + a[1]], [0, 0]);
const SUMA_LARGOS = APORTES.reduce((s, a) => s + Math.hypot(a[0], a[1]), 0);
const LARGO_NETA = Math.hypot(NETA[0], NETA[1]);
const ESCALA = 120 / Math.max(...APORTES.map((a) => Math.hypot(a[0], a[1])));

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  CARGAS.forEach((c, i) => {
    const k = eOut(pr(t, T_SUP - 0.6 + i * 0.12, 0.6));
    cargaQ(ctx, c.x, c.y, 10 * Math.sqrt(Math.abs(c.q)), c.q, k, t);
    variable(ctx, "q", String(i + 1), c.x + 30, c.y - 34, 26, RGB.blanco, 0.8 * k, "left");
  });
  const k0 = eOut(pr(t, 0.4, 0.6));
  cargaQ(ctx, P.x, P.y, 9, 1, k0, t);
  variable(ctx, "q", "0", P.x - 26, P.y - 34, 28, RGB.blanco, k0, "right");
  // Cada aporte sale de q₀; con «suma» se encadenan punta con cola y aparece la neta.
  let base: Pt = [P.x, P.y];
  APORTES.forEach((a, i) => {
    const ka = eOut(pr(t, T_ENTRE + i * 0.35, 0.6));
    const km = eIO(pr(t, T_SUMA + i * 0.22, 0.6));
    const x0 = lerp(P.x, base[0], km);
    const y0 = lerp(P.y, base[1], km);
    const c = CARGAS[i];
    const rgb = c.q > 0 ? RGB.hielo : RGB.neg;
    linea(ctx, [[c.x, c.y], [P.x, P.y]], rgb, 0.16 * ka * (1 - km), 1, [4, 6]);
    flecha(ctx, x0, y0, x0 + a[0] * ESCALA * ka, y0 + a[1] * ESCALA * ka, rgb, 0.9 * ka, 2.2, 14);
    base = [base[0] + a[0] * ESCALA, base[1] + a[1] * ESCALA];
  });
  const kr = eOut(pr(t, T_VECT, 0.8));
  flecha(ctx, P.x, P.y, P.x + NETA[0] * ESCALA * kr, P.y + NETA[1] * ESCALA * kr, RGB.azul, kr, 5, 24);
};

export const Superposicion: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Varias cargas: *se suman los vectores*" />
      <Formula tex="\vec F_{\text{neta}}=\textstyle\sum_{n}\vec F_n" t0={T_PRUEBA} top={335} size={44} />
      <Hud
        t0={T_SUMA}
        items={[
          { l: "Suma de los largos", v: num(SUMA_LARGOS), t: T_SUMA },
          { l: "Largo de la suma", v: num(LARGO_NETA), azul: true, t: T_VECT },
        ]}
      />
    </Escena>
  );
};
