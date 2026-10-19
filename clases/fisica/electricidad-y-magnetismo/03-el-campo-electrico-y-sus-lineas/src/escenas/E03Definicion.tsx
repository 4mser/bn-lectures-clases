import React from "react";
import { Cabeza, Escena, Hud, Sim, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { carga, flecha, linea, rayos, rotulo, variable } from "../lab/luz";
import { KE } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";

const E = 3;
const T_PRUEBA = w(E, "prueba");
const T_DIVIDIDA = w(E, "dividida");
const T_DUPLICAS = w(E, "duplicas");
const T_CAMBIA = w(E, "cambia");
export const sfx03: Sfx[] = [
  [E, T_PRUEBA, "tic"],
  [E, T_DUPLICAS, "tic"],
  [E, T_CAMBIA, "check"],
];

// Fuente de 1 nC; carga de prueba a 10 cm. 40 px por centímetro.
const QF = 1e-9; // C
const R_M = 0.1; // m
const PX_CM = 40;
const FUENTE = { x: 170, y: 660 };
const PRUEBA = { x: FUENTE.x + R_M * 100 * PX_CM, y: FUENTE.y };
const E_NC = (KE * QF) / (R_M * R_M); // N/C
const q0pC = (t: number) => tramo(t, T_DUPLICAS, 1, 1, 2); // carga de prueba en pC
const PX_POR_NN = 120; // largo de la flecha de fuerza por nanonewton

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 1));
  rayos(ctx, FUENTE.x, FUENTE.y, 36, 30, 900 * k, t, 0.7 * k);
  carga(ctx, FUENTE.x, FUENTE.y, 15, RGB.pos, k, t);
  variable(ctx, "Q", "", FUENTE.x, FUENTE.y - 72, 34, RGB.blanco, k, "center");
  rotulo(ctx, "1 nC", FUENTE.x, FUENTE.y + 70, { a: k, align: "center", caja: true });

  // Distancia r.
  const kr = eOut(pr(t, T_PRUEBA - 0.3, 0.7));
  linea(ctx, [[FUENTE.x, FUENTE.y + 130], [PRUEBA.x, PRUEBA.y + 130]], RGB.blanco, 0.3 * kr, 1, [3, 6]);
  rotulo(ctx, `r = ${num(R_M * 100, 0)} cm`, (FUENTE.x + PRUEBA.x) / 2, FUENTE.y + 155, { a: kr, align: "center", caja: true });

  // Carga de prueba: crece al duplicarse.
  const q0 = q0pC(t);
  carga(ctx, PRUEBA.x, PRUEBA.y, 7 * Math.sqrt(q0), RGB.pos, kr, t);
  variable(ctx, "q", "0", PRUEBA.x, PRUEBA.y + 72, 32, RGB.blanco, kr, "center");

  // Fuerza sobre q₀ (proporcional a q₀) y campo E = F/q₀ (no cambia).
  const fN = q0 * 1e-12 * E_NC; // N
  const kf = eOut(pr(t, T_PRUEBA + 0.2, 0.7));
  const lf = fN * 1e9 * PX_POR_NN * kf;
  flecha(ctx, PRUEBA.x + 40, PRUEBA.y - 50, PRUEBA.x + 40 + lf, PRUEBA.y - 50, RGB.hielo, kf, 3, 18);
  variable(ctx, "F", "", PRUEBA.x + 52 + lf, PRUEBA.y - 50, 32, RGB.hielo, kf, "left");
  const ke = eOut(pr(t, T_DIVIDIDA, 0.7));
  const le = 108 * ke; // E = F/q₀ con q₀ = 1 pC
  flecha(ctx, PRUEBA.x + 40, PRUEBA.y, PRUEBA.x + 40 + le, PRUEBA.y, RGB.azul, ke, 4.5, 22);
  variable(ctx, "E", "", PRUEBA.x + 56 + le, PRUEBA.y, 34, RGB.azul, ke, "left");
};

export const Definicion: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const q0 = q0pC(t);
  const fN = q0 * 1e-12 * E_NC;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="El campo es la fuerza *por unidad de carga*" />
      <Formula tex="\vec E=\frac{\vec F}{q_0}" t0={T_DIVIDIDA} top={870} size={52} />
      <Hud
        t0={T_PRUEBA}
        items={[
          { l: <>Carga <Sim sub="0">q</Sim></>, v: num(q0, 2), u: "pC", t: T_PRUEBA },
          { l: <>Fuerza <Sim>F</Sim></>, v: num(fN * 1e9, 2), u: "nN", t: T_PRUEBA + 0.2 },
          { l: <><Sim>F</Sim> / <Sim sub="0">q</Sim></>, v: num(fN / (q0 * 1e-12), 0), u: "N/C", azul: true, t: T_DIVIDIDA },
        ]}
      />
    </Escena>
  );
};
