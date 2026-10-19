import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { barraLuz, brillo, chispa, flecha, linea, particulas, puntoP, trazar, variable, type Fuente } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 10;
const T_TODOS = w(E, "todos");
const T_CERCA = w(E, "cercanos");
const T_CAMPO = w(E, "campo");
export const sfx10: Sfx[] = [
  [E, T_TODOS, "tic"],
  [E, T_CERCA, "tic"],
  [E, T_CAMPO, "check"],
];

const X0 = 110;
const X1 = 560;
const L = X1 - X0;
const Y = 690;
const D = 150; // x₀: de la punta de la barra a P
const P = { x: X1 + D, y: Y };
const N = 8;
// Aporte de cada octavo de la barra en P (∝ 1/d²); el más cercano mide 300 px.
const DIST = Array.from({ length: N }, (_, j) => X1 + D - lerp(X0, X1, (j + 0.5) / N));
const APORTE = DIST.map((d) => (DIST[N - 1] * DIST[N - 1]) / (d * d));
// En unidades kλ/L: el campo total y lo que pone el cuarto más cercano.
const X0L = D / L;
const TOTAL = 1 / X0L - 1 / (X0L + 1);
const CUARTO = (1 / X0L - 1 / (X0L + 0.25)) / TOTAL;

const FUENTES: Fuente[] = Array.from({ length: 30 }, (_, i) => ({ x: lerp(X0, X1, (i + 0.5) / 30), y: Y, q: 1 / 30 }));
const LINEAS = Array.from({ length: 16 }, (_, i) => {
  const ang = (i / 16) * Math.PI * 2 + 0.2;
  const x = lerp(X0, X1, 0.5 + 0.5 * Math.cos(ang));
  return trazar(FUENTES, x, Y + 8 * Math.sin(ang) + (Math.sin(ang) >= 0 ? 1 : -1), 1, 110, 7, [-40, 330, 1120, 1060]);
});

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  LINEAS.forEach((pts, i) => {
    linea(ctx, pts, RGB.hielo, 0.08 * k, 1);
    particulas(ctx, pts, t, 60, 2, RGB.hielo, 0.4 * k, i + 5, 1.3);
  });
  barraLuz(ctx, X0, Y, X1, Y, RGB.pos, k, t, 5);
  linea(ctx, [[X1, Y], [P.x, Y]], RGB.blanco, 0.3 * k, 1, [4, 6]);
  // Cotas: L bajo la barra, x₀ entre la punta y P.
  const kc = eOut(pr(t, 1.0, 0.6));
  linea(ctx, [[X0, Y + 46], [X1, Y + 46]], RGB.blanco, 0.35 * kc, 1);
  linea(ctx, [[X1, Y + 46], [P.x, Y + 46]], RGB.blanco, 0.35 * kc, 1, [3, 5]);
  for (const x of [X0, X1, P.x]) linea(ctx, [[x, Y + 38], [x, Y + 54]], RGB.blanco, 0.35 * kc, 1);
  variable(ctx, "L", "", (X0 + X1) / 2, Y + 74, 28, RGB.blanco, kc, "center");
  variable(ctx, "x", "0", (X1 + P.x) / 2, Y + 74, 28, RGB.blanco, kc, "center");

  // Aportes de cada octavo, apilados bajo el eje: todos hacia la derecha, los cercanos mucho más largos.
  const junta = eIO(pr(t, T_CAMPO - 0.2, 0.7));
  for (let j = 0; j < N; j++) {
    const ka = eOut(pr(t, T_TODOS + j * 0.1, 0.5)) * (1 - junta);
    const cerca = j >= N - 2 ? eOut(pr(t, T_CERCA, 0.5)) : 0;
    const xj = lerp(X0, X1, (j + 0.5) / N);
    chispa(ctx, xj, Y, 3.5 + 2 * cerca, RGB.pos, ka);
    if (cerca > 0) brillo(ctx, xj, Y, 46, RGB.blanco, 0.35 * cerca * (1 - junta));
    const yj = lerp(Y - 250 + j * 24, Y, junta);
    flecha(ctx, P.x, yj, P.x + APORTE[j] * 300 * ka, yj, cerca > 0.5 ? RGB.blanco : RGB.hielo, ka * (0.55 + 0.45 * cerca), 2, 12);
  }
  const kr = eOut(pr(t, T_CAMPO, 0.7));
  flecha(ctx, P.x, P.y, P.x + 270 * kr, P.y, RGB.azul, kr, 5, 24);
  puntoP(ctx, P.x, P.y, eOut(pr(t, 0.6, 0.6)), "P", 4, 30);
};

export const BarraEje: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Barra en su eje: *nada que cancelar*" />
      <Formula tex="E=\frac{k\lambda L}{x_0\,(x_0+L)}" t0={T_CAMPO + 0.1} top={930} size={54} />
      <Hud
        t0={T_TODOS}
        items={[
          { l: "Distancia / L", v: num(X0L, 2) },
          { l: "Cuarto más cercano", v: `${num(CUARTO * 100, 0)} %`, t: T_CERCA },
          { l: "Campo en P", v: num(TOTAL, 2), u: <Tex tex="k\lambda/L" size={26} color={C.azul} />, azul: true, t: T_CAMPO },
        ]}
      />
    </Escena>
  );
};
