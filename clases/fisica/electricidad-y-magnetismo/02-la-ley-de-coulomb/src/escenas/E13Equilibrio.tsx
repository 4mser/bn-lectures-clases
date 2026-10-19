import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza } from "../lab/cargas";
import { linea, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, cl, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 13;
const T_BAL = w(E, "balance");
const T_EQ = w(E, "equilibrio");
const T_CERO = w(E, "cero");
const T_ENTRE = w(E, "entre");
const T_TERCIO = w(E, "tercio");
export const sfx13: Sfx[] = [
  [E, T_BAL, "tic"],
  [E, T_CERO, "check"],
  [E, T_TERCIO, "golpe"],
];

// q en x = 0 y 4q en x = d. Sobre q₀ (positiva), en unidades de k q q₀/d²: 1/u² hacia +x y 4/(1−u)² hacia −x.
const RAZON_Q = 4;
const neta = (u: number) => 1 / (u * u) - RAZON_Q / ((1 - u) * (1 - u));
const U_EQ = 1 / (1 + Math.sqrt(RAZON_Q)); // donde neta(u) = 0
const U_INI = 0.64;
// q₀ parte quieta y, desde «equilibrio», se acomoda amortiguada en U_EQ.
const u = (t: number) => {
  const tau = t - T_EQ;
  if (tau <= 0) return U_INI;
  return U_EQ + (U_INI - U_EQ) * Math.exp(-1.1 * tau) * Math.cos(1.9 * tau);
};

const XA = 170;
const D = 740;
const Y = 680;
const PX = 13; // px por unidad de fuerza
const MAXF = 300;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  const uu = u(t);
  const x0 = XA + uu * D;
  linea(ctx, [[XA - 40, Y], [XA + D + 40, Y]], RGB.blanco, 0.2 * k, 1, [4, 7]);
  cargaQ(ctx, XA, Y, 11, 1, k, t);
  cargaQ(ctx, XA + D, Y, 22, 1, k, t);
  variable(ctx, "q", "", XA, Y - 62, 32, RGB.blanco, k, "center");
  variable(ctx, "4q", "", XA + D, Y - 72, 32, RGB.blanco, k, "center");
  cargaQ(ctx, x0, Y, 8, 1, k, t);
  variable(ctx, "q", "0", x0, Y - 52, 28, RGB.blanco, k, "center");
  // Las dos fuerzas sobre q₀ y la neta, debajo.
  const f1 = cl((1 / (uu * uu)) * PX, 0, MAXF);
  const f2 = cl((RAZON_Q / ((1 - uu) * (1 - uu))) * PX, 0, MAXF);
  fuerza(ctx, x0, Y, 1, 0, f1 * k, RGB.hielo, k, 18, 2.8, 15);
  fuerza(ctx, x0, Y, -1, 0, f2 * k, RGB.hielo, k, 18, 2.8, 15);
  const kn = eOut(pr(t, T_EQ - 0.4, 0.6));
  const fn = cl(neta(uu) * PX, -MAXF, MAXF);
  linea(ctx, [[x0, Y + 22], [x0, Y + 108]], RGB.blanco, 0.2 * kn, 1, [3, 5]);
  fuerza(ctx, x0, Y + 100, 1, 0, fn * kn, RGB.azul, kn, 0, 4.5, 20);
  // Marca del punto de equilibrio: un tercio del camino.
  const kt = eOut(pr(t, T_TERCIO - 0.3, 0.6));
  const xe = XA + U_EQ * D;
  linea(ctx, [[xe, Y + 150], [xe, Y + 170]], RGB.azul, kt, 2);
  linea(ctx, [[XA, Y + 160], [xe, Y + 160]], RGB.azul, 0.6 * kt, 1.4);
  variable(ctx, "d/3", "", (XA + xe) / 2, Y + 192, 28, RGB.azul, kt, "center");
  linea(ctx, [[XA, Y + 150], [XA, Y + 170]], RGB.azul, kt, 2);
};

export const Equilibrio: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const uu = u(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Equilibrio: *la suma es cero, no cada fuerza*" />
      <Formula tex="\sum\vec F_{\text{el}}+\vec F_g+\vec T+\vec N+\cdots=m\,\vec a" t0={T_BAL} tFin={T_ENTRE - 0.5} top={925} size={36} />
      <Formula tex="x=\frac{d}{1+\sqrt{4}}=\frac{d}{3}" t0={T_ENTRE} top={915} size={46} />
      <Hud
        t0={T_EQ}
        items={[
          { l: "Posición x ÷ d", v: num(uu, 3), t: T_EQ - 0.3 },
          { l: "Fuerza neta", v: num(Math.abs(neta(uu)) < 0.005 ? 0 : neta(uu), 2), u: <Tex tex="kqq_0/d^2" size={26} color="#5B86FF" />, azul: true, t: T_EQ },
        ]}
      />
    </Escena>
  );
};
