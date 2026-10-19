import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { trazoDensidad } from "../lab/densidad";
import { flecha, linea, puntoP, type Pt } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eOut, numMiles, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";
import { R2, campo2En } from "../fisica";
import { CX, CY, FESC, RPX, camino, dens, ejes } from "./semi";

const E = 12;
const T_MOVER = w(E, "mover");
const T_DIFICIL = w(E, "dificiles");
const T_HERR = w(E, "herramienta");
export const sfx12: Sfx[] = [
  [E, T_MOVER, "tic"],
  [E, T_DIFICIL, "tic"],
  [E, T_HERR, "campana"],
];

// P recorre un lazo dentro del semicírculo (en metros, centro en el origen). En cada punto hay que rehacer la integral:
// aquí se rehace numéricamente en cada cuadro.
const recorrido = (s: number): Pt => [0.42 * R2 * Math.sin(2 * Math.PI * s), 0.26 * R2 * (1 - Math.cos(2 * Math.PI * s))];
const s = (t: number) => tramo(t, T_MOVER, T_HERR + 0.8 - T_MOVER, 0, 0.8);
const aPantalla = ([x, y]: Pt): Pt => [CX + (x / R2) * RPX, CY - (y / R2) * RPX];
// Aquí el campo llega a más del doble que en el centro: la flecha usa 0,6 veces la escala de las escenas anteriores.
const ESC = 0.6 * FESC;

// Mapa de campo: direcciones en una grilla dentro del semicírculo, calculadas una vez.
const GRILLA: { p: Pt; e: Pt; m: number }[] = [];
for (let i = -3; i <= 3; i++)
  for (let j = -2; j <= 3; j++) {
    const x = i * 0.22 * R2;
    const y = j * 0.2 * R2;
    if (Math.hypot(x, y) > 0.8 * R2) continue;
    const [ex, ey] = campo2En(x, y);
    GRILLA.push({ p: [x, y], e: [ex, ey], m: Math.hypot(ex, ey) });
  }
const MMAX = Math.max(...GRILLA.map((g) => g.m));

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.6));
  ejes(ctx, k, false);
  trazoDensidad(ctx, camino, dens, k, t, { grosor: 9, n: 120, chispas: 90 });
  const kg = eOut(pr(t, T_DIFICIL - 0.3, 0.8));
  GRILLA.forEach((g) => {
    const [x, y] = aPantalla(g.p);
    const l = 34;
    const ux = g.e[0] / g.m;
    const uy = -g.e[1] / g.m;
    flecha(ctx, x - (ux * l) / 2, y - (uy * l) / 2, x + (ux * l) / 2, y + (uy * l) / 2, RGB.hielo, kg * (0.25 + 0.5 * Math.sqrt(g.m / MMAX)), 1.4, 9);
  });
  // Rastro de P y su campo en el punto actual.
  const ss = s(t);
  const rastro: Pt[] = Array.from({ length: 60 }, (_, i) => aPantalla(recorrido((ss * i) / 59)));
  linea(ctx, rastro, RGB.blanco, 0.25 * k, 1, [3, 5]);
  const p = recorrido(ss);
  const [ex, ey] = campo2En(p[0], p[1]);
  const m = Math.hypot(ex, ey);
  const l = m * ESC;
  const [px, py] = aPantalla(p);
  flecha(ctx, px, py, px + (ex / m) * l, py - (ey / m) * l, RGB.azul, k, 5, 24);
  puntoP(ctx, px, py, k, "P", 18, 28);
};

export const OtraHerramienta: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const p = recorrido(s(t));
  const [ex, ey] = campo2En(p[0], p[1]);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Se mueve P, otra integral: *necesitamos otra herramienta*" />
      <Hud
        t0={T_MOVER}
        top={1150}
        items={[
          { l: "Componente x", v: numMiles(ex), u: "N/C" },
          { l: "Componente y", v: numMiles(ey), u: "N/C", azul: true },
        ]}
      />
    </Escena>
  );
};
