import React from "react";
import { Cabeza, Escena, Mono, aparece, useT } from "../comun";
import { Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { azar, barraLuz, brillo, chispa, linea, rgba, variable, type Pt } from "../lab/luz";
import { proyectar, type Camara } from "../lab/proyeccion";
import { INFO, w } from "../linea";
import { C, RGB, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 3;
const T_LAMBDA = w(E, "lambda");
const T_SIGMA = w(E, "sigma");
const T_RHO = w(E, "ro");
const T_DQ = w(E, "trocito");
const T_DENS = w(E, "densidad");
export const sfx03: Sfx[] = [
  [E, T_LAMBDA, "tic"],
  [E, T_SIGMA, "tic"],
  [E, T_RHO, "tic"],
  [E, T_DQ, "check"],
];

const Y = 640;
const COLUMNAS = [200, 540, 880];
const SUP: Camara = { cx: COLUMNAS[1], cy: Y + 10, psi: 0.62, el: 0.55 };
const VOL: Camara = { cx: COLUMNAS[2], cy: Y + 20, psi: 0.62, el: 0.42 };

// El trocito dq late en blanco sobre su distribución.
const late = (t: number) => eOut(pr(t, T_DQ, 0.6)) * (0.75 + 0.25 * Math.sin((t - T_DQ) * 5));

const lineaCargada = (ctx: CanvasRenderingContext2D, t: number) => {
  const k = eOut(pr(t, T_LAMBDA - 0.2, 0.8));
  const x = COLUMNAS[0];
  barraLuz(ctx, x - 115, Y, lerp(x - 115, x + 115, k), Y, RGB.pos, k, t, 5);
  const kd = late(t);
  if (kd <= 0) return;
  linea(ctx, [[x - 10, Y], [x + 18, Y]], "250,252,255", kd, 7);
  brillo(ctx, x + 4, Y, 40, RGB.blanco, 0.35 * kd);
  for (const xx of [x - 10, x + 18]) linea(ctx, [[xx, Y - 22], [xx, Y - 12]], RGB.blanco, 0.7 * kd, 1.2);
  variable(ctx, "dq", "", x + 4, Y - 46, 30, RGB.blanco, kd, "center");
};

const superficie = (ctx: CanvasRenderingContext2D, t: number) => {
  const k = eOut(pr(t, T_SIGMA - 0.2, 0.8));
  if (k <= 0) return;
  const L = 130 * k;
  const n = 6;
  const p = (u: number, v: number) => {
    const q = proyectar(SUP, lerp(-L, L, u), lerp(-L, L, v), 0);
    return [q.sx, q.sy] as Pt;
  };
  ctx.fillStyle = rgba(RGB.malla, 0.16 * k);
  ctx.beginPath();
  [p(0, 0), p(1, 0), p(1, 1), p(0, 1)].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i <= n; i++) {
    linea(ctx, [p(i / n, 0), p(i / n, 1)], RGB.malla, (i % n ? 0.4 : 0.9) * k, i % n ? 1 : 1.8);
    linea(ctx, [p(0, i / n), p(1, i / n)], RGB.malla, (i % n ? 0.4 : 0.9) * k, i % n ? 1 : 1.8);
  }
  for (let j = 0; j < 30; j++) {
    const [x, y] = p(azar(j * 1.9), azar(j * 3.7 + 1));
    chispa(ctx, x, y, 1.5, RGB.pos, k * (0.5 + 0.5 * Math.sin(t * 2.2 + j)));
  }
  const kd = late(t);
  if (kd <= 0) return;
  ctx.fillStyle = rgba("250,252,255", 0.85 * kd);
  ctx.beginPath();
  [p(3 / n, 2 / n), p(4 / n, 2 / n), p(4 / n, 3 / n), p(3 / n, 3 / n)].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  const [cx, cy] = p(3.5 / n, 2.5 / n);
  brillo(ctx, cx, cy, 44, RGB.blanco, 0.35 * kd);
  variable(ctx, "dq", "", cx, cy - 48, 30, RGB.blanco, kd, "center");
};

const ARISTAS: [number, number][] = [
  [0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7],
];
const cubo = (ctx: CanvasRenderingContext2D, cx: number, cy: number, cz: number, lado: number, rgb: string, a: number, ancho: number) => {
  const v = Array.from({ length: 8 }, (_, i) => {
    const q = proyectar(VOL, cx + ((i & 1 ? 1 : -1) * lado) / 2, cy + ((i & 2 ? 1 : -1) * lado) / 2, cz + ((i & 4 ? 1 : -1) * lado) / 2);
    return [q.sx, q.sy] as Pt;
  });
  ARISTAS.forEach(([a0, a1]) => linea(ctx, [v[a0], v[a1]], rgb, a, ancho));
};

const volumen = (ctx: CanvasRenderingContext2D, t: number) => {
  const k = eOut(pr(t, T_RHO - 0.2, 0.8));
  if (k <= 0) return;
  const lado = 170 * k;
  cubo(ctx, 0, 0, 0, lado, RGB.malla, 0.85 * k, 1.6);
  for (let j = 0; j < 140; j++) {
    const q = proyectar(VOL, (azar(j * 1.3) - 0.5) * lado, (azar(j * 2.7 + 4) - 0.5) * lado, (azar(j * 4.1 + 2) - 0.5) * lado);
    chispa(ctx, q.sx, q.sy, 1.3, RGB.pos, k * (0.35 + 0.35 * Math.sin(t * 2 + j)));
  }
  const kd = late(t);
  if (kd <= 0) return;
  cubo(ctx, 20, -10, 15, 34, "250,252,255", kd, 2.2);
  const c = proyectar(VOL, 20, -10, 15);
  brillo(ctx, c.sx, c.sy, 44, RGB.blanco, 0.4 * kd);
  variable(ctx, "dq", "", c.sx, c.sy - 52, 30, RGB.blanco, kd, "center");
};

// Antes de la densidad: cargas sueltas que se apagan cuando la voz dice «densidad».
const sueltas = (ctx: CanvasRenderingContext2D, t: number) => {
  const k = eOut(pr(t, 0.1, 0.6)) * (1 - eOut(pr(t, T_DENS, 0.6)));
  for (let j = 0; j < 60; j++) {
    chispa(ctx, lerp(110, 970, azar(j * 1.1)), Y + (azar(j * 2.3) - 0.5) * 260, 2.6, RGB.pos, k * (0.5 + 0.5 * Math.sin(t * 2 + j)));
  }
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  sueltas(ctx, t);
  lineaCargada(ctx, t);
  superficie(ctx, t);
  volumen(ctx, t);
};

const PIES: { tex: string; rotulo: string; t0: number }[] = [
  { tex: "dq=\\lambda\\,dl", rotulo: "Línea · C/m", t0: T_LAMBDA },
  { tex: "dq=\\sigma\\,dA", rotulo: "Superficie · C/m²", t0: T_SIGMA },
  { tex: "dq=\\rho\\,dV", rotulo: "Volumen · C/m³", t0: T_RHO },
];

export const Densidad: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Dejamos de contar cargas: *usamos una densidad*" />
      {PIES.map((p, i) => (
        <div key={p.tex} style={{ position: "absolute", left: COLUMNAS[i] - 170, width: 340, top: 860, textAlign: "center", ...aparece(t, p.t0 + 0.1, 0.7, 14) }}>
          <Tex tex={p.tex} size={44} />
          <div style={{ marginTop: 18 }}>
            <Mono size={14} color={C.texto3}>
              {p.rotulo}
            </Mono>
          </div>
        </div>
      ))}
    </Escena>
  );
};
