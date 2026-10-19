import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza } from "../lab/cargas";
import { linea, variable } from "../lab/luz";
import { K, texto } from "../fisica";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 12;
const T_Q1 = w(E, "dos");
const T_Q2 = w(E, "menos");
const T_Q0 = w(E, "prueba");
const T_SEG = w(E, "segunda");
const T_NETA = w(E, "neta");
export const sfx12: Sfx[] = [
  [E, T_Q1, "tic"],
  [E, T_Q2, "tic"],
  [E, T_Q0, "tic"],
  [E, T_NETA + 0.3, "golpe"],
];

// Ejemplo 3 de los apuntes: q₁ = +2,0 µC en x = 0, q₂ = −3,0 µC en x = 0,20 m, q₀ = +1,0 µC en x = 0,50 m.
const Q = [
  { q: 2e-6, x: 0, t0: T_Q1, txt: "+2 µC" },
  { q: -3e-6, x: 0.2, t0: T_Q2, txt: "−3 µC" },
  { q: 1e-6, x: 0.5, t0: T_Q0, txt: "+1 µC" },
];
const Q0 = Q[2];
// Componente x de la fuerza de cada carga sobre q₀ (ley de Coulomb con signo).
const fx = (c: (typeof Q)[number]) => {
  const d = Q0.x - c.x;
  return (K * c.q * Q0.q * Math.sign(d)) / (d * d);
};
const F1 = fx(Q[0]);
const F2 = fx(Q[1]);
const NETA = F1 + F2;

const X0 = 150;
const PXM = 1560; // px por metro
const Y = 720;
const PXN = 860; // px por newton
const xDe = (m: number) => X0 + m * PXM;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  linea(ctx, [[X0 - 40, Y], [xDe(0.5) + 110, Y]], RGB.blanco, 0.35 * k, 1.2);
  for (let cm = 0; cm <= 50; cm += 10) {
    const x = xDe(cm / 100);
    linea(ctx, [[x, Y - 7], [x, Y + 7]], RGB.blanco, 0.5 * k, 1.2);
    texto(ctx, cm === 50 ? "50 cm" : String(cm), x, Y + 40, { size: 20, a: 0.5 * k, align: "center" });
  }
  variable(ctx, "x", "", xDe(0.5) + 110, Y + 36, 28, RGB.blanco, 0.6 * k, "center");
  Q.forEach((c, i) => {
    const kc = eOut(pr(t, c.t0, 0.6));
    cargaQ(ctx, xDe(c.x), Y, 10 * Math.sqrt(Math.abs(c.q) / 1e-6), c.q, kc, t);
    texto(ctx, c.txt, xDe(c.x), Y - 64, { size: 26, peso: 500, a: kc, align: "center", rgb: c.q > 0 ? "170,195,255" : "255,200,130" });
    variable(ctx, "q", String([1, 2, 0][i]), xDe(c.x), Y - 104, 26, RGB.blanco, 0.7 * kc, "center");
  });
  // Fuerzas sobre q₀: F₁ empuja hacia +x, F₂ tira hacia q₂, y la neta debajo.
  const x0 = xDe(Q0.x);
  const k1 = eOut(pr(t, T_Q0 + 0.9, 0.6));
  const k2 = eOut(pr(t, T_SEG, 0.6));
  const kn = eOut(pr(t, T_NETA, 0.7));
  fuerza(ctx, x0, Y, 1, 0, F1 * PXN * k1, RGB.hielo, k1, 20, 3, 16);
  variable(ctx, "F", "1", x0 + 20 + (F1 * PXN) / 2, Y - 34, 26, RGB.hielo, k1, "center");
  fuerza(ctx, x0, Y, 1, 0, F2 * PXN * k2, RGB.neg, k2, 20, 3, 16);
  variable(ctx, "F", "2", x0 - 20 + F2 * PXN, Y - 34, 26, RGB.neg, k2, "center");
  const yn = Y + 100;
  fuerza(ctx, x0, yn, 1, 0, NETA * PXN * kn, RGB.azul, kn, 0, 5, 22);
  texto(ctx, "neta", x0 + NETA * PXN - 20, yn + 34, { size: 22, a: kn * 0.85, rgb: RGB.azul, align: "center" });
  linea(ctx, [[x0, Y + 20], [x0, yn + 10]], RGB.blanco, 0.2 * kn, 1, [3, 5]);
};

export const Linea: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Tres cargas en línea: *gana la más cercana*" />
      <Hud
        t0={T_Q0}
        items={[
          { l: "F1 · empuja", v: num(Math.abs(F1), 3), u: "N", t: T_Q0 + 0.9 },
          { l: "F2 · atrae", v: num(Math.abs(F2), 3), u: "N", t: T_SEG },
          { l: "Neta en x", v: num(NETA, 3), u: "N", azul: true, t: T_NETA },
        ]}
      />
    </Escena>
  );
};
