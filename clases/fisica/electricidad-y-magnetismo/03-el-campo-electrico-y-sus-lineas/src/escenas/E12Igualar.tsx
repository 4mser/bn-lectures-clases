import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { carga, flecha, linea, particulas, puntoP, rotulo, variable, type Fuente } from "../lab/luz";
import { KE, campo, lineas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 12;
const T_BASTA = w(E, "basta");
const T_MEDIO = w(E, "medio");
const T_MIDEN = w(E, "miden");
const T_SENTIDO = w(E, "sentido");
const T_SUMA = w(E, "suma");
export const sfx12: Sfx[] = [
  [E, T_BASTA, "alerta"],
  [E, T_MIDEN, "tic"],
  [E, T_SENTIDO, "tic"],
  [E, T_SUMA, "golpe"],
];

// +Q y −Q de 1 nC separadas 10 cm (48 px por cm); el punto medio M está a 5 cm de cada una.
const QC = 1e-9;
const L_M = 0.1;
const Y = 660;
const FUENTES: Fuente[] = [
  { x: 300, y: Y, q: 1 },
  { x: 780, y: Y, q: -1 },
];
const M = { x: 540, y: Y };
const E1 = (KE * QC) / (L_M / 2) ** 2; // N/C, cada una
// Comprobación con el campo vectorial: en M las dos contribuciones apuntan hacia +x y se suman.
const [EX_M] = campo(FUENTES, M.x, M.y);
const SUMA = E1 * Math.sign(EX_M) * (Math.abs(EX_M) / Math.abs(campo([FUENTES[0]], M.x, M.y)[0]));
const LINEAS = lineas(FUENTES, 14, [-200, 200, 1280, 1200], { pasos: 600, h: 4, r0: 10 });

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kl = eOut(pr(t, 0.3, 1.4));
  LINEAS.forEach((l, i) => {
    const corte = l.pts.slice(0, Math.max(2, Math.round(l.pts.length * kl)));
    linea(ctx, corte, RGB.hielo, 0.15 * kl, 1);
    particulas(ctx, corte, t, 60, 2, RGB.hielo, 0.45 * kl, i + 31, 1.3);
  });
  const k = eOut(pr(t, 0.15, 0.7));
  carga(ctx, FUENTES[0].x, Y, 14, RGB.pos, k, t);
  carga(ctx, FUENTES[1].x, Y, 14, RGB.neg, k, t);
  variable(ctx, "+Q", "", FUENTES[0].x, Y + 70, 32, RGB.blanco, k, "center");
  variable(ctx, "−Q", "", FUENTES[1].x, Y + 70, 32, RGB.blanco, k, "center");

  const kp = eOut(pr(t, T_MEDIO - 0.3, 0.6));
  puntoP(ctx, M.x, M.y, kp, "M", -14, 46);
  // Los dos aportes, del mismo largo; con «sentido» se ve que apuntan igual; con «suma» se apilan.
  const LARGO = 95;
  const km = eOut(pr(t, T_MIDEN - 0.2, 0.6));
  const ks = eOut(pr(t, T_SUMA - 0.3, 0.7));
  const y1 = Y - 70;
  const y2 = Y - 130;
  flecha(ctx, M.x, y1, M.x + LARGO * km, y1, RGB.hielo, km, 3, 18);
  variable(ctx, "E", "+", M.x - 18, y1, 28, RGB.hielo, km, "right");
  flecha(ctx, M.x, y2, M.x + LARGO * km, y2, RGB.neg, km, 3, 18);
  variable(ctx, "E", "−", M.x - 18, y2, 28, RGB.neg, km, "right");
  const kd = eOut(pr(t, T_SENTIDO - 0.3, 0.6));
  rotulo(ctx, "mismo sentido", M.x + LARGO + 30, (y1 + y2) / 2, { a: kd, size: 13 });
  flecha(ctx, M.x, Y, M.x + 2 * LARGO * ks, Y, RGB.azul, ks, 5, 24);
  rotulo(ctx, "se suman", M.x + LARGO + 15, Y + 36, { a: ks, size: 14, rgb: RGB.azul, align: "center" });
};

export const Igualar: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Igualar magnitudes *no basta*" />
      <Hud
        t0={T_MIDEN}
        items={[
          { l: "|E| de +Q en M", v: num(E1, 0), u: "N/C", t: T_MIDEN },
          { l: "|E| de −Q en M", v: num(E1, 0), u: "N/C", t: T_MIDEN + 0.15 },
          { l: "Campo en M", v: num(Math.abs(SUMA), 0), u: "N/C", azul: true, t: T_SUMA },
        ]}
      />
    </Escena>
  );
};
