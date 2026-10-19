import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { brillo, flecha, linea, particulas, rgba, rotulo, variable } from "../lab/luz";
import { signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 10;
const T_GOTITAS = w(E, "gotitas");
const T_AJUSTO = w(E, "ajustó");
const T_SUSP = w(E, "suspendida");
const T_ELECTRICA = w(E, "eléctrica");
const T_GE = w(E, "ge");
export const sfx10: Sfx[] = [
  [E, T_GOTITAS, "tic"],
  [E, T_SUSP, "check"],
  [E, T_GE, "tic"],
];

const X0 = 180;
const X1 = 900;
const YA = 440; // placa de arriba (+)
const YB = 880; // placa de abajo (−)
const V_LIM = 60; // px/s: velocidad límite de la gota con el campo apagado

// qE/mg de la gota observada: el campo sube desde «ajustó» hasta dejarla suspendida.
const razon = (t: number) => eIO(pr(t, T_AJUSTO, T_SUSP - T_AJUSTO));
// Gotas: la observada (f = 1) y otras con otra carga (f = q/q_observada, entero: 0, 2, 3…).
const GOTAS = [
  { x: 540, y0: 500, f: 1, r: 9, t0: 0.5 },
  { x: 300, y0: 470, f: 2, r: 6, t0: T_GOTITAS },
  { x: 410, y0: 520, f: 0, r: 5, t0: T_GOTITAS + 0.3 },
  { x: 680, y0: 470, f: 3, r: 6, t0: T_GOTITAS + 0.15 },
  { x: 790, y0: 540, f: 2, r: 5, t0: T_GOTITAS + 0.45 },
];
// Velocidad terminal (hacia abajo positiva): proporcional a la fuerza neta, mg − qE.
const altura = (g: (typeof GOTAS)[number], t: number) => {
  let y = g.y0;
  const h = 1 / 60;
  for (let s = g.t0; s < t; s += h) {
    y += V_LIM * (1 - g.f * razon(s)) * h;
    y = Math.min(YB - g.r - 4, Math.max(YA + g.r + 4, y));
  }
  return y;
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  const q = razon(t);
  // Campo entre las placas: líneas verticales de + a −, más intensas a medida que sube.
  for (let i = 0; i < 12; i++) {
    const x = lerp(X0 + 30, X1 - 30, i / 11);
    linea(ctx, [[x, YA + 8], [x, YB - 8]], RGB.hielo, 0.12 * q * k, 1);
    particulas(ctx, [[x, YA + 8], [x, YB - 8]], t, 90, 3, RGB.hielo, 0.6 * q * k, i + 4, 1.3);
  }
  // Placas.
  for (const [y, pos] of [[YA, true], [YB, false]] as const) {
    ctx.save();
    ctx.fillStyle = rgba(pos ? RGB.pos : RGB.neg, 0.25 * k);
    ctx.fillRect(X0, y - 6, X1 - X0, 12);
    ctx.restore();
    linea(ctx, [[X0, y], [X1, y]], pos ? RGB.pos : RGB.neg, 0.9 * k, 2);
    for (let j = 0; j < 9; j++) signo(ctx, lerp(X0 + 30, X1 - 30, j / 8), y + (pos ? -24 : 24), 7, pos, k * lerp(0.35, 1, q));
  }
  // Agujero por donde entran las gotas.
  ctx.save();
  ctx.fillStyle = "#020306";
  ctx.fillRect(520, YA - 8, 40, 16);
  ctx.restore();
  // Gotas.
  GOTAS.forEach((g, i) => {
    const kg = eOut(pr(t, g.t0, 0.5));
    if (kg <= 0.01) return;
    const y = altura(g, t);
    const obs = i === 0;
    brillo(ctx, g.x, y, g.r * 5, "255,214,130", 0.4 * kg);
    ctx.save();
    ctx.fillStyle = rgba("255,214,130", (obs ? 0.95 : 0.6) * kg);
    ctx.beginPath();
    ctx.arc(g.x, y, g.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (obs) {
      // Peso (blanco, fijo) y fuerza eléctrica (azul, crece con el campo).
      const L = 110;
      const kp = eOut(pr(t, T_AJUSTO - 0.5, 0.5));
      flecha(ctx, g.x + 26, y, g.x + 26, y + L * kp, RGB.blanco, kp * 0.9, 3, 16);
      flecha(ctx, g.x - 26, y, g.x - 26, y - L * q, RGB.azul, kp, 3, 16);
      variable(ctx, "mg", "", g.x + 44, y + L * 0.7, 28, RGB.blanco, kp);
      variable(ctx, "qE", "", g.x - 44, y - L * 0.7, 28, RGB.azul, eOut(pr(t, T_AJUSTO + 0.6, 0.5)), "right");
      signo(ctx, g.x, y - g.r - 14, 6, false, kg);
    }
  });
  rotulo(ctx, "Robert Millikan · 1909–1913", 540, 392, { a: eOut(pr(t, 0.3, 0.7)), align: "center", size: 15 });
  rotulo(ctx, "Gota suspendida", 540 + 60, altura(GOTAS[0], t) + 120, { a: eOut(pr(t, T_SUSP, 0.6)), align: "left", size: 14, rgb: RGB.hielo });
};

export const Millikan: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const q = razon(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="La gota quieta: *fuerza eléctrica igual al peso*" />
      <Formula tex="qE=mg\quad\Longrightarrow\quad q=\frac{mg}{E}" t0={T_ELECTRICA} top={940} size={40} />
      <Hud
        t0={T_AJUSTO}
        items={[
          { l: "Fuerza eléctrica ÷ peso", v: num(q), azul: true },
          { l: "Velocidad ÷ v límite", v: num(1 - q), t: T_AJUSTO + 0.15 },
        ]}
      />
    </Escena>
  );
};
