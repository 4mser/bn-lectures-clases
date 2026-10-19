import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { grafico, marcaDq, trazoDensidad } from "../lab/densidad";
import { linea, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";
import { A, ALFA, B } from "../fisica";
import { YB, camino, densidad, ejes, xpx, PX } from "./barra";

const E = 3;
const T_BARRA = w(E, "barra");
const T_LAMBDA = w(E, "lambda");
const T_CRECE = w(E, "crece");
const T_TROZO = w(E, "trocito");
export const sfx03: Sfx[] = [
  [E, T_BARRA, "tic"],
  [E, T_LAMBDA, "tic"],
  [E, T_TROZO, "check"],
];

const XDQ = 0.22; // m: dónde se marca el elemento
const DX = 12; // px: medio ancho del elemento, exagerado
const G = { base: 560, alto: 170 };

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  ejes(ctx, k);
  const kb = eOut(pr(t, T_BARRA - 0.2, 0.8));
  trazoDensidad(ctx, camino(A, B), densidad(A, B), kb, t, { grosor: 8 });
  // λ(x) = αx: recta que pasa por el origen; la barra solo ocupa [a, b].
  const kg = eOut(pr(t, T_LAMBDA, 0.8));
  grafico(ctx, PX, xpx(B), G.base, G.alto, (u) => u, kg);
  for (const x of [A, B]) linea(ctx, [[xpx(x), G.base - (G.alto * x) / B], [xpx(x), YB - 20]], RGB.blanco, 0.22 * kg, 1, [3, 6]);
  variable(ctx, "λ", "", PX - 26, G.base - G.alto - 8, 30, RGB.blanco, kg, "center");
  const kc = eOut(pr(t, T_CRECE, 0.6));
  variable(ctx, "αx", "", xpx(B) + 34, G.base - G.alto + 4, 28, "91,134,255", kc, "left");
  // El elemento dq = αx dx.
  const kd = eOut(pr(t, T_TROZO, 0.6));
  marcaDq(ctx, [xpx(XDQ) - DX, YB], [xpx(XDQ) + DX, YB], kd);
  variable(ctx, "dq", "", xpx(XDQ), YB - 42, 30, RGB.blanco, kd, "center");
  variable(ctx, "dx", "", xpx(XDQ), YB + 56, 28, RGB.blanco, kd, "center");
};

export const BarraDq: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Ejercicio 1: la densidad *crece con x*" />
      <Formula tex="dq=\lambda(x)\,dx=\alpha x\,dx" t0={T_TROZO + 0.3} top={900} size={52} />
      <Hud
        t0={T_BARRA}
        items={[
          { l: "a", v: num(A, 2), u: "m" },
          { l: "b", v: num(B, 2), u: "m" },
          { l: "Constante alfa", v: num(ALFA * 1e9, 1), u: <Tex tex="\text{nC/m}^2" size={24} color={C.texto2} /> },
        ]}
      />
    </Escena>
  );
};
