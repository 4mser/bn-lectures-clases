import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { esfera, cargaQ } from "../lab/cargas";
import { linea, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, cl, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 0;
const T_REPOSO = w(E, "reposo");
const T_PUNTUAL = w(E, "puntual");
const T_DIST = w(E, "distancias");
export const sfx00: Sfx[] = [
  [E, T_PUNTUAL, "tic"],
  [E, T_DIST, "check"],
];

const A = { x: 250, y: 700 };
const B = { x: 830, y: 700 };
const D = B.x - A.x;
// Tamaño (diámetro) dividido por la distancia: de 0,30 a 0,002, en escala logarítmica.
const razon = (t: number) => Math.pow(10, lerp(Math.log10(0.3), Math.log10(0.002), eIO(pr(t, T_PUNTUAL, T_DIST + 0.6 - T_PUNTUAL))));

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.9));
  const R = (razon(t) * D) / 2;
  // Mientras la esfera es grande se ve como esfera; al achicarse queda la carga puntual.
  const kp = 1 - cl((R - 5) / 18);
  [A, B].forEach((c, i) => {
    esfera(ctx, c.x, c.y, R, i ? RGB.neg : RGB.pos, k * (1 - 0.7 * kp), t, i * 50);
    cargaQ(ctx, c.x, c.y, 12, i ? -1 : 1, k * kp, t);
  });
  // Distancia entre las cargas y tamaño de la esfera.
  const kd = eOut(pr(t, 0.8, 0.7));
  const yd = A.y + 150;
  linea(ctx, [[A.x, yd], [B.x, yd]], RGB.blanco, 0.35 * kd, 1.2, [4, 6]);
  for (const x of [A.x, B.x]) linea(ctx, [[x, yd - 10], [x, yd + 10]], RGB.blanco, 0.5 * kd, 1.2);
  rotulo(ctx, "distancia", (A.x + B.x) / 2, yd + 30, { a: kd, align: "center" });
  const yt = A.y - Math.max(R, 14) - 42;
  linea(ctx, [[A.x - R, yt], [A.x + R, yt]], RGB.blanco, 0.6 * kd, 1.4);
  for (const x of [A.x - R, A.x + R]) linea(ctx, [[x, yt - 8], [x, yt + 8]], RGB.blanco, 0.6 * kd, 1.2);
  rotulo(ctx, "tamaño", A.x, yt - 28, { a: kd, align: "center" });
  variable(ctx, "q", "1", A.x, A.y + 74, 30, RGB.blanco, kd * kp, "center");
  variable(ctx, "q", "2", B.x, B.y + 74, 30, RGB.blanco, kd * kp, "center");
};

export const Reposo: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Electrostática: *cargas en reposo*" />
      <Hud
        t0={T_REPOSO}
        items={[
          { l: "Velocidad", v: "0", u: "m/s", t: T_REPOSO },
          { l: "Tamaño ÷ distancia", v: num(razon(t), 3), azul: true, t: T_PUNTUAL - 0.3 },
        ]}
      />
    </Escena>
  );
};
