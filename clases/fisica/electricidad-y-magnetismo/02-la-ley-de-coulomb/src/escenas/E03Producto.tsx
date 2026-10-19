import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza } from "../lab/cargas";
import { linea, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 3;
const T_PROP = w(E, "proporcional");
const T_DUP = w(E, "duplicas");
const T_DUPLICA = w(E, "duplica");
export const sfx03: Sfx[] = [
  [E, T_DUP, "tic"],
  [E, T_DUPLICA, "golpe"],
];

const A = { x: 350, y: 680 };
const B = { x: 730, y: 680 };
const R = B.x - A.x;
const UNIDAD = 105; // px de flecha para la fuerza inicial F₀

// q₂ pasa de q a 2q; q₁ y la distancia quedan fijas.
const q2 = (t: number) => 1 + eIO(pr(t, T_DUP, 1.1));
// Fuerza relativa con la ley: |q₁||q₂|/r², dividida por la del comienzo.
const fuerzaRel = (t: number) => (1 * q2(t)) / (R * R) / (1 / (R * R));

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  const n = q2(t);
  const F = fuerzaRel(t);
  linea(ctx, [[A.x, A.y], [B.x, B.y]], RGB.blanco, 0.14 * k, 1, [4, 7]);
  cargaQ(ctx, A.x, A.y, 12, 1, k, t);
  cargaQ(ctx, B.x, B.y, 12 * Math.sqrt(n), 1, k, t);
  fuerza(ctx, A.x, A.y, -1, 0, UNIDAD * F * k, RGB.hielo, k, 22 + 0 * n);
  fuerza(ctx, B.x, B.y, 1, 0, UNIDAD * F * k, RGB.hielo, k, 22 * Math.sqrt(n));
  variable(ctx, "q", "1", A.x, A.y + 78, 32, RGB.blanco, k, "center");
  const kd = eOut(pr(t, T_DUP, 0.6));
  variable(ctx, "q", "2", B.x, B.y + 78, 32, RGB.blanco, k * (1 - kd), "center");
  variable(ctx, "2q", "2", B.x, B.y + 78 + 10 * (1 - kd), 32, RGB.azul, kd, "center");
};

export const Producto: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Doble carga, *doble fuerza*" />
      <Formula tex="F\;\propto\;|q_1|\,|q_2|" t0={T_PROP} top={900} size={56} />
      <Hud
        t0={T_PROP}
        items={[
          { l: "Carga q2", v: `×${num(q2(t), 2)}`, t: T_PROP + 0.3 },
          { l: "Fuerza", v: `×${num(fuerzaRel(t), 2)}`, u: <Tex tex="F_0" size={28} color="#5B86FF" />, azul: true, t: T_PROP + 0.45 },
        ]}
      />
    </Escena>
  );
};
