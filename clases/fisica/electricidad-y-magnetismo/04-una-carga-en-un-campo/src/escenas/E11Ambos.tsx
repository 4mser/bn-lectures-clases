import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { brillo, flecha, rgba, rotulo, variable } from "../lab/luz";
import { G, PL, placas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, lerp, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";

const E = 11;
const T_SUMAN = w(E, "suman");
const T_E = w(E, "E");
const T_GOTA = w(E, "gota");
const T_CUANDO = w(E, "Cuando");
const T_EQ = w(E, "equilibrio");
export const sfx11: Sfx[] = [
  [E, T_SUMAN, "tic"],
  [E, T_GOTA, "tic"],
  [E, T_EQ, "check"],
];

// Gota cargada negativamente en el campo hacia abajo: qE apunta hacia arriba y g hacia abajo.
// a = g + (q/m)E; en módulo, a = g (1 − f), con f = |q|E / (m g). Con f = 1 la gota queda en equilibrio.
const f = (t: number) => (t < T_CUANDO ? tramo(t, T_E - 0.3, 1.0, 0, 0.4) : tramo(t, T_CUANDO, T_EQ - T_CUANDO, 0.4, 1));
const X = 540;
const Y = 700;
const LARGO = 170; // px de m g

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.9));
  const k = f(t);
  placas(ctx, t, PL, ka, { brilloLineas: lerp(0.3, 1.4, k), vel: lerp(30, 90, k) });
  const kg = eOut(pr(t, T_GOTA - 0.4, 0.6));
  const kgota = Math.max(kg, eOut(pr(t, 0.3, 0.8)));
  // La gota.
  brillo(ctx, X, Y, 80, RGB.neg, 0.18 * kgota);
  const g = ctx.createRadialGradient(X - 8, Y - 8, 2, X, Y, 24);
  g.addColorStop(0, rgba("255,236,200", kgota));
  g.addColorStop(1, rgba("170,110,40", kgota));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(X, Y, 24, 0, Math.PI * 2);
  ctx.fill();
  rotulo(ctx, "gota de aceite", X + 44, Y + 44, { a: kg, size: 13 });
  rotulo(ctx, "carga negativa", X + 44, Y + 66, { a: kg, size: 13, rgb: RGB.neg });
  // Peso, fuerza eléctrica y aceleración neta (a la izquierda).
  const kf = eOut(pr(t, 0.6, 0.6));
  flecha(ctx, X, Y + 30, X, Y + 30 + LARGO * kf, RGB.blanco, kf, 3.5, 18);
  variable(ctx, "mg", "", X + 18, Y + 30 + LARGO * 0.75, 26, RGB.blanco, kf);
  if (k > 0.01) {
    flecha(ctx, X, Y - 30, X, Y - 30 - LARGO * k, RGB.neg, Math.min(1, k * 4), 3.5, 18);
    variable(ctx, "qE", "", X + 18, Y - 30 - LARGO * 0.75 * Math.max(k, 0.4), 26, RGB.neg, Math.min(1, k * 4));
  }
  const ks = eOut(pr(t, T_SUMAN - 0.2, 0.6));
  const xa = X - 140;
  const largoA = LARGO * (1 - k);
  flecha(ctx, xa, Y, xa, Y + largoA * ks, RGB.azul, ks * (largoA > 2 ? 1 : 0), 4, 20);
  variable(ctx, "a", "", xa - 36, Y + 40, 30, RGB.azul, ks);
};

export const Ambos: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Con los dos campos, *las aceleraciones se suman*" />
      <Formula tex="\vec a=\vec g+\frac{q}{m}\vec E" t0={T_SUMAN} top={960} size={46} />
      <Hud
        t0={T_SUMAN}
        items={[
          { l: "Fuerza eléctrica / peso", v: num(f(t), 2) },
          { l: "Aceleración neta", v: num(G * (1 - f(t)), 1), u: "m/s²", azul: true },
        ]}
      />
    </Escena>
  );
};
