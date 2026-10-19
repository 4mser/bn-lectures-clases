import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza } from "../lab/cargas";
import { flecha, linea, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 7;
const T_VECTOR = w(E, "vector");
const T_ERRE = w(E, "erre");
const T_NEG = w(E, "negativo");
const T_SIEMPRE = w(E, "siempre");
export const sfx07: Sfx[] = [
  [E, T_ERRE, "tic"],
  [E, T_NEG + 0.3, "alerta"],
  [E, T_SIEMPRE, "check"],
];

const O = { x: 140, y: 1000 };
const Q1 = { x: 560, y: 900 };
const RADIO = 280;
const LF = 100;

// q₂ da una vuelta lenta alrededor de q₁; con «negativo», cambia de signo.
const fi = (t: number, dur: number) => lerp(-2.15, -1.05, eIO(pr(t, 0.3, dur - 1.2)));
const signo = (t: number) => lerp(1, -1, eIO(pr(t, T_NEG, 0.9)));
const q2 = (t: number, dur: number) => ({ x: Q1.x + RADIO * Math.cos(fi(t, dur)), y: Q1.y + RADIO * Math.sin(fi(t, dur)) });

const paso = (dur: number) => (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  // Ejes.
  linea(ctx, [[O.x, O.y], [1010, O.y]], RGB.blanco, 0.35 * k, 1.2);
  linea(ctx, [[O.x, O.y], [O.x, 440]], RGB.blanco, 0.35 * k, 1.2);
  variable(ctx, "x", "", 1022, O.y, 28, RGB.blanco, 0.7 * k, "left");
  variable(ctx, "y", "", O.x, 418, 28, RGB.blanco, 0.7 * k, "center");
  variable(ctx, "O", "", O.x - 18, O.y + 26, 26, RGB.blanco, 0.7 * k, "right");
  const Q2 = q2(t, dur);
  const s = signo(t);
  // Posiciones desde el origen.
  const kv = eOut(pr(t, 0.5, 0.8));
  flecha(ctx, O.x, O.y, Q1.x, Q1.y, RGB.hielo, 0.45 * kv, 1.6, 13);
  flecha(ctx, O.x, O.y, Q2.x, Q2.y, RGB.hielo, 0.45 * kv, 1.6, 13);
  variable(ctx, "r", "1", (O.x + Q1.x) / 2 + 10, (O.y + Q1.y) / 2 + 28, 28, RGB.hielo, 0.8 * kv, "center");
  variable(ctx, "r", "2", (O.x + Q2.x) / 2 - 24, (O.y + Q2.y) / 2 - 20, 28, RGB.hielo, 0.8 * kv, "center");
  // Desplazamiento relativo, de 1 a 2.
  const dx = Q2.x - Q1.x;
  const dy = Q2.y - Q1.y;
  const d = Math.hypot(dx, dy);
  const ux = dx / d;
  const uy = dy / d;
  const k12 = eOut(pr(t, T_ERRE, 0.7));
  // r₁₂ va corrido a un lado de la recta para no tapar las fuerzas, que van sobre ella.
  const px = uy;
  const py = -ux;
  const off = 30;
  flecha(ctx, Q1.x + ux * 24 + px * off, Q1.y + uy * 24 + py * off, Q2.x - ux * 24 + px * off, Q2.y - uy * 24 + py * off, RGB.blanco, 0.85 * k12, 2, 15);
  variable(ctx, "r", "12", (Q1.x + Q2.x) / 2 + px * (off + 30), (Q1.y + Q2.y) / 2 + py * (off + 30), 30, RGB.blanco, k12, "center");
  cargaQ(ctx, Q1.x, Q1.y, 12, 1, k, t);
  cargaQ(ctx, Q2.x, Q2.y, 12, s, k, t);
  variable(ctx, "q", "1", Q1.x + px * 50 - ux * 30, Q1.y + py * 50 - uy * 30, 28, RGB.blanco, k, "center");
  variable(ctx, "q", "2", Q2.x - px * 46, Q2.y - py * 46, 28, RGB.blanco, k, "center");
  // Fuerzas: F₁₂ sobre q₂ en la dirección de r₁₂ por el signo de q₁q₂; F₂₁ = −F₁₂ sobre q₁.
  const kf = eOut(pr(t, T_VECTOR, 0.6));
  fuerza(ctx, Q2.x, Q2.y, ux, uy, LF * s * kf, RGB.azul, kf, 22, 3.4, 18);
  fuerza(ctx, Q1.x, Q1.y, -ux, -uy, LF * s * kf, RGB.azul, kf, 22, 3.4, 18);
  // Rótulos de las fuerzas al otro lado de la recta, a media flecha.
  const m = 22 + (LF * Math.abs(s)) / 2;
  const ks = kf * eOut(pr(Math.abs(s), 0.3, 0.4));
  const sg = Math.sign(s) || 1;
  variable(ctx, "F", "12", Q2.x + ux * sg * m - px * 36, Q2.y + uy * sg * m - py * 36, 28, RGB.azul, ks, "center");
  variable(ctx, "F", "21", Q1.x - ux * sg * m - px * 36, Q1.y - uy * sg * m - py * 36, 28, RGB.azul, ks, "center");
};

export const Vector: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const Q2 = q2(t, dur);
  const d = Math.hypot(Q2.x - Q1.x, Q2.y - Q1.y);
  // Componentes del unitario con el eje y hacia arriba (en el lienzo crece hacia abajo).
  const ux = (Q2.x - Q1.x) / d;
  const uy = -(Q2.y - Q1.y) / d;
  const s = signo(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={paso(dur)} />
      <Cabeza ceja={INFO[E].ceja} titulo="La fuerza es *un vector*" />
      <Formula tex="\vec F_{12}=k_e\,q_1q_2\,\frac{\vec r_2-\vec r_1}{\lVert\vec r_2-\vec r_1\rVert^{3}}" t0={T_VECTOR} tFin={T_SIEMPRE - 0.5} top={290} size={44} />
      <Formula tex="\vec F_{21}=-\,\vec F_{12}" t0={T_SIEMPRE} top={300} size={52} />
      <Hud
        t0={T_ERRE}
        items={[
          { l: "Unitario de 1 a 2", v: `(${num(ux, 2)}; ${num(uy, 2)})`, t: T_ERRE },
          { l: "Signo de q1·q2", v: s > 0 ? "+" : "−", azul: true, t: T_NEG - 0.6 },
        ]}
      />
    </Escena>
  );
};
