import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza, masa } from "../lab/cargas";
import { angulo, brillo, linea, rgba, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 2;
const T_REP = w(E, "repulsion");
const T_FIBRA = w(E, "fibra");
const T_ASI = w(E, "asi");
const T_EFE = w(E, "efe");
export const sfx02: Sfx[] = [
  [E, T_REP, "tic"],
  [E, T_ASI, "check"],
];

// Vista superior: la fibra cuelga en C, la varilla gira θ desde la esfera fija (a la derecha).
const C = { x: 520, y: 700 };
const L = 280;
const TH_EQ = (36 * Math.PI) / 180;
// Equilibrio κθ = ℓ F cos(θ/2), con F ∝ 1/d² y d = 2ℓ sen(θ/2). En unidades de ℓ = 1, la constante c = Aℓ/κ
// se elige para que el equilibrio quede en TH_EQ, y la razón torque de la fibra ÷ torque eléctrico es:
const fibraSobreElectrico = (th: number) => (th * 4 * Math.sin(th / 2) ** 2) / Math.cos(th / 2);
const CTE = fibraSobreElectrico(TH_EQ);
const razon = (th: number) => fibraSobreElectrico(th) / CTE;
// Fuerza eléctrica relativa a la del equilibrio.
const fuerzaRel = (th: number) => (th > 1e-3 ? Math.sin(TH_EQ / 2) ** 2 / Math.sin(th / 2) ** 2 : 9);

// Giro amortiguado hacia el equilibrio desde que aparece la repulsión.
const theta = (t: number) => {
  const tau = t - T_REP;
  if (tau <= 0) return 0;
  return TH_EQ * (1 - Math.exp(-1.25 * tau) * Math.cos(2.7 * tau));
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  const th = theta(t);
  // Escala graduada.
  for (let g = -10; g <= 60; g += 5) {
    const a = (-g * Math.PI) / 180;
    const r0 = L + 40;
    const r1 = L + (g % 10 === 0 ? 58 : 50);
    linea(ctx, [[C.x + r0 * Math.cos(a), C.y + r0 * Math.sin(a)], [C.x + r1 * Math.cos(a), C.y + r1 * Math.sin(a)]], RGB.blanco, 0.3 * k, 1.2);
  }
  // Esfera fija.
  const F = { x: C.x + L, y: C.y };
  // Varilla con la esfera móvil y el contrapeso.
  const ux = Math.cos(th);
  const uy = -Math.sin(th);
  const M = { x: C.x + L * ux, y: C.y + L * uy };
  linea(ctx, [[C.x - L * 0.8 * ux, C.y - L * 0.8 * uy], [M.x, M.y]], RGB.blanco, 0.75 * k, 3);
  masa(ctx, C.x - L * 0.8 * ux, C.y - L * 0.8 * uy, 13, k * 0.8);
  // Fibra: un punto que brilla en el eje.
  brillo(ctx, C.x, C.y, 40, RGB.blanco, 0.3 * k);
  ctx.fillStyle = rgba(RGB.blanco, k);
  ctx.beginPath();
  ctx.arc(C.x, C.y, 6, 0, Math.PI * 2);
  ctx.fill();
  rotulo(ctx, "eje de la fibra", C.x - 26, C.y - 34, { a: eOut(pr(t, T_FIBRA - 0.3, 0.6)), align: "right" });
  // Ángulo de torsión.
  const ka = eOut(pr(t, T_REP + 0.4, 0.6));
  linea(ctx, [[C.x, C.y], [C.x + L + 70, C.y]], RGB.blanco, 0.25 * ka, 1, [3, 7]);
  angulo(ctx, C.x, C.y, 110, -th, 0, RGB.azul, 0.9 * ka, 2);
  variable(ctx, "θ", "", C.x + 140 * Math.cos(-th / 2), C.y + 140 * Math.sin(-th / 2), 30, RGB.azul, ka * (th > 0.08 ? 1 : 0), "center");
  variable(ctx, "ℓ", "", C.x + (L / 2) * ux - 22 * uy * -1 - 10, C.y + (L / 2) * uy - 26, 30, RGB.blanco, ka, "center");
  cargaQ(ctx, F.x, F.y, 11, 1, k, t);
  cargaQ(ctx, M.x, M.y, 11, 1, k, t);
  rotulo(ctx, "esfera fija", F.x + 10, F.y + 50, { a: k, align: "center" });
  // Fuerza eléctrica sobre la esfera móvil: a lo largo de la recta que une las esferas.
  const dx = M.x - F.x;
  const dy = M.y - F.y;
  const d = Math.hypot(dx, dy);
  if (d > 4) {
    const lf = Math.min(190, 100 * fuerzaRel(th));
    fuerza(ctx, M.x, M.y, dx / d, dy / d, lf, RGB.hielo, ka, 20, 3, 16);
    variable(ctx, "F", "e", M.x + (dx / d) * (lf + 46), M.y + (dy / d) * (lf + 46) - 4, 30, RGB.hielo, ka, "center");
  }
};

export const Balanza: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const th = theta(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Una balanza que *convierte fuerza en ángulo*" />
      <Formula tex="F=\frac{\kappa\,|\theta|}{\ell}" t0={T_EFE} top={890} size={54} />
      <Hud
        t0={T_REP}
        items={[
          { l: "Giro de la fibra", v: `${num((th * 180) / Math.PI, 1)}°`, t: T_REP + 0.2 },
          { l: "Torque fibra ÷ eléctrico", v: num(razon(th), 2), azul: true, t: T_FIBRA },
        ]}
      />
    </Escena>
  );
};
