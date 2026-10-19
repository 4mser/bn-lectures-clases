import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza, masa } from "../lab/cargas";
import { linea, rotulo, variable } from "../lab/luz";
import { Cien, G, K } from "../fisica";
import { INFO, w } from "../linea";
import { RGB, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 8;
const T_FORMA = w(E, "forma");
const T_SOLO = w(E, "solo");
const T_CONST = w(E, "constante");
export const sfx08: Sfx[] = [
  [E, T_FORMA, "tic"],
  [E, T_SOLO, "tic"],
  [E, T_CONST + 0.4, "golpe"],
];

const XA = 340;
const XB = 740;
const YG = 520;
const YE = 780;
const LARGO = 90;

// Signo de la carga de la derecha: desde «solo atrae» alterna entre atraer y repeler.
const signo = (t: number) => (t < T_SOLO ? 1 : Math.cos((Math.PI * (t - T_SOLO)) / 1.5));

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kg = eOut(pr(t, 0.2, 0.8));
  const ke = eOut(pr(t, 0.5, 0.8));
  rotulo(ctx, "gravitación", 540, YG - 78, { a: kg, align: "center" });
  linea(ctx, [[XA, YG], [XB, YG]], RGB.blanco, 0.12 * kg, 1, [4, 7]);
  masa(ctx, XA, YG, 16, kg);
  masa(ctx, XB, YG, 16, kg);
  fuerza(ctx, XA, YG, 1, 0, LARGO * kg, RGB.blanco, kg * 0.85, 26, 3, 16);
  fuerza(ctx, XB, YG, -1, 0, LARGO * kg, RGB.blanco, kg * 0.85, 26, 3, 16);
  variable(ctx, "m", "1", XA, YG + 52, 30, RGB.blanco, kg, "center");
  variable(ctx, "m", "2", XB, YG + 52, 30, RGB.blanco, kg, "center");

  const s = signo(t);
  rotulo(ctx, "electricidad", 540, YE - 78, { a: ke, align: "center" });
  linea(ctx, [[XA, YE], [XB, YE]], RGB.blanco, 0.12 * ke, 1, [4, 7]);
  cargaQ(ctx, XA, YE, 12, 1, ke, t);
  cargaQ(ctx, XB, YE, 12, s, ke, t);
  // Repulsión si el producto es positivo: hacia afuera.
  fuerza(ctx, XA, YE, -1, 0, LARGO * s * ke, RGB.hielo, ke, 22, 3, 16);
  fuerza(ctx, XB, YE, 1, 0, LARGO * s * ke, RGB.hielo, ke, 22, 3, 16);
  variable(ctx, "q", "1", XA, YE + 52, 30, RGB.blanco, ke, "center");
  variable(ctx, "q", "2", XB, YE + 52, 30, RGB.blanco, ke, "center");
  const kd = eOut(pr(t, T_SOLO, 0.6));
  rotulo(ctx, "solo atrae", 540, YG - 26, { a: kd, align: "center", rgb: RGB.azul, size: 14 });
  rotulo(ctx, s > 0 ? "repele" : "atrae", 540, YE - 26, { a: kd, align: "center", rgb: RGB.azul, size: 14 });
};

export const Newton: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="La misma forma que la gravedad, *con dos diferencias*" />
      <Formula tex="F_g=G\,\frac{m_1m_2}{r^{2}}\quad F_e=k_e\,\frac{|q_1|\,|q_2|}{r^{2}}" t0={T_FORMA} top={915} size={40} />
      <Hud
        t0={T_CONST}
        items={[
          { l: "Constante G", v: <Cien v={G} d={2} />, u: "N·m²/kg²", t: T_CONST },
          { l: "Constante k", v: <Cien v={K} d={2} />, u: "N·m²/C²", azul: true, t: T_CONST + 0.3 },
        ]}
      />
    </Escena>
  );
};
