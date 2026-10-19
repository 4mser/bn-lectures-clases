import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { azar, barraLuz, chispa } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 2;
const T0 = w(E, "nanocoulomb");
const T1 = w(E, "electrones") + 0.3;
const T_CONT = w(E, "continua");
export const sfx02: Sfx[] = [
  [E, T1, "golpe"],
  [E, T_CONT, "check"],
];

// 1 nC / e = 6 241 509 074 cargas elementales.
const CARGAS = 1e-9 / 1.602176634e-19;
const MAX_PUNTOS = 1600;
const X0 = 150;
const X1 = 930;
const Y = 720;

// Cuántas cargas cuenta el contador (escala logarítmica, de 1 a 6,24 × 10⁹).
const cuenta = (t: number) => Math.pow(10, Math.log10(CARGAS) * eIO(pr(t, T0, T1 - T0)));
const conEspacios = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const p = eIO(pr(t, T0, T1 - T0));
  const kc = eIO(pr(t, T_CONT - 0.3, 1.1));
  const visibles = Math.round(lerp(14, MAX_PUNTOS, p));
  const r = lerp(4.2, 0.9, p);
  // La nube se aplana hacia la barra a medida que se vuelve continua.
  const alto = lerp(150, 26, p) * (1 - kc) + 4 * kc;
  for (let i = 0; i < visibles; i++) {
    const nace = i < 14 ? eOut(pr(t, 0.2 + i * 0.06, 0.5)) : 1;
    const x = lerp(X0, X1, azar(i * 1.37 + 0.5));
    const y = Y + (azar(i * 2.11 + 0.3) - 0.5) * alto + Math.sin(t * 1.3 + i) * 2 * (1 - p);
    chispa(ctx, x, y, r, RGB.pos, nace * lerp(1, 0.55, p) * (1 - 0.8 * kc));
  }
  barraLuz(ctx, X0, Y, X1, Y, RGB.pos, kc, t, 6);
};

export const Millones: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Un nanocoulomb: *más de seis mil millones de electrones*" />
      <Hud
        t0={T0}
        items={[
          { l: "Cargas en 1 nC", v: conEspacios(cuenta(t)), azul: true },
          { l: "Una carga más cambia", v: "1 parte", u: "en 6 mil millones", t: T_CONT - 0.4 },
        ]}
      />
    </Escena>
  );
};
