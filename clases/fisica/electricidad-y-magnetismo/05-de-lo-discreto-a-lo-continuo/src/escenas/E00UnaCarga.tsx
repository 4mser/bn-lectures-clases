import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { brillo, carga, flecha, rayos, rgba, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 0;
const T_R = 1.4; // aparece la sonda a distancia r
const T_2R = w(E, "doble");
const T_CUARTO = w(E, "cuatro");
export const sfx00: Sfx[] = [
  [E, T_R, "tic"],
  [E, T_2R, "tic"],
  [E, T_CUARTO, "golpe"],
];

const Q = { x: 250, y: 700 };
const R = 230;
const LARGO = 170; // flecha del campo a distancia r; a 2r mide la cuarta parte

// Sonda: anillo punteado de radio d (la «esfera» a esa distancia) y la flecha del campo en el eje.
const sonda = (ctx: CanvasRenderingContext2D, t: number, t0: number, d: number, largo: number, texto: string) => {
  const k = eOut(pr(t, t0, 0.8));
  if (k <= 0) return;
  ctx.save();
  ctx.strokeStyle = rgba(RGB.hielo, 0.22 * k);
  ctx.setLineDash([3, 7]);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(Q.x, Q.y, d * (0.85 + 0.15 * k), -1.1, 1.1);
  ctx.stroke();
  ctx.restore();
  const x = Q.x + d;
  brillo(ctx, x, Q.y, 30, RGB.blanco, 0.2 * k);
  ctx.fillStyle = rgba(RGB.blanco, k);
  ctx.beginPath();
  ctx.arc(x, Q.y, 5, 0, Math.PI * 2);
  ctx.fill();
  flecha(ctx, x, Q.y, x + largo * k, Q.y, RGB.azul, k, 3.5, 20);
  rotulo(ctx, texto, x, Q.y + 52, { a: k, align: "center", size: 15 });
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 1.2));
  rayos(ctx, Q.x, Q.y, 44, 34, 1100 * k, t, k);
  carga(ctx, Q.x, Q.y, 15, RGB.pos, k, t);
  variable(ctx, "+q", "", Q.x, Q.y - 70, 34, RGB.blanco, eOut(pr(t, 0.6, 0.6)), "center");
  sonda(ctx, t, T_R, R, LARGO, "distancia r");
  sonda(ctx, t, T_2R, 2 * R, LARGO / 4, "distancia 2r");
};

export const UnaCarga: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Al doble de distancia, *un cuarto del campo*" />
      <Hud
        t0={T_R}
        items={[
          { l: "A distancia r", v: "1", t: T_R + 0.2 },
          { l: "A distancia 2r", v: "0,25", u: "del campo", azul: true, t: T_CUARTO },
        ]}
      />
    </Escena>
  );
};
