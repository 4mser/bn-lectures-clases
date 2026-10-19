import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { TAU, brillo, linea, rgba, rotulo, type Pt } from "../lab/luz";
import { hito, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 9;
const T_ACELERADO = w(E, "acelerado");
const T_RADIA = w(E, "radia");
const T_NUCLEO = w(E, "núcleo");
const T_1913 = w(E, "trece");
const T_ESTAC = w(E, "estacionarias");
const T_NORADIA = w(E, "radia", 1);
export const sfx09: Sfx[] = [
  [E, T_RADIA, "alerta"],
  [E, T_NUCLEO + 0.3, "golpe"],
  [E, T_1913, "tic"],
  [E, T_ESTAC, "check"],
];

const C0 = { x: 540, y: 705 };
const R0 = 235;
// Modelo clásico: desde «radia» el radio cae hasta el núcleo; la velocidad angular crece como r^(−3/2).
const T_CAE = T_RADIA;
const T_CHOCA = T_NUCLEO + 0.3;
const radio = (t: number) => R0 * (1 - Math.pow(pr(t, T_CAE, T_CHOCA - T_CAE), 2.2) * 0.96);
const W0 = 2.2; // rad/s en la órbita inicial
// Ángulo recorrido: integra ω = W0 (R0/r)^{3/2} con paso fijo (función pura de t).
const anguloClasico = (t: number) => {
  let a = 0;
  const h = 1 / 120;
  for (let s = 0; s < Math.min(t, T_CHOCA); s += h) a += W0 * Math.pow(R0 / radio(s), 1.5) * h;
  return a;
};
const ORBITAS = [110, 185, 260];

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  const kB = eOut(pr(t, T_CHOCA + 0.5, 0.8));
  const kR = 1 - eIO(pr(t, T_CHOCA + 0.4, 0.6));
  // Núcleo.
  brillo(ctx, C0.x, C0.y, 70, RGB.pos, 0.45 * k);
  signo(ctx, C0.x, C0.y, 13, true, k);
  // Modelo clásico: órbita que se encoge, radiación en anillos y el choque.
  if (kR > 0.01 && t < T_CHOCA + 1) {
    const ang = anguloClasico(t);
    const r = radio(t);
    const ex = C0.x + Math.cos(ang) * r;
    const ey = C0.y + Math.sin(ang) * r;
    // Estela de la espiral.
    const estela: Pt[] = [];
    for (let s = Math.max(0, t - 1.2); s <= Math.min(t, T_CHOCA); s += 1 / 60) {
      const a = anguloClasico(s);
      const rr = radio(s);
      estela.push([C0.x + Math.cos(a) * rr, C0.y + Math.sin(a) * rr]);
    }
    linea(ctx, estela, RGB.neg, 0.45 * kR * k, 1.5);
    // Anillos de radiación emitidos cada 0,25 s desde «radia».
    for (let e0 = T_RADIA; e0 < Math.min(t, T_CHOCA); e0 += 0.25) {
      const edad = t - e0;
      const a = anguloClasico(e0);
      const rr = radio(e0);
      const rad = 8 + edad * 170;
      const alfa = Math.max(0, 1 - edad / 0.8) * kR;
      ctx.save();
      ctx.strokeStyle = rgba(RGB.neg, 0.4 * alfa);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(C0.x + Math.cos(a) * rr, C0.y + Math.sin(a) * rr, rad, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    if (t < T_CHOCA) signo(ctx, ex, ey, 9, false, k * kR);
    const kChoque = pr(t, T_CHOCA, 0.6);
    if (kChoque > 0 && kChoque < 1) brillo(ctx, C0.x, C0.y, 60 + 200 * kChoque, RGB.neg, 0.8 * (1 - kChoque));
  }
  rotulo(ctx, "Átomo clásico", 90, 455, { a: k * kR, align: "left", size: 15 });
  rotulo(ctx, "Radia y cae en espiral", 90, 485, { a: eOut(pr(t, T_RADIA, 0.6)) * kR, align: "left", size: 15, rgb: RGB.neg });
  // Bohr: órbitas estacionarias, el electrón gira sin radiar.
  if (kB > 0.01) {
    ORBITAS.forEach((r, i) => {
      ctx.save();
      ctx.strokeStyle = rgba(RGB.hielo, (i === 1 ? 0.6 : 0.3) * kB);
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(C0.x, C0.y, r * lerp(0.9, 1, kB), 0, TAU);
      ctx.stroke();
      ctx.restore();
    });
    const a = (t - T_CHOCA) * 1.6;
    const r = ORBITAS[1];
    const estela: Pt[] = [];
    for (let s = -0.9; s <= 0; s += 0.03) estela.push([C0.x + Math.cos(a + s) * r, C0.y + Math.sin(a + s) * r]);
    linea(ctx, estela, RGB.neg, 0.5 * kB, 2);
    signo(ctx, C0.x + Math.cos(a) * r, C0.y + Math.sin(a) * r, 9, false, eOut(pr(t, T_CHOCA + 0.8, 0.5)));
    rotulo(ctx, "Órbitas estacionarias · no radia", C0.x, C0.y + ORBITAS[2] + 34, { a: eOut(pr(t, T_NORADIA - 0.5, 0.6)), align: "center", size: 15, rgb: RGB.hielo });
  }
  hito(ctx, "1913", "Niels Bohr", 990, 470, eOut(pr(t, T_1913, 0.7)), "right");
};

export const Bohr: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Bohr: *órbitas estacionarias*, sin radiar" />
      <Hud
        t0={T_ACELERADO}
        items={[
          { l: "Radio de la órbita clásica", v: num(radio(t) / R0), u: "× el inicial" },
          { l: "Órbita de Bohr", v: "estable", azul: true, t: T_ESTAC },
        ]}
      />
    </Escena>
  );
};
