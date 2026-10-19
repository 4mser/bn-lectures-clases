import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { flecha, linea, rotulo } from "../lab/luz";
import { esfera, hito, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 3;
const T_1733 = w(E, "tres");
const T_VITREA = w(E, "vítrea");
const T_RESINOSA = w(E, "resinosa");
const T_REPELEN = w(E, "repelen");
const T_ATRAEN = w(E, "atraen");
export const sfx03: Sfx[] = [
  [E, T_1733, "tic"],
  [E, T_VITREA, "tic"],
  [E, T_RESINOSA, "tic"],
  [E, T_REPELEN, "golpe"],
  [E, T_ATRAEN, "golpe"],
];

const Y_BARRA = 545;
const L = 330;
const R_BOLA = 20;
const RAD = Math.PI / 180;
// Dos pares de péndulos: cada uno cuelga de su propio punto, separados SEP.
const SEP = 130;
const PARES = [
  { cx: 300, signos: [true, true], abre: 12 * RAD, t0: T_REPELEN - 0.4, nombre: "Vítrea · vítrea" },
  { cx: 780, signos: [true, false], abre: -6 * RAD, t0: T_ATRAEN - 0.4, nombre: "Vítrea · resinosa" },
];

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kb = eOut(pr(t, 0.2, 0.8));
  linea(ctx, [[150, Y_BARRA], [930, Y_BARRA]], RGB.blanco, 0.5 * kb, 2.5);
  PARES.forEach((p) => {
    const giro = p.abre * eIO(pr(t, p.t0, 1.1));
    const kf = eOut(pr(t, p.t0 + 0.3, 0.6));
    [-1, 1].forEach((lado, j) => {
      const px = p.cx + (lado * SEP) / 2;
      const ang = lado * giro;
      const bx = px + Math.sin(ang) * L;
      const by = Y_BARRA + Math.cos(ang) * L;
      linea(ctx, [[px, Y_BARRA], [bx, by]], RGB.blanco, 0.45 * kb, 1.2);
      const positivo = p.signos[j];
      const kc = eOut(pr(t, positivo ? T_VITREA : T_RESINOSA, 0.6));
      esfera(ctx, bx, by, R_BOLA, RGB.blanco, kb * (1 - kc));
      esfera(ctx, bx, by, R_BOLA, positivo ? RGB.pos : RGB.neg, kc);
      signo(ctx, bx, by, 8, positivo, kc);
      // Fuerza eléctrica sobre cada bola: hacia afuera si se repelen, hacia adentro si se atraen.
      const dir = Math.sign(p.abre) * lado;
      if (dir * lado > 0) flecha(ctx, bx + dir * (R_BOLA + 8), by, bx + dir * (R_BOLA + 8 + 60 * kf), by, RGB.azul, kf, 3, 15);
      else flecha(ctx, bx - dir * 4, by - 46, bx + dir * 26 * kf, by - 46, RGB.azul, kf, 3, 12);
      rotulo(ctx, positivo ? "Vítrea" : "Resinosa", bx + lado * 6, by + 52, { a: kc, align: lado < 0 ? "right" : "left", size: 13, rgb: positivo ? RGB.hielo : RGB.neg });
    });
    rotulo(ctx, p.nombre, p.cx, Y_BARRA - 30, { a: eOut(pr(t, p.t0 - 0.2, 0.6)), align: "center", size: 15 });
  });
  hito(ctx, "1733", "Charles du Fay", 540, 445, eOut(pr(t, T_1733, 0.7)), "center");
};

export const DuFay: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Dos clases: *iguales se repelen*, distintas se atraen" />
      <Hud
        t0={T_REPELEN}
        items={[
          { l: "Mismo tipo", v: "se repelen", azul: true, t: T_REPELEN },
          { l: "Distinto tipo", v: "se atraen", t: T_ATRAEN },
        ]}
      />
    </Escena>
  );
};
