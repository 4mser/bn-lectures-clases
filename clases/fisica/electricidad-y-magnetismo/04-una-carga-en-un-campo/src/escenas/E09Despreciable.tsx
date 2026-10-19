import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { brillo, linea, rotulo, rgba } from "../lab/luz";
import { A_E, E_LAB, G, cient, partes, potencia } from "../lab/campo";
import { INFO, w } from "../linea";
import { C, RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 9;
const T_18 = w(E, "dieciocho");
const T_GRAV = w(E, "gravedad");
const T_ELEM = w(E, "elementales");
const T_DESP = w(E, "desprecia");
export const sfx09: Sfx[] = [
  [E, T_18, "golpe"],
  [E, T_DESP, "tic"],
];

// Escala logarítmica: cada marca es un factor diez. Barra de g (9,8 m/s²) y barra del electrón (eE/mₑ).
const RAZON = A_E / G;
const X0 = 150;
const X1 = 960;
const DECADAS = 15;
const xLog = (v: number) => X0 + (Math.log10(v) / DECADAS) * (X1 - X0);
const Y_G = 600;
const Y_E = 790;
const EJE = 900;
// Valor que muestra la barra del electrón mientras crece (de g hasta a_E, en escala log).
const crece = (t: number) => eIO(pr(t, T_18 - 0.5, 1.6));
const valorE = (t: number) => Math.pow(10, lerp(Math.log10(G), Math.log10(A_E), crece(t)));

const barra = (ctx: CanvasRenderingContext2D, y: number, x1: number, rgb: string, a: number) => {
  if (a <= 0.01) return;
  const g = ctx.createLinearGradient(X0, 0, x1, 0);
  g.addColorStop(0, rgba(rgb, 0.15 * a));
  g.addColorStop(1, rgba(rgb, 0.85 * a));
  ctx.fillStyle = g;
  ctx.fillRect(X0, y - 14, Math.max(0, x1 - X0), 28);
  brillo(ctx, x1, y, 60, rgb, 0.35 * a);
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.8));
  linea(ctx, [[X0, EJE], [X1, EJE]], RGB.blanco, 0.35 * ka, 1);
  for (let k = 0; k <= DECADAS; k++) {
    const x = X0 + (k / DECADAS) * (X1 - X0);
    linea(ctx, [[x, EJE - (k % 5 ? 5 : 10)], [x, EJE + (k % 5 ? 5 : 10)]], RGB.blanco, 0.5 * ka, 1);
    if (k % 5 === 0) potencia(ctx, "", k, x, EJE + 38, 20, RGB.blanco, 0.6 * ka, "center");
  }
  rotulo(ctx, "m/s² · escala logarítmica", X0, EJE + 80, { a: ka, size: 13 });
  const kd = 1 - 0.6 * eOut(pr(t, T_DESP, 0.6));
  barra(ctx, Y_G, xLog(G) * 1 + 0, RGB.blanco, ka * kd);
  rotulo(ctx, `gravedad · ${num(G, 1)}`, X0, Y_G - 40, { a: ka * kd, size: 14 });
  const ke = eOut(pr(t, T_18 - 0.6, 0.4));
  const v = valorE(t);
  barra(ctx, Y_E, xLog(v), RGB.neg, ke);
  rotulo(ctx, `electrón en ${num(E_LAB, 0)} N/C`, X0, Y_E - 40, { a: ke, size: 14 });
  const [m, e] = partes(v, 2);
  potencia(ctx, m, e, Math.min(xLog(v) - 10, X1 - 10), Y_E - 46, 28, RGB.neg, ke, "right");
  // Cuántas décadas separan las dos barras.
  const kb = eOut(pr(t, T_GRAV, 0.5));
  linea(ctx, [[xLog(G), Y_G + 22], [xLog(G), Y_E - 22]], RGB.blanco, 0.3 * kb, 1, [3, 5]);
  linea(ctx, [[xLog(A_E), Y_G + 22], [xLog(A_E), Y_E - 22]], RGB.blanco, 0.3 * kb, 1, [3, 5]);
  linea(ctx, [[xLog(G), (Y_G + Y_E) / 2], [xLog(A_E), (Y_G + Y_E) / 2]], RGB.azul, 0.7 * kb, 1.5);
  rotulo(ctx, `${num(Math.log10(RAZON), 1)} décadas`, (xLog(G) + xLog(A_E)) / 2, (Y_G + Y_E) / 2 - 20, { a: kb, size: 14, align: "center", rgb: RGB.azul });
  rotulo(ctx, "despreciable", xLog(G) + 20, Y_G, { a: eOut(pr(t, T_DESP + 0.2, 0.5)), size: 14 });
};

export const Despreciable: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Frente a eso, *la gravedad no se nota*" />
      <Hud
        t0={T_18}
        items={[
          { l: "Eléctrica / gravedad", v: <Tex tex={cient(valorE(t) / G, 2)} size={46} color={C.azul} />, azul: true },
          { l: "Con partículas elementales", v: "se desprecia", t: T_ELEM },
        ]}
      />
    </Escena>
  );
};
