import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { flecha, chispa } from "../lab/luz";
import { PL, placas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 0;
const T_LINEAS = w(E, "lineas");
const T_UNIF = w(E, "uniforme");
const T_MODULO = w(E, "modulo");
const T_PUNTO = w(E, "punto");
export const sfx00: Sfx[] = [
  [E, T_LINEAS, "tic"],
  [E, T_MODULO, "tic"],
  [E, T_PUNTO, "check"],
];

// Campo uniforme ideal entre las placas: el mismo vector en todo punto (en px de flecha).
const campo = (_x: number, _y: number): [number, number] => [0, 70];
// Sondas en una grilla 4 × 3: cada una mide el campo en su punto, una tras otra.
const SONDAS = Array.from({ length: 12 }, (_, i) => ({
  x: PL.x0 + 130 + (i % 4) * 200,
  y: PL.y0 + 90 + Math.floor(i / 4) * 125,
}));
const tSonda = (i: number) => T_MODULO - 0.3 + i * 0.13;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.9));
  placas(ctx, t, PL, ka, { kl: eOut(pr(t, T_LINEAS - 0.2, 1.0)) * (1 - 0.5 * eOut(pr(t, T_MODULO - 0.3, 0.6))) });
  SONDAS.forEach((s, i) => {
    const k = eOut(pr(t, tSonda(i), 0.5));
    const [ex, ey] = campo(s.x, s.y);
    chispa(ctx, s.x, s.y, 3, RGB.blanco, k);
    flecha(ctx, s.x, s.y, s.x + ex * k, s.y + ey * k, RGB.azul, k, 3, 15);
  });
};

export const Uniforme: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const medidas = SONDAS.filter((_, i) => t >= tSonda(i) + 0.2).map((s) => Math.hypot(...campo(s.x, s.y)));
  const variacion = medidas.length ? ((Math.max(...medidas) - Math.min(...medidas)) / Math.max(...medidas)) * 100 : 0;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Entre placas paralelas, *el campo es uniforme*" />
      <Hud
        t0={T_UNIF}
        items={[
          { l: "Puntos medidos", v: String(medidas.length), t: T_MODULO },
          { l: "Diferencia de módulo", v: num(variacion, 1), u: "%", t: T_MODULO + 0.2 },
          { l: "Dirección", v: "la misma", azul: true, t: T_PUNTO - 0.6 },
        ]}
      />
    </Escena>
  );
};
