import React from "react";
import { Cabeza, Escena, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza } from "../lab/cargas";
import { linea, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 5;
const T_RECTA = w(E, "recta");
const T_IGUALES = w(E, "iguales");
const T_OPUESTOS = w(E, "opuestos");
const T_PAR = w(E, "par");
export const sfx05: Sfx[] = [
  [E, T_RECTA, "tic"],
  [E, T_IGUALES, "tic"],
  [E, T_OPUESTOS, "tic"],
  [E, T_PAR, "check"],
];

const XA = 350;
const XB = 730;
const FILAS: { y: number; s: [number, number]; t0: number }[] = [
  { y: 500, s: [1, 1], t0: 0.3 },
  { y: 625, s: [-1, -1], t0: T_IGUALES },
  { y: 750, s: [1, -1], t0: T_OPUESTOS },
  { y: 875, s: [-1, 1], t0: T_OPUESTOS + 0.3 },
];
const LARGO = 95;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kr = eOut(pr(t, T_RECTA, 0.6));
  const kpar = eOut(pr(t, T_PAR, 0.6));
  FILAS.forEach((f, i) => {
    const k = eOut(pr(t, f.t0, 0.7));
    if (k <= 0.01) return;
    const prod = f.s[0] * f.s[1];
    // La recta que une las cargas, resaltada con «recta».
    linea(ctx, [[XA - 200, f.y], [XB + 200, f.y]], RGB.blanco, (0.1 + 0.25 * kr * (i === 0 ? 1 : 0.5)) * k, 1, [4, 7]);
    cargaQ(ctx, XA, f.y, 11, f.s[0], k, t);
    cargaQ(ctx, XB, f.y, 11, f.s[1], k, t);
    // Repulsión (producto > 0): hacia afuera. Atracción: hacia adentro.
    const rgb = kpar > 0.5 ? RGB.azul : RGB.hielo;
    fuerza(ctx, XB, f.y, 1, 0, prod * LARGO * k, rgb, k, 20, 3, 16);
    fuerza(ctx, XA, f.y, -1, 0, prod * LARGO * k, rgb, k, 20, 3, 16);
    variable(ctx, f.s[0] > 0 ? "+" : "−", "", XA - 34, f.y - 30, 28, RGB.blanco, k * 0.85, "center");
    variable(ctx, f.s[1] > 0 ? "+" : "−", "", XB + 34, f.y - 30, 28, RGB.blanco, k * 0.85, "center");
    rotulo(ctx, prod > 0 ? "repulsión" : "atracción", (XA + XB) / 2, f.y - 26, { a: k, align: "center", size: 14 });
  });
  // Par de acción y reacción en la primera fila.
  const y = FILAS[0].y;
  variable(ctx, "F", "21", XA - 20 - LARGO / 2, y + 36, 26, RGB.azul, kpar, "center");
  variable(ctx, "F", "12", XB + 20 + LARGO / 2, y + 36, 26, RGB.azul, kpar, "center");
};

export const Central: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="La fuerza va *por la recta que las une*" />
      <Formula tex="\vec F_{21}=-\,\vec F_{12}" t0={T_PAR} top={975} size={54} />
    </Escena>
  );
};
