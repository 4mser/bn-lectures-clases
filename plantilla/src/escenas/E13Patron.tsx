import React from "react";
import { Cabeza, Escena, Mono, aparece, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { barraLuz, brillo, carga, chispa, flecha, linea, rgba, variable, type Pt } from "../lab/luz";
import { proyectar, type Camara } from "../lab/proyeccion";
import { INFO, w } from "../linea";
import { C, RGB, SANS, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 13;
const T_CUARTO = w(E, "cuarto");
const T_MITAD = w(E, "mitad");
const T_MISMO = w(E, "mismo");
const T_EXT = w(E, "extendida");
export const sfx13: Sfx[] = [
  [E, T_CUARTO, "tic"],
  [E, T_MITAD, "tic"],
  [E, T_MISMO, "golpe"],
];

const COL = [200, 540, 880];
const YF = 450; // fuentes
const D = 165; // distancia d
const LARGO = 150; // flecha a distancia d
// Cuánto queda del campo al doble de distancia: 1/r², 1/r y constante.
const FACTOR = [0.25, 0.5, 1];
const T_2D = [T_CUARTO, T_MITAD, T_MISMO];
const NOMBRES = ["Carga puntual", "Línea infinita", "Plano infinito"];

const PLANO: Camara = { cx: COL[2], cy: YF, psi: 0, el: 0.42 };
const plano = (ctx: CanvasRenderingContext2D, t: number, k: number) => {
  const p = (x: number, y: number): Pt => {
    const q = proyectar(PLANO, x, y, 0);
    return [q.sx, q.sy];
  };
  const L = 140;
  ctx.fillStyle = rgba(RGB.malla, 0.2 * k);
  ctx.beginPath();
  [p(-L, -L), p(L, -L), p(L, L), p(-L, L)].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i <= 8; i++) {
    const u = -L + (2 * L * i) / 8;
    linea(ctx, [p(u, -L), p(u, L)], RGB.malla, 0.45 * k, 1);
    linea(ctx, [p(-L, u), p(L, u)], RGB.malla, 0.45 * k, 1);
  }
  for (let j = 0; j < 24; j++) {
    const [x, y] = p(-L + 2 * L * ((j * 0.618) % 1), -L + 2 * L * ((j * 0.382 + 0.2) % 1));
    chispa(ctx, x, y, 1.4, RGB.pos, k * (0.5 + 0.5 * Math.sin(t * 2 + j)));
  }
};

const sonda = (ctx: CanvasRenderingContext2D, x: number, y: number, largo: number, k: number) => {
  if (k <= 0.01) return;
  brillo(ctx, x, y, 26, RGB.blanco, 0.22 * k);
  ctx.fillStyle = rgba(RGB.blanco, k);
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  flecha(ctx, x, y, x, y + largo * k, RGB.azul, k, 4, 20);
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ks = COL.map((_, i) => eOut(pr(t, 0.2 + i * 0.15, 0.7)));
  carga(ctx, COL[0], YF, 13, RGB.pos, ks[0], t);
  barraLuz(ctx, COL[1] - 150, YF, COL[1] + 150, YF, RGB.pos, ks[1], t, 5);
  // Puntas que se desvanecen: la línea sigue más allá.
  linea(ctx, [[COL[1] - 165, YF], [COL[1] - 210, YF]], RGB.pos, 0.35 * ks[1], 3, [3, 7]);
  linea(ctx, [[COL[1] + 165, YF], [COL[1] + 210, YF]], RGB.pos, 0.35 * ks[1], 3, [3, 7]);
  plano(ctx, t, ks[2]);
  const kd = eOut(pr(t, 0.9, 0.6));
  COL.forEach((x, i) => {
    linea(ctx, [[x, YF + 20], [x, YF + 2 * D + 10]], RGB.blanco, 0.2 * kd, 1, [3, 6]);
    sonda(ctx, x, YF + D, LARGO, kd);
    sonda(ctx, x, YF + 2 * D, LARGO * FACTOR[i], eOut(pr(t, T_2D[i] - 0.25, 0.6)));
  });
  variable(ctx, "d", "", 84, YF + D, 30, RGB.blanco, kd, "left");
  variable(ctx, "2d", "", 84, YF + 2 * D, 30, RGB.blanco, eOut(pr(t, T_CUARTO - 0.4, 0.6)), "left");
};

export const Patron: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Al doble de distancia: *un cuarto, la mitad o lo mismo*" />
      {COL.map((x, i) => (
        <div key={x} style={{ position: "absolute", left: x - 170, width: 340, top: 930, textAlign: "center", ...aparece(t, T_2D[i], 0.7, 14) }}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 54, color: i === 2 ? C.azul : C.texto, letterSpacing: -1 }}>{`×${["0,25", "0,50", "1,00"][i]}`}</div>
          <div style={{ marginTop: 6 }}>
            <Mono size={14} color={C.texto3}>
              {NOMBRES[i]}
            </Mono>
          </div>
        </div>
      ))}
      <Formula tex="E\;\propto\;\frac{1}{r^{2}},\qquad \frac{1}{r},\qquad r^{0}" t0={T_EXT} top={1080} size={40} color="rgba(244,245,248,.8)" />
    </Escena>
  );
};
