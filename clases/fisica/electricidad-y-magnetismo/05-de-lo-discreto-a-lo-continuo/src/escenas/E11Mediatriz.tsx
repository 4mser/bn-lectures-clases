import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { angulo, barraLuz, brillo, chispa, flecha, linea, particulas, puntoP, trazar, variable, type Fuente } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 11;
const T_HORIZ = w(E, "horizontales");
const T_QUEDA = w(E, "queda");
const T_ARCO = w(E, "arco");
export const sfx11: Sfx[] = [
  [E, T_HORIZ, "tic"],
  [E, T_QUEDA, "check"],
  [E, T_ARCO, "tic"],
];

export const BARRA = { x0: 140, x1: 940, y: 860 };
export const P_MED = { x: 540, y: 560 };
const MEDIO = (BARRA.x1 - BARRA.x0) / 2;
const Y = BARRA.y - P_MED.y;
const BETA = Math.atan2(MEDIO, Y);
const UNIDAD = 110; // px por kλ/y
const APORTE = 150;

const FUENTES: Fuente[] = Array.from({ length: 40 }, (_, i) => ({ x: lerp(BARRA.x0, BARRA.x1, (i + 0.5) / 40), y: BARRA.y, q: 1 / 40 }));
const LINEAS = Array.from({ length: 22 }, (_, i) => {
  const ang = (i / 22) * Math.PI * 2 + 0.1;
  const x = lerp(BARRA.x0, BARRA.x1, 0.5 + 0.5 * Math.cos(ang));
  return trazar(FUENTES, x, BARRA.y + 8 * Math.sin(ang) + (Math.sin(ang) >= 0 ? 1 : -1), 1, 110, 7, [-40, 330, 1120, 1060]);
});

// Ángulo β₀ en P, entre la vertical hacia la barra y la línea al extremo derecho.
export const marcaBeta = (ctx: CanvasRenderingContext2D, beta: number, ka: number, y = Y) => {
  const fin = Math.PI / 2 - beta;
  const lejos = 1400;
  linea(ctx, [[P_MED.x, P_MED.y], [P_MED.x, P_MED.y + y]], RGB.blanco, 0.3 * ka, 1, [4, 6]);
  linea(ctx, [[P_MED.x, P_MED.y], [P_MED.x + Math.min(lejos, y * Math.tan(beta)), P_MED.y + Math.min(y, lejos / Math.tan(beta))]], RGB.blanco, 0.25 * ka, 1, [3, 7]);
  linea(ctx, [[P_MED.x, P_MED.y], [P_MED.x - Math.min(lejos, y * Math.tan(beta)), P_MED.y + Math.min(y, lejos / Math.tan(beta))]], RGB.blanco, 0.25 * ka, 1, [3, 7]);
  angulo(ctx, P_MED.x, P_MED.y, 74, fin, Math.PI / 2, RGB.blanco, 0.65 * ka);
  variable(ctx, "β", "0", P_MED.x + 98 * Math.cos((fin + Math.PI / 2) / 2), P_MED.y + 98 * Math.sin((fin + Math.PI / 2) / 2), 28, RGB.blanco, ka, "center");
  variable(ctx, "y", "", P_MED.x - 22, P_MED.y + y / 2, 28, RGB.blanco, ka, "center");
};

export const lineasBarra = (ctx: CanvasRenderingContext2D, t: number, k: number) =>
  LINEAS.forEach((pts, i) => {
    linea(ctx, pts, RGB.hielo, 0.08 * k, 1);
    particulas(ctx, pts, t, 60, 2, RGB.hielo, 0.4 * k, i + 9, 1.3);
  });

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  lineasBarra(ctx, t, k);
  barraLuz(ctx, BARRA.x0, BARRA.y, BARRA.x1, BARRA.y, RGB.pos, k, t, 5);
  marcaBeta(ctx, BETA, eOut(pr(t, 1.0, 0.6)));
  // Par simétrico: las horizontales (ámbar, punteadas) se cancelan; las verticales se suman.
  const kp = eOut(pr(t, T_HORIZ - 0.5, 0.6));
  const kx = eOut(pr(t, T_HORIZ, 0.5));
  const kc = eIO(pr(t, T_HORIZ + 0.8, 0.7));
  for (const s of [-1, 1]) {
    const qx = P_MED.x + s * 250;
    brillo(ctx, qx, BARRA.y, 40, RGB.blanco, 0.4 * kp);
    chispa(ctx, qx, BARRA.y, 4, RGB.pos, kp);
    variable(ctx, "dq", "", qx, BARRA.y + 34, 26, RGB.blanco, kp, "center");
    const dx = P_MED.x - qx;
    const dy = P_MED.y - BARRA.y;
    const r = Math.hypot(dx, dy);
    const ex = (dx / r) * APORTE;
    const ey = (dy / r) * APORTE;
    flecha(ctx, P_MED.x, P_MED.y, P_MED.x + ex, P_MED.y + ey, RGB.hielo, kp * (1 - 0.6 * kx), 2, 13);
    flecha(ctx, P_MED.x, P_MED.y + ey, P_MED.x + ex, P_MED.y + ey, RGB.neg, kp * kx * (1 - kc), 2, 12, [5, 5]);
  }
  const kq = eOut(pr(t, T_QUEDA, 0.7));
  flecha(ctx, P_MED.x, P_MED.y, P_MED.x, P_MED.y - 2 * Math.sin(BETA) * UNIDAD * kq, RGB.azul, kq, 5, 24);
  puntoP(ctx, P_MED.x, P_MED.y, eOut(pr(t, 0.6, 0.6)), "P", 22, -4);
};

export const Mediatriz: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Mediatriz: *sobreviven las verticales*" />
      <Formula tex="E=\frac{2k\lambda\,\sin\beta_0}{y}" t0={T_QUEDA + 0.2} top={950} size={50} tFin={T_ARCO - 0.3} />
      <Formula
        tex="\underbrace{\frac{2k\lambda\,\sin\beta_0}{y}}_{\text{barra}}\quad\longleftrightarrow\quad\underbrace{\frac{2k\lambda\,\sin\theta_0}{r}}_{\text{arco}}"
        t0={T_ARCO - 0.1}
        top={925}
        size={38}
      />
      <Hud
        t0={T_QUEDA}
        items={[
          { l: "Semiángulo", v: `${num((BETA * 180) / Math.PI, 1)}°` },
          { l: "Campo en P", v: num(2 * Math.sin(BETA), 2), u: <Tex tex="k\lambda/y" size={26} color={C.azul} />, azul: true },
        ]}
        top={1100}
      />
    </Escena>
  );
};
