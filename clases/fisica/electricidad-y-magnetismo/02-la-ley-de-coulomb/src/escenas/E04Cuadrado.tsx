import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza } from "../lab/cargas";
import { brillo, chispa, linea, variable, type Pt } from "../lab/luz";
import { Potencia } from "../fisica";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 4;
const T_CAE = w(E, "cae");
const T_DOBLE = w(E, "doble");
const T_CUARTO = w(E, "cuarto");
const T_HOY = w(E, "hoy");
export const sfx04: Sfx[] = [
  [E, T_DOBLE, "tic"],
  [E, T_CUARTO, "golpe"],
  [E, T_HOY + 0.4, "check"],
];

const A = { x: 250, y: 560 };
const R0 = 230; // px de la separación inicial r₀
const UNIDAD = 130;
// Separación en unidades de r₀: se estira de 1 a 2.
const sep = (t: number) => 1 + eIO(pr(t, T_DOBLE - 0.1, T_CUARTO + 0.3 - T_DOBLE));
const ley = (r: number) => 1 / (r * r);

// Gráfico de F (en F₀) contra r (en r₀).
const G0 = { x: 170, y: 1010 };
const SX = 265; // px por r₀
const SY = 175; // px por F₀
const RMIN = 0.75;
const RMAX = 3.0;
const punto = (r: number, f: number): Pt => [G0.x + r * SX, G0.y - f * SY];

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  const r = sep(t);
  const F = ley(r);
  const Bx = A.x + R0 * r;
  linea(ctx, [[A.x, A.y], [Bx, A.y]], RGB.blanco, 0.14 * k, 1, [4, 7]);
  cargaQ(ctx, A.x, A.y, 12, 1, k, t);
  cargaQ(ctx, Bx, A.y, 12, 1, k, t);
  fuerza(ctx, A.x, A.y, -1, 0, UNIDAD * F * k, RGB.hielo, k);
  fuerza(ctx, Bx, A.y, 1, 0, UNIDAD * F * k, RGB.hielo, k);
  variable(ctx, "r", "", (A.x + Bx) / 2, A.y + 40, 32, RGB.blanco, k, "center");

  // Ejes y curva 1/r², que se dibuja de izquierda a derecha.
  const kg = eOut(pr(t, T_CAE - 0.2, 1.2));
  linea(ctx, [[G0.x, G0.y], [G0.x + RMAX * SX + 20, G0.y]], RGB.blanco, 0.4 * kg, 1.2);
  linea(ctx, [[G0.x, G0.y], [G0.x, G0.y - 1.75 * SY]], RGB.blanco, 0.4 * kg, 1.2);
  variable(ctx, "F", "", G0.x - 14, G0.y - 1.75 * SY + 4, 28, RGB.blanco, kg, "right");
  variable(ctx, "r", "", G0.x + RMAX * SX + 34, G0.y, 28, RGB.blanco, kg, "left");
  const pts: Pt[] = [];
  const n = 90;
  for (let i = 0; i <= n * kg; i++) {
    const rr = RMIN + ((RMAX - RMIN) * i) / n;
    pts.push(punto(rr, ley(rr)));
  }
  linea(ctx, pts, RGB.azul, 0.25 * kg, 7);
  linea(ctx, pts, RGB.azul, 0.9 * kg, 2);
  for (const [rr, base] of [[1, "r"], [2, "2r"]] as const) {
    const [x] = punto(rr, 0);
    linea(ctx, [[x, G0.y - 6], [x, G0.y + 6]], RGB.blanco, 0.6 * kg, 1.2);
    variable(ctx, base, "0", x, G0.y + 32, 26, RGB.blanco, kg * 0.85, "center");
  }
  // Punto que sigue a la separación actual, con sus guías.
  const [px, py] = punto(r, F);
  const kp = eOut(pr(t, T_CAE + 0.6, 0.6));
  linea(ctx, [[px, G0.y], [px, py]], RGB.blanco, 0.3 * kp, 1, [3, 6]);
  linea(ctx, [[G0.x, py], [px, py]], RGB.blanco, 0.3 * kp, 1, [3, 6]);
  brillo(ctx, px, py, 34, RGB.azul, 0.5 * kp);
  chispa(ctx, px, py, 5, RGB.azul, kp);
};

export const Cuadrado: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const r = sep(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Doble distancia, *un cuarto de la fuerza*" />
      <Hud
        t0={T_CAE}
        items={[
          { l: "Separación", v: `×${num(r, 2)}`, u: <Tex tex="r_0" size={28} color="rgba(244,245,248,.74)" />, t: T_CAE },
          { l: "Fuerza", v: `×${num(ley(r), 2)}`, u: <Tex tex="F_0" size={28} color="#5B86FF" />, azul: true, t: T_CAE + 0.15 },
          { l: "Exponente medido", v: "2", u: <span>± pocas partes en <Potencia e={16} /></span>, t: T_HOY + 0.3 },
        ]}
      />
    </Escena>
  );
};
