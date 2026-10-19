import React from "react";
import { Cabeza, Escena, Hud, Sim, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { carga, flecha, linea, particulas, puntoP, variable, type Fuente, type Pt } from "../lab/luz";
import { campo, lineas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";

const E = 7;
const T_LINEAS = w(E, "líneas");
const T_CADA = w(E, "cada");
const T_TANGENTE = w(E, "tangente");
const T_DIRECCION = w(E, "dirección");
const T_DENSIDAD = w(E, "densidad");
export const sfx07: Sfx[] = [
  [E, T_LINEAS, "tic"],
  [E, T_TANGENTE, "check"],
  [E, T_DENSIDAD, "tic"],
];

// Dipolo: +q y −q separadas D. Una de sus líneas se destaca y un punto la recorre con su vector campo.
const Y = 700;
const D = 400;
const FUENTES: Fuente[] = [
  { x: 540 - D / 2, y: Y, q: 1 },
  { x: 540 + D / 2, y: Y, q: -1 },
];
const CAJA: [number, number, number, number] = [-200, 200, 1280, 1200];
const LINEAS = lineas(FUENTES, 16, CAJA, { pasos: 600, h: 4, r0: 10 });
// La destacada: la que sale hacia arriba, a unos 80° del eje.
const DESTACADA = (() => {
  const ang = -1.4;
  return lineas([...FUENTES], 1, CAJA, { pasos: 900, h: 3, r0: 10, fase: (i) => (i === 0 ? ang - Math.PI : 0) })[0].pts;
})();

// Índice del segmento donde va el punto: recorre la línea entre el 6 % y el 80 %.
const indice = (t: number) => Math.round(tramo(t, T_CADA - 0.2, T_DENSIDAD - T_CADA + 1.5, 0.06, 0.8) * (DESTACADA.length - 2));
// En el punto medio del segmento: dirección de la línea (cuerda) y del campo, y el ángulo entre ambas.
const enPunto = (i: number) => {
  const [a, b] = [DESTACADA[i], DESTACADA[i + 1]];
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [ex, ey] = campo(FUENTES, m[0], m[1]);
  const tx = b[0] - a[0];
  const ty = b[1] - a[1];
  const cos = (ex * tx + ey * ty) / (Math.hypot(ex, ey) * Math.hypot(tx, ty));
  const grados = (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
  return { m, ex, ey, tx, ty, grados, modulo: Math.hypot(ex, ey) * D * D };
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kl = eOut(pr(t, T_LINEAS - 0.4, 1.4));
  const kd = eOut(pr(t, T_DENSIDAD - 0.2, 0.8));
  LINEAS.forEach((l, i) => {
    const corte = l.pts.slice(0, Math.max(2, Math.round(l.pts.length * kl)));
    linea(ctx, corte, RGB.hielo, (0.14 + 0.16 * kd) * kl, 1);
    particulas(ctx, corte, t, 60, 3, RGB.hielo, 0.5 * kl, i + 9, 1.3);
  });
  const k = eOut(pr(t, 0.15, 0.7));
  carga(ctx, FUENTES[0].x, FUENTES[0].y, 13, RGB.pos, k, t);
  carga(ctx, FUENTES[1].x, FUENTES[1].y, 13, RGB.neg, k, t);
  variable(ctx, "+q", "", FUENTES[0].x, Y + 70, 32, RGB.blanco, k, "center");
  variable(ctx, "−q", "", FUENTES[1].x, Y + 70, 32, RGB.blanco, k, "center");

  // Línea destacada.
  const kh = eOut(pr(t, T_CADA - 0.5, 0.8));
  linea(ctx, DESTACADA, RGB.azul, 0.8 * kh, 2.2);

  // Punto que la recorre: tangente punteada y vector campo encima.
  const { m, ex, ey, tx, ty } = enPunto(indice(t));
  const nt = Math.hypot(tx, ty);
  const ne = Math.hypot(ex, ey);
  const kt = eOut(pr(t, T_TANGENTE - 0.3, 0.6));
  linea(ctx, [[m[0] - (tx / nt) * 150, m[1] - (ty / nt) * 150], [m[0] + (tx / nt) * 150, m[1] + (ty / nt) * 150]], RGB.blanco, 0.55 * kt, 1.2, [5, 6]);
  const kp = eOut(pr(t, T_CADA - 0.2, 0.6));
  flecha(ctx, m[0], m[1], m[0] + (ex / ne) * 110 * kp, m[1] + (ey / ne) * 110 * kp, RGB.azul, kp, 4, 20);
  puntoP(ctx, m[0], m[1], kp, "", 0, 0);
  variable(ctx, "E", "", m[0] + (ex / ne) * 110 - (ey / ne) * 34, m[1] + (ey / ne) * 110 + (ex / ne) * 34, 32, RGB.azul, kp, "center");
};

export const Tangente: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const p = enPunto(indice(t));
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="En cada punto, el campo es *tangente a la línea*" />
      <Hud
        t0={T_TANGENTE}
        items={[
          { l: <>Ángulo entre <Sim>E</Sim> y la línea</>, v: `${num(p.grados, 1)}°`, azul: true, t: T_TANGENTE },
          { l: <>|<Sim>E</Sim>| en el punto</>, v: num(p.modulo, 2), u: "kq/d²", t: T_DIRECCION },
        ]}
      />
    </Escena>
  );
};
