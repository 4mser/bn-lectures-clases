import React from "react";
import { Cabeza, Escena, Hud, Sim, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { carga, flecha, variable, type Fuente, type Pt } from "../lab/luz";
import { KE, flechasCampo } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";

const E = 4;
const T_DIBUJA = w(E, "dibuja");
const T_POSITIVA = w(E, "positiva");
const T_NEGATIVA = w(E, "negativa");
const T_FUERZA = w(E, "fuerza");
const T_CAMPO = w(E, "campo", 1);
export const sfx04: Sfx[] = [
  [E, T_DIBUJA, "tic"],
  [E, T_NEGATIVA, "golpe"],
  [E, T_CAMPO, "check"],
];

// Fuente de 1 nC; carga de prueba de ±1 pC a 10 cm (40 px por cm).
const QF = 1e-9;
const R_M = 0.1;
const FUENTE: Fuente = { x: 260, y: 690, q: 1 };
const P = { x: FUENTE.x + 400, y: FUENTE.y };
const E_NC = (KE * QF) / (R_M * R_M);
const qpC = (t: number) => tramo(t, T_NEGATIVA - 0.1, 0.9, 1, -1);

const GRILLA: Pt[] = [];
for (let y = 420; y <= 870; y += 90)
  for (let x = 80; x <= 1020; x += 90) if (Math.hypot(x - P.x, y - P.y) > 110 && !(Math.abs(y - P.y) < 100 && x > P.x - 140 && x < P.x + 290)) GRILLA.push([x, y]);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.9));
  const kg = eOut(pr(t, T_DIBUJA - 0.3, 1));
  flechasCampo(ctx, [FUENTE], GRILLA, 2600, 62, RGB.hielo, 0.55 * kg, 0.35, 60);
  carga(ctx, FUENTE.x, FUENTE.y, 15, RGB.pos, k, t);
  variable(ctx, "Q", "", FUENTE.x, FUENTE.y - 72, 34, RGB.blanco, k, "center");

  // Carga de prueba: positiva y luego negativa. El campo en P no cambia; la fuerza sí.
  const q = qpC(t);
  const kp = eOut(pr(t, T_POSITIVA - 0.6, 0.7));
  carga(ctx, P.x, P.y, 9 * Math.max(0.35, Math.abs(q)), q >= 0 ? RGB.pos : RGB.neg, kp, t);
  variable(ctx, q >= 0 ? "+q" : "−q", "", P.x, P.y + 72, 32, RGB.blanco, kp, "center");
  const le = 150;
  flecha(ctx, P.x + 30, P.y, P.x + 30 + le * kp, P.y, RGB.azul, kp, 4.5, 22);
  variable(ctx, "E", "", P.x + 46 + le, P.y, 34, RGB.azul, kp, "left");
  const kf = eOut(pr(t, T_POSITIVA, 0.7));
  const lf = 150 * q * kf;
  const xf = P.x + Math.sign(q) * 30;
  flecha(ctx, xf, P.y - 60, xf + lf, P.y - 60, q >= 0 ? RGB.hielo : RGB.neg, kf * Math.min(1, Math.abs(q) * 3), 3, 18);
  variable(ctx, "F", "", xf + lf + (q >= 0 ? 14 : -14), P.y - 60, 32, q >= 0 ? RGB.hielo : RGB.neg, kf * Math.min(1, Math.abs(q) * 3), q >= 0 ? "left" : "right");
};

export const Convencion: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const q = qpC(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Una carga negativa invierte *la fuerza, no el campo*" />
      <Formula tex="\vec F=q\,\vec E" t0={T_FUERZA} top={935} size={52} />
      <Hud
        t0={T_POSITIVA}
        items={[
          { l: <>Carga <Sim>q</Sim></>, v: (q > 0.005 ? "+" : "") + num(q, 2), u: "pC" },
          { l: <>Fuerza <Sim sub="x">F</Sim></>, v: (q > 0.005 ? "+" : "") + num(q * 1e-12 * E_NC * 1e9, 2), u: "nN", t: T_POSITIVA + 0.12 },
          { l: <>Campo <Sim sub="x">E</Sim></>, v: "+" + num(E_NC, 0), u: "N/C", azul: true, t: T_POSITIVA + 0.24 },
        ]}
      />
    </Escena>
  );
};
