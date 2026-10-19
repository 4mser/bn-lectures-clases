import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { grafico, trazoDensidad } from "../lab/densidad";
import { rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eOut, lerp, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";
import { A, B } from "../fisica";
import { YB, camino, densidad, xpx } from "./barra";

const E = 0;
const T_UNIF = w(E, "uniformes");
const T_PAREJA = w(E, "pareja");
const T_CAMBIA = w(E, "cambia");
export const sfx00: Sfx[] = [
  [E, T_PAREJA + 0.2, "tic"],
  [E, T_CAMBIA, "check"],
];

// La densidad pasa de pareja (el promedio, misma carga total) a crecer con x como en el ejercicio 1.
const MEDIA = (A + B) / 2 / B;
const RAMPA = densidad(A, B);
const k = (t: number) => tramo(t, T_PAREJA + 0.2, 1.6, 0, 1);
const dens = (t: number) => (u: number) => lerp(MEDIA, RAMPA(u), k(t));
const G = { base: 560, alto: 170 };

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const a = eOut(pr(t, 0.2, 0.9));
  trazoDensidad(ctx, camino(A, B), dens(t), a, t, { grosor: 8 });
  // λ(x) dibujada sobre la barra: plana mientras es uniforme, rampa cuando deja de serlo.
  const kg = eOut(pr(t, T_UNIF - 0.4, 0.8));
  grafico(ctx, xpx(A), xpx(B), G.base, G.alto, dens(t), kg);
  variable(ctx, "λ", "", xpx(A) - 30, G.base - G.alto - 8, 30, RGB.blanco, kg, "center");
  variable(ctx, "x", "", xpx(B) + 36, G.base + 2, 28, RGB.blanco, kg, "center");
  rotulo(ctx, k(t) < 0.5 ? "uniforme" : "no uniforme", (xpx(A) + xpx(B)) / 2, G.base - G.alto - 40, { a: kg, size: 15, align: "center" });
};

export const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const d = dens(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Cuando la densidad *no es uniforme*" />
      <Formula tex="\lambda=\lambda(x)" t0={T_CAMBIA} top={YB + 150} size={54} />
      <Hud t0={T_UNIF} items={[{ l: "Densidad máx / mín", v: num(d(1) / d(0), 2), azul: k(t) > 0.5 }]} />
    </Escena>
  );
};
