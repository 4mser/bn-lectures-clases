import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza } from "../lab/cargas";
import { brillo, linea, rgba, variable } from "../lab/luz";
import { Cien, EPS0, K } from "../fisica";
import { INFO, w } from "../linea";
import { RGB, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 6;
const T_JUNT = w(E, "juntando");
const T_CONST = w(E, "constante");
const T_EPS = w(E, "epsilon");
const T_NUEVE = w(E, "nueve");
export const sfx06: Sfx[] = [
  [E, T_JUNT + 0.6, "tic"],
  [E, T_EPS, "tic"],
  [E, T_NUEVE, "golpe"],
];

const A = { x: 320, y: 640 };
const B = { x: 760, y: 640 };

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  linea(ctx, [[A.x, A.y], [B.x, B.y]], RGB.blanco, 0.14 * k, 1, [4, 7]);
  cargaQ(ctx, A.x, A.y, 12, 1, k, t);
  cargaQ(ctx, B.x, B.y, 12, 1, k, t);
  fuerza(ctx, A.x, A.y, -1, 0, 110 * k, RGB.hielo, k);
  fuerza(ctx, B.x, B.y, 1, 0, 110 * k, RGB.hielo, k);
  variable(ctx, "q", "1", A.x, A.y - 62, 32, RGB.blanco, k, "center");
  variable(ctx, "q", "2", B.x, B.y - 62, 32, RGB.blanco, k, "center");
  // Distancia r, bajo la recta.
  const kd = eOut(pr(t, 0.6, 0.6));
  const yd = A.y + 70;
  linea(ctx, [[A.x, yd], [B.x, yd]], RGB.blanco, 0.45 * kd, 1.2);
  for (const x of [A.x, B.x]) linea(ctx, [[x, yd - 9], [x, yd + 9]], RGB.blanco, 0.6 * kd, 1.2);
  variable(ctx, "r", "", (A.x + B.x) / 2, yd + 32, 32, RGB.blanco, kd, "center");
  // Con la constante: un pulso que sale de la recta, como si se fijara la escala de la fuerza.
  const kc = eOut(pr(t, T_NUEVE, 0.8));
  if (kc > 0.01) {
    brillo(ctx, (A.x + B.x) / 2, A.y, 260 * kc, RGB.azul, 0.25 * (1 - 0.6 * kc));
    ctx.fillStyle = rgba(RGB.azul, 0);
  }
};

export const Constante: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Tres hallazgos, *una sola ley*" />
      <Formula tex="F=k_e\,\frac{|q_1|\,|q_2|}{r^{2}}" t0={T_JUNT + 0.5} tFin={T_CONST - 0.5} top={850} size={60} />
      <Formula tex="k_e=\frac{1}{4\pi\varepsilon_0}" t0={T_CONST} top={850} size={60} />
      <Hud
        t0={T_EPS}
        items={[
          { l: "Permitividad del vacío", v: <Cien v={EPS0} d={3} />, u: "C²/N·m²", t: T_EPS },
          { l: "Constante de Coulomb", v: <Cien v={K} d={2} />, u: "N·m²/C²", azul: true, t: T_NUEVE },
        ]}
      />
    </Escena>
  );
};
