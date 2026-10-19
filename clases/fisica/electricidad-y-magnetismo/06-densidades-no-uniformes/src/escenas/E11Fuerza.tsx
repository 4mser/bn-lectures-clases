import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { trazoDensidad } from "../lab/densidad";
import { carga, flecha, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eOut, num, numMiles, pr } from "../theme";
import type { Sfx } from "../sfx";
import { E2, F2, QP } from "../fisica";
import { CX, CY, FESC, camino, dens, ejes } from "./semi";

const E = 11;
const T_FUERZA = w(E, "fuerza");
const T_MULT = w(E, "multiplicacion");
const T_ARRIBA = w(E, "arriba");
const T_OPUESTA = w(E, "opuesta");
export const sfx11: Sfx[] = [
  [E, T_FUERZA, "tic"],
  [E, T_MULT + 0.6, "golpe"],
  [E, T_OPUESTA, "check"],
];

const FPX = 170 / Math.abs(F2); // px por newton

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.6));
  ejes(ctx, k, false);
  trazoDensidad(ctx, camino, dens, k * 0.6, t, { grosor: 9, n: 120, chispas: 90 });
  flecha(ctx, CX, CY, CX, CY + E2 * FESC, RGB.azul, k, 5, 24);
  variable(ctx, "E", "", CX + 28, CY + E2 * FESC - 16, 32, RGB.azul, k, "left");
  // La carga negativa en P y la fuerza, opuesta al campo.
  const kq = eOut(pr(t, T_FUERZA, 0.6));
  carga(ctx, CX, CY, 12, RGB.neg, kq, t);
  variable(ctx, "q", "", CX - 40, CY + 36, 30, RGB.neg, kq, "center");
  const kf = eOut(pr(t, T_MULT + 0.6, 0.7));
  flecha(ctx, CX, CY - 18, CX, CY - 18 - F2 * FPX * kf, RGB.neg, kf, 5, 24);
  variable(ctx, "F", "", CX + 28, CY - 18 - F2 * FPX + 16, 32, RGB.neg, kf, "left");
};

export const Fuerza: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Con el campo listo, la fuerza es *una multiplicación*" />
      <Formula tex="\vec F=q\,\vec E(P)" t0={T_MULT} top={985} size={52} />
      <Hud
        t0={T_FUERZA}
        top={1150}
        items={[
          { l: "Carga en P", v: num(QP * 1e6, 0), u: <Tex tex="\mu\text{C}" size={24} color={C.texto2} /> },
          { l: "Campo", v: numMiles(E2), u: "N/C" },
          { l: "Fuerza, hacia arriba", v: num(F2, 3), u: "N", azul: true, t: T_ARRIBA },
        ]}
      />
    </Escena>
  );
};
