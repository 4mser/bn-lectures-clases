import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { trazoDensidad } from "../lab/densidad";
import { flecha, linea, puntoP, rotulo } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";
import { A, B, campo1, campoUniforme, carga1 } from "../fisica";
import { FESC, PX, xpx } from "./barra";

const E = 7;
const T_PAREJA = w(E, "pareja");
const T_DA = w(E, "da");
const T_IMPORTA = w(E, "importa");
export const sfx07: Sfx[] = [
  [E, T_PAREJA, "tic"],
  [E, T_DA, "alerta"],
  [E, T_IMPORTA, "check"],
];

// Arriba la barra real (λ = αx); abajo la misma carga total repartida pareja.
const Y1 = 560;
const Y2 = 820;
const EV = campo1(A, B);
const EU = campoUniforme(A, B);
const MEDIA = (A + B) / 2 / B; // λ pareja relativa a λ(b): misma carga total

const barra = (ctx: CanvasRenderingContext2D, y: number, d: (u: number) => number, e: number, k: number, kf: number, t: number, nombre: string, rgb: string) => {
  linea(ctx, [[60, y], [1000, y]], RGB.blanco, 0.22 * k, 1);
  trazoDensidad(ctx, (u) => [xpx(A + (B - A) * u), y], d, k, t, { grosor: 8, semilla: y });
  rotulo(ctx, nombre, xpx(B), y - 46, { a: k, size: 14, align: "right" });
  flecha(ctx, PX, y, PX - e * FESC * kf, y, rgb, kf, 5, 22);
  puntoP(ctx, PX, y, k, "P", -8, -34);
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k1 = eOut(pr(t, 0.1, 0.6));
  barra(ctx, Y1, (u) => (A + (B - A) * u) / B, EV, k1, k1, t, "densidad creciente", RGB.azul);
  const k2 = eOut(pr(t, T_PAREJA - 0.6, 0.7));
  barra(ctx, Y2, () => MEDIA, EU, k2, eOut(pr(t, T_DA, 0.6)), t, "misma carga, pareja", RGB.neg);
};

export const BarraUniforme: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const nc = <Tex tex="\text{nC}" size={24} color={C.texto2} />;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Misma carga total, *otro campo*" />
      <Hud
        t0={0.6}
        items={[
          { l: "Carga de cada barra", v: num(carga1(A, B) * 1e9, 2), u: nc },
          { l: "Densidad alfa x", v: num(EV, 1), u: "N/C", azul: true },
          { l: "Densidad pareja", v: num(EU, 1), u: "N/C", t: T_DA },
        ]}
      />
    </Escena>
  );
};
