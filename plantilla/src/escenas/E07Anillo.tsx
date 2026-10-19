import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { brillo, chispa, flecha, linea, puntoP, rotulo, variable, type Pt } from "../lab/luz";
import { anilloLuz, proyectar, type Camara } from "../lab/proyeccion";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";

const E = 7;
const T_PERP = w(E, "perpendiculares");
const T_CAMPO = w(E, "campo");
const T_CERO = w(E, "cero");
const T_MAX = w(E, "maximo");
const T_LEJOS = w(E, "lejos");
export const sfx07: Sfx[] = [
  [E, T_PERP, "tic"],
  [E, T_CERO, "tic"],
  [E, T_MAX, "golpe"],
  [E, T_LEJOS, "tic"],
];

const CAM: Camara = { cx: 540, cy: 850, psi: 0, el: 0.3 };
const R = 200;
const ZMAX = 1 / Math.SQRT2;
// Campo en el eje en unidades kQ/R², con z en unidades de R.
const f = (z: number) => z / Math.pow(z * z + 1, 1.5);
const FMAX = f(ZMAX);
const LARGO = 190; // px del campo máximo

// Altura de P: en z = R, baja al centro con «cero», sube al máximo y se aleja con «lejos».
const zEn = (t: number) => {
  if (t >= T_LEJOS) return tramo(t, T_LEJOS, 1.2, ZMAX, 2);
  if (t >= T_MAX - 0.1) return tramo(t, T_MAX - 0.1, 0.8, 0, ZMAX);
  return tramo(t, T_CERO - 0.25, 0.6, 1, 0);
};

// Gráfico de E(z) a la derecha, con el punto que sigue a P.
const G = { x: 770, y: 470, w: 230, h: 150, zmax: 3 };
const gx = (z: number) => G.x + (z / G.zmax) * G.w;
const gy = (v: number) => G.y + G.h - (v / (FMAX * 1.25)) * G.h;
const grafico = (ctx: CanvasRenderingContext2D, t: number, z: number) => {
  const k = eOut(pr(t, T_CAMPO - 0.4, 0.8));
  if (k <= 0.01) return;
  linea(ctx, [[G.x, G.y - 10], [G.x, G.y + G.h], [G.x + G.w + 10, G.y + G.h]], RGB.blanco, 0.35 * k, 1);
  rotulo(ctx, "z / R", G.x + G.w + 10, G.y + G.h + 22, { a: k, size: 12, align: "right" });
  rotulo(ctx, "E", G.x + 10, G.y - 4, { a: k, size: 12 });
  const curva = (fn: (z: number) => number, z0: number): Pt[] =>
    Array.from({ length: 90 }, (_, i) => z0 + ((G.zmax - z0) * i) / 89).map((zz): Pt => [gx(zz), Math.max(G.y - 10, gy(fn(zz)))]);
  linea(ctx, curva(f, 0), RGB.azul, k, 2.2);
  // De lejos: la carga puntual kQ/z² (punteada) se pega a la curva.
  const kl = eOut(pr(t, T_LEJOS, 0.8));
  linea(ctx, curva((zz) => 1 / (zz * zz), 0.75), RGB.blanco, 0.5 * kl, 1.4, [4, 5]);
  rotulo(ctx, "carga puntual", gx(2.95), gy(1 / 9) - 22, { a: kl, size: 11, align: "right" });
  const km = eOut(pr(t, T_MAX, 0.6));
  linea(ctx, [[gx(ZMAX), G.y + G.h], [gx(ZMAX), gy(FMAX)]], RGB.blanco, 0.4 * km, 1, [3, 4]);
  chispa(ctx, gx(z), gy(f(z)), 4, RGB.azul, k);
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.2, 1));
  const z = zEn(t);
  const c = proyectar(CAM, 0, 0, 0);
  const p = proyectar(CAM, 0, 0, z * R);
  anilloLuz(ctx, CAM, R, t, ka, "atras");
  // Eje del anillo.
  const arriba = proyectar(CAM, 0, 0, 2.3 * R);
  const abajo = proyectar(CAM, 0, 0, -0.5 * R);
  linea(ctx, [[abajo.sx, abajo.sy], [arriba.sx, arriba.sy]], RGB.blanco, 0.22 * ka, 1, [4, 7]);
  brillo(ctx, c.sx, c.sy, 70, RGB.pos, 0.12 * ka);

  // Par de trocitos opuestos: sus aportes en P y la cancelación de las componentes perpendiculares.
  const kp = eOut(pr(t, T_PERP - 0.2, 0.6)) * (1 - eIO(pr(t, T_CERO - 0.5, 0.4)));
  const kx = eIO(pr(t, T_PERP + 0.9, 0.7));
  for (const s of [-1, 1]) {
    const q = proyectar(CAM, s * R, 0, 0);
    brillo(ctx, q.sx, q.sy, 40, RGB.blanco, 0.4 * kp);
    variable(ctx, "dq", "", q.sx + s * 30, q.sy + 26, 26, RGB.blanco, kp, "center");
    linea(ctx, [[q.sx, q.sy], [p.sx, p.sy]], RGB.blanco, 0.2 * kp, 1, [3, 6]);
    const dx = p.sx - q.sx;
    const dy = p.sy - q.sy;
    const L = Math.hypot(dx, dy);
    const a = 130 / L;
    flecha(ctx, p.sx, p.sy, p.sx + dx * a, p.sy + dy * a, RGB.hielo, kp * (1 - 0.5 * kx), 2, 13);
    flecha(ctx, p.sx + dx * a, p.sy + dy * a, p.sx, p.sy + dy * a, RGB.neg, kp * kx * (1 - eIO(pr(t, T_PERP + 1.8, 0.6))), 2, 12, [5, 5]);
  }
  const kf = eOut(pr(t, T_PERP + 1.6, 0.6));
  flecha(ctx, p.sx, p.sy, p.sx, p.sy - (f(z) / FMAX) * LARGO * kf, RGB.azul, kf, 5, 24);
  puntoP(ctx, p.sx, p.sy, eOut(pr(t, 0.6, 0.6)), "P", 20, 8);
  anilloLuz(ctx, CAM, R, t, ka, "frente");
  variable(ctx, "R", "", c.sx + R * 0.55, c.sy + 30, 28, RGB.blanco, eOut(pr(t, 1.2, 0.6)), "center");
  linea(ctx, [[c.sx, c.sy], [c.sx + R, c.sy]], RGB.blanco, 0.3 * eOut(pr(t, 1.2, 0.6)), 1);
  grafico(ctx, t, z);
};

export const Anillo: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const z = zEn(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Anillo: *el campo tiene un máximo*" />
      <Formula tex="E=\frac{kQ\,z}{\left(z^{2}+R^{2}\right)^{3/2}}" t0={T_CAMPO - 0.4} top={930} size={48} />
      <Hud
        t0={T_CAMPO - 0.2}
        items={[
          { l: "z / R", v: num(z, 2) },
          { l: "Campo en P", v: num(f(z), 3), u: <Tex tex="kQ/R^{2}" size={26} color="#5B86FF" />, azul: true },
          { l: "Máximo en", v: "0,707 R", t: T_MAX },
        ]}
      />
    </Escena>
  );
};
