import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { carga, flecha, linea, particulas, puntoP, trazar, type Fuente, type Pt } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 1;
const T_CADA = w(E, "cada");
const T_SUMA = w(E, "suma");
const T_RES = w(E, "vectores");
const T_LARGOS = w(E, "largos");

const CARGAS: Fuente[] = [
  { x: 200, y: 870, q: 1 },
  { x: 410, y: 975, q: 1.2 },
  { x: 770, y: 950, q: -0.8 },
  { x: 900, y: 760, q: 0.9 },
];
const P = { x: 530, y: 690 };
const A = 300; // largo de referencia: los campos van en unidades de kq/A²

// Campo de cada carga en P (unidades kq/A²) y su suma: lo que lee el HUD.
const APORTES: Pt[] = CARGAS.map((c) => {
  const dx = P.x - c.x;
  const dy = P.y - c.y;
  const r = Math.hypot(dx, dy);
  const k = (c.q * A * A) / (r * r * r);
  return [k * dx, k * dy];
});
const TOTAL: Pt = APORTES.reduce<Pt>((s, a) => [s[0] + a[0], s[1] + a[1]], [0, 0]);
const SUMA_LARGOS = APORTES.reduce((s, a) => s + Math.hypot(a[0], a[1]), 0);
const LARGO_SUMA = Math.hypot(TOTAL[0], TOTAL[1]);
const ESCALA = 130 / Math.max(...APORTES.map((a) => Math.hypot(a[0], a[1])));

// Líneas de campo: salen de las positivas; algunas terminan en la negativa.
const LINEAS: Pt[][] = CARGAS.flatMap((c, i) =>
  c.q > 0 ? Array.from({ length: 11 }, (_, j) => {
    const ang = (j / 11) * Math.PI * 2 + i * 0.4;
    return trazar(CARGAS, c.x + Math.cos(ang) * 14, c.y + Math.sin(ang) * 14, 1, 190, 6, [-80, -80, 1160, 1430]);
  }) : [],
);

export const sfx01: Sfx[] = [
  ...CARGAS.map((_, i): Sfx => [E, T_CADA + i * 0.22, "tic"]),
  [E, T_RES, "check"],
];

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kl = eOut(pr(t, 0.4, 1.4));
  LINEAS.forEach((pts, i) => {
    const corte = pts.slice(0, Math.max(2, Math.round(pts.length * kl)));
    linea(ctx, corte, RGB.hielo, 0.13 * kl, 1);
    particulas(ctx, corte, t, 60, 3, RGB.hielo, 0.6 * kl, i + 3, 1.4);
  });
  CARGAS.forEach((c, i) => carga(ctx, c.x, c.y, 11 * Math.sqrt(Math.abs(c.q)), c.q > 0 ? RGB.pos : RGB.neg, eOut(pr(t, 0.15 + i * 0.12, 0.6)), t));
  puntoP(ctx, P.x, P.y, eOut(pr(t, 0.9, 0.6)));

  // Cada aporte sale de P; con «suma» se encadenan punta con cola, y aparece la resultante.
  let base: Pt = [P.x, P.y];
  APORTES.forEach((a, i) => {
    const ka = eOut(pr(t, T_CADA + i * 0.22, 0.6));
    const km = eIO(pr(t, T_SUMA + i * 0.28, 0.6));
    const x0 = lerp(P.x, base[0], km);
    const y0 = lerp(P.y, base[1], km);
    const c = CARGAS[i];
    linea(ctx, [[c.x, c.y], [P.x, P.y]], c.q > 0 ? RGB.hielo : RGB.neg, 0.18 * ka * (1 - km), 1, [4, 6]);
    flecha(ctx, x0, y0, x0 + a[0] * ESCALA * ka, y0 + a[1] * ESCALA * ka, c.q > 0 ? RGB.hielo : RGB.neg, 0.9 * ka, 2.2, 14);
    base = [base[0] + a[0] * ESCALA, base[1] + a[1] * ESCALA];
  });
  const kr = eOut(pr(t, T_RES, 0.8));
  flecha(ctx, P.x, P.y, P.x + TOTAL[0] * ESCALA * kr, P.y + TOTAL[1] * ESCALA * kr, RGB.azul, kr, 5, 24);
};

export const Superposicion: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Varias cargas: *se suman los vectores*" />
      <Hud
        t0={T_RES}
        items={[
          { l: "Suma de los largos", v: num(SUMA_LARGOS), t: T_LARGOS - 0.2 },
          { l: "Largo de la suma", v: num(LARGO_SUMA), azul: true, t: T_RES },
        ]}
      />
    </Escena>
  );
};
