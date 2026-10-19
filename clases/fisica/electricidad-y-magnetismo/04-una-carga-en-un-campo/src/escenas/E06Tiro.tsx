import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { angulo, brillo, carga, chispa, flecha, linea, rotulo, variable } from "../lab/luz";
import { camino, placas, rastro, type Placas } from "../lab/campo";
import { INFO, w } from "../linea";
import { C, RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 6;
const T_ANG = w(E, "angulo");
const T_TIRO = w(E, "tiro");
const T_G = w(E, "ge");
const T_QE = w(E, "E");
export const sfx06: Sfx[] = [
  [E, T_TIRO, "tic"],
  [E, T_G, "tic"],
  [E, T_QE, "check"],
];

// Lanzamiento inclinado θ = 60°: a la izquierda un proyectil con g, a la derecha una carga positiva en un campo
// uniforme hacia abajo con |q|E/m igual a g. Las dos trayectorias son la misma parábola (ecuación 1.22).
const THETA = (60 * Math.PI) / 180;
const SUELO = 930;
const RANGO = 330;
const TV = 2.4; // s de animación de vuelo
const VX = RANGO / TV;
const VY = VX * Math.tan(THETA);
const A = (2 * VY) / TV; // px/s²: el mismo número representa g y |q|E/m
const V0 = Math.hypot(VX, VY);
const IZQ = { x: 120 };
const DER: Placas = { x0: 570, x1: 990, y0: 470, y1: SUELO };
const T_LANZA = T_TIRO - 0.3;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.9));
  // Izquierda: suelo y gravedad.
  linea(ctx, [[90, SUELO], [510, SUELO]], RGB.blanco, 0.3 * ka, 1.2);
  rotulo(ctx, "proyectil", 90, 420, { a: ka, size: 14 });
  rotulo(ctx, "carga en campo uniforme", DER.x0, 420, { a: ka, size: 14 });
  const kg = 1 + 0.6 * Math.max(0, Math.sin(Math.PI * pr(t, T_G - 0.1, 0.9)));
  flecha(ctx, 480, 500, 480, 500 + 90 * Math.min(kg, 1.3), RGB.hielo, 0.75 * ka * Math.min(kg, 1.3), 2.5, 14);
  variable(ctx, "g", "", 452, 520, 30, RGB.hielo, ka, "center");
  // Derecha: placas.
  placas(ctx, t, DER, ka, { n: 5, etiqueta: false });
  const s = Math.min(TV, Math.max(0, t - T_LANZA));
  const ki = eOut(pr(t, T_ANG - 0.3, 0.6));
  for (const [x0, cuerpo] of [[IZQ.x + 40, "bola"], [DER.x0 + 40, "carga"]] as const) {
    const y0 = SUELO - 8;
    // Velocidad inicial y su ángulo.
    flecha(ctx, x0, y0, x0 + 90 * Math.cos(THETA) * ki, y0 - 90 * Math.sin(THETA) * ki, RGB.blanco, 0.8 * ki, 2.2, 13);
    angulo(ctx, x0, y0, 34, -THETA, 0, RGB.blanco, 0.5 * ki);
    variable(ctx, "θ", "", x0 + 50, y0 - 18, 22, RGB.blanco, ki);
    if (t < T_LANZA) {
      if (cuerpo === "bola") chispa(ctx, x0, y0, 7, RGB.blanco, ka);
      else carga(ctx, x0, y0, 9, RGB.pos, ka, t);
      continue;
    }
    const pts = camino(x0, y0, VX, -VY, 0, A, s, 80);
    rastro(ctx, pts, cuerpo === "bola" ? RGB.blanco : RGB.azul, 0.85, 2.2);
    const [x, y] = pts[pts.length - 1];
    if (cuerpo === "bola") {
      brillo(ctx, x, y, 26, RGB.blanco, 0.3);
      chispa(ctx, x, y, 7, RGB.blanco, 1);
    } else {
      carga(ctx, x, y, 9, RGB.pos, 1, t);
      const kf = eOut(pr(t, T_QE - 0.2, 0.5)) * (1 - eOut(pr(t, T_LANZA + TV, 0.3)));
      flecha(ctx, x, y + 18, x, y + 18 + 70 * kf, RGB.azul, kf, 3, 14);
    }
  }
};

export const Tiro: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const s = Math.min(TV, Math.max(0, t - T_LANZA));
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Tiro parabólico, *con qE/m en lugar de g*" />
      <Formula tex="a_y=-g\quad\longrightarrow\quad a_y=\frac{qE_y}{m}" t0={T_G - 0.2} top={960} size={44} />
      <Hud
        t0={T_TIRO}
        items={[
          { l: "Ángulo", v: `${num((THETA * 180) / Math.PI, 0)}°` },
          { l: "Velocidad en x", v: num(VX / V0, 2), u: <Tex tex="v_0" size={26} /> },
          { l: "Velocidad en y", v: num((VY - A * s) / V0, 2), u: <Tex tex="v_0" size={26} color={C.azul} />, azul: true },
        ]}
      />
    </Escena>
  );
};
