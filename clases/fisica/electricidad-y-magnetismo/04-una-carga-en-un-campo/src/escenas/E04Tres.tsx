import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { carga, chispa, flecha, variable } from "../lab/luz";
import { PL, camino, placas, rastro } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 4;
const T_VEL = w(E, "velocidad");
const T_POS = w(E, "positiva");
const T_NEU = w(E, "neutra");
const T_NEG = w(E, "negativa");
export const sfx04: Sfx[] = [
  [E, T_POS - 0.4, "tic"],
  [E, T_NEU - 0.4, "tic"],
  [E, T_NEG - 0.4, "tic"],
];

// Misma masa, mismo |q| y misma velocidad inicial horizontal; el campo apunta hacia abajo (figura 1.20).
const X0 = PL.x0 + 20;
const Y0 = (PL.y0 + PL.y1) / 2;
const D = 1.8; // s de animación para cruzar
const VX = (PL.x1 - 20 - X0) / D;
const AY = (2 * 190) / (D * D); // px/s² que representan |q|E/m
const GAP = PL.y1 - PL.y0;
// signo de q: +1, 0, −1. En el canvas y crece hacia abajo: a_y(canvas) = +signo·AY.
const CASOS = [
  { signo: 1, rgb: RGB.pos, nombre: "+q", hud: "positiva", t0: T_POS - 0.4 },
  { signo: 0, rgb: RGB.blanco, nombre: "q = 0", hud: "neutra", t0: T_NEU - 0.4 },
  { signo: -1, rgb: RGB.neg, nombre: "−q", hud: "negativa", t0: T_NEG - 0.4 },
];
const sEn = (t: number, t0: number) => Math.min(D, Math.max(0, t - t0));
const yEn = (signo: number, s: number) => Y0 + 0.5 * signo * AY * s * s;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.9));
  placas(ctx, t, PL, ka, { etiqueta: false });
  const kv = eOut(pr(t, T_VEL - 0.6, 0.6));
  chispa(ctx, X0, Y0, 4, RGB.blanco, kv);
  flecha(ctx, X0, Y0, X0 + 110 * kv, Y0, RGB.blanco, kv * 0.8, 2.5, 14);
  variable(ctx, "v", "0", X0 + 50, Y0 - 26, 28, RGB.blanco, kv * 0.9, "center");
  CASOS.forEach((c) => {
    if (t < c.t0) return;
    const s = sEn(t, c.t0);
    const pts = camino(X0, Y0, VX, 0, 0, c.signo * AY, s, 70);
    rastro(ctx, pts, c.rgb, 0.85, 2.2);
    const [x, y] = pts[pts.length - 1];
    const sale = eOut(pr(t, c.t0 + D, 0.4));
    if (c.signo === 0) chispa(ctx, x, y, 6, RGB.blanco, 1 - sale);
    else carga(ctx, x, y, 10, c.rgb, 1 - sale, t);
    const kr = eOut(pr(t, c.t0 + D * 0.8, 0.5));
    variable(ctx, c.nombre, "", PL.x1 + 14, yEn(c.signo, D), 24, c.rgb, kr);
  });
};

export const Tres: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  // Desvío vertical de cada una (hacia arriba es positivo), en unidades de la separación d entre placas.
  const desvio = (signo: number, t0: number) => -(yEn(signo, sEn(t, t0)) - Y0) / GAP;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Misma masa, misma velocidad: *el signo las separa*" />
      <Hud
        t0={T_POS}
        items={CASOS.map((c, i) => ({ l: `Desvío ${c.hud}`, v: num(desvio(c.signo, c.t0), 2), u: "d", azul: i !== 1, t: c.t0 + 0.2 }))}
      />
    </Escena>
  );
};
