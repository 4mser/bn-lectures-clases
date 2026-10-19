import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { brillo, carga, chispa, flecha, linea, rotulo, rgba, variable } from "../lab/luz";
import { A_E, E_LAB, G, cient, placas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 10;
const T_CM = w(E, "centimetro");
const T_ELEC = w(E, "electron");
const T_NS = w(E, "nanosegundos");
const T_PIEDRA = w(E, "piedra");
const T_MS = w(E, "milisegundos");
export const sfx10: Sfx[] = [
  [E, T_NS + 0.3, "tic"],
  [E, T_MS + 0.3, "tic"],
];

// Un centímetro desde el reposo con aceleración constante: d = ½ a t², así que t = √(2d/a).
const D = 0.01; // m
const T_E = Math.sqrt((2 * D) / A_E); // s, electrón en E = 1,0 × 10³ N/C
const T_P = Math.sqrt((2 * D) / G); // s, piedra en caída libre
// Las dos columnas usan la misma escala: 400 px = 1 cm.
const YA = 500;
const YB = 900;
const XE = 310;
const XP = 780;
// Fracción del tiempo real transcurrido: la animación recorre el tiempo de cada una entre dos palabras.
const uE = (t: number) => pr(t, T_ELEC - 0.2, T_NS + 0.3 - (T_ELEC - 0.2));
const uP = (t: number) => pr(t, T_PIEDRA - 0.2, T_MS + 0.3 - (T_PIEDRA - 0.2));
// d(t) / d = (t / t_total)²: la posición sale de la misma ley ½ a t².
const fraccion = (u: number) => u * u;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.8));
  // Electrón: placas horizontales separadas 1 cm; sube contra las líneas.
  placas(ctx, t, { x0: XE - 170, x1: XE + 170, y0: YA, y1: YB }, ka, { n: 4, etiqueta: false });
  rotulo(ctx, `electrón · ${num(E_LAB, 0)} N/C`, XE - 170, YA - 60, { a: ka, size: 13 });
  const ue = uE(t);
  const ye = YB - 20 - (YB - YA - 40) * fraccion(ue);
  carga(ctx, XE, ye, 11, RGB.neg, ka, t);
  // Piedra en caída libre.
  linea(ctx, [[XP - 150, YB + 10], [XP + 150, YB + 10]], RGB.blanco, 0.3 * ka, 1.2);
  rotulo(ctx, "piedra · caída libre", XP - 150, YA - 60, { a: ka, size: 13 });
  flecha(ctx, XP + 120, YA + 10, XP + 120, YA + 110, RGB.hielo, 0.6 * ka, 2, 12);
  variable(ctx, "g", "", XP + 142, YA + 34, 28, RGB.hielo, ka);
  const up = uP(t);
  const yp = YA + 20 + (YB - YA - 40) * fraccion(up);
  brillo(ctx, XP, yp, 40, RGB.blanco, 0.2 * ka);
  const g = ctx.createRadialGradient(XP - 6, yp - 6, 2, XP, yp, 16);
  g.addColorStop(0, rgba("250,252,255", ka));
  g.addColorStop(1, rgba("120,130,150", ka));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(XP, yp, 16, 0, Math.PI * 2);
  ctx.fill();
  // Regla de 1 cm entre las dos columnas.
  const kr = eOut(pr(t, T_CM - 0.2, 0.6));
  const xr = (XE + XP) / 2 + 20;
  linea(ctx, [[xr, YA + 20], [xr, YB - 20]], RGB.azul, 0.8 * kr, 1.5);
  linea(ctx, [[xr - 10, YA + 20], [xr + 10, YA + 20]], RGB.azul, 0.8 * kr, 1.5);
  linea(ctx, [[xr - 10, YB - 20], [xr + 10, YB - 20]], RGB.azul, 0.8 * kr, 1.5);
  rotulo(ctx, "1 cm", xr + 16, (YA + YB) / 2, { a: kr, size: 16, rgb: RGB.azul });
  if (ue >= 1) chispa(ctx, XE, YA + 20, 4, RGB.azul, eOut(pr(t, T_NS + 0.3, 0.3)));
  if (up >= 1) chispa(ctx, XP, YB - 20, 4, RGB.azul, eOut(pr(t, T_MS + 0.3, 0.3)));
  rotulo(ctx, "cámara lenta distinta en cada columna", 140, YB + 70, { a: eOut(pr(t, T_PIEDRA, 0.6)) * 0.8, size: 12 });
};

export const Centimetro: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Un centímetro: *nanosegundos contra milisegundos*" />
      <Hud
        t0={T_ELEC}
        items={[
          { l: "Electrón", v: num(uE(t) * T_E * 1e9, 1), u: "ns", azul: true },
          { l: "Piedra", v: num(uP(t) * T_P * 1e3, 1), u: "ms", t: T_PIEDRA },
          { l: "Piedra / electrón", v: <Tex tex={cient(T_P / T_E, 2)} size={44} />, t: T_MS + 0.6 },
        ]}
      />
    </Escena>
  );
};
