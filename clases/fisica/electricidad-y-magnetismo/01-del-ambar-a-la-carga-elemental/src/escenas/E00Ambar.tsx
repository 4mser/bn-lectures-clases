import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { TAU, azar, brillo, linea, rgba, type Pt } from "../lab/luz";
import { AHORA, hito, miles, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 0;
const T_HACE = w(E, "hace");
const T_FROTO = w(E, "frotó");
const T_ATRAJO = w(E, "atrajo");
const T_GRIEGO = w(E, "griego");
const T_ELEKTRON = w(E, "élektron");
export const sfx00: Sfx[] = [
  [E, T_HACE, "tic"],
  [E, T_ATRAJO + 0.6, "golpe"],
  [E, T_ELEKTRON, "check"],
];

// ~600 a. C.: cuántos años hace, redondeado a la centena.
const ANIO_TALES = -600;
const HACE = Math.round((AHORA - ANIO_TALES) / 100) * 100;

const AMBAR = { x: 540, y: 720, r: 125 };
const COLOR_AMBAR = "255,170,60";

// Contorno irregular del trozo de ámbar.
const contorno = (k: number): Pt[] =>
  Array.from({ length: 40 }, (_, i) => {
    const u = (i / 40) * TAU;
    const r = AMBAR.r * k * (1 + 0.12 * Math.sin(3 * u + 0.6) + 0.07 * Math.sin(5 * u + 2.1));
    return [AMBAR.x + r * Math.cos(u) * 1.15, AMBAR.y + r * Math.sin(u) * 0.85];
  });

// Plumas (curvas) y pajitas (rectas) repartidas por la mesa; con «atrajo» vuelan al ámbar.
const OBJETOS = Array.from({ length: 16 }, (_, i) => {
  const lado = i % 2 ? 1 : -1;
  const x0 = AMBAR.x + lado * lerp(200, 420, azar(i * 1.7));
  const y0 = lerp(600, 1010, azar(i * 2.3 + 1));
  const ang = (lado > 0 ? 0 : Math.PI) + lerp(-0.42, 0.42, azar(i * 3.1)) * Math.PI;
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  return {
    x0,
    y0,
    x1: AMBAR.x + ux * AMBAR.r * 1.32,
    y1: AMBAR.y + uy * AMBAR.r * 1.0,
    giro: azar(i * 5.3) * TAU,
    pluma: i % 3 !== 0,
    t0: T_ATRAJO + azar(i * 4.1) * 0.8,
  };
});

const pluma = (ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, a: number) => {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const L = 26;
  const p = (u: number, v: number): Pt => [x + c * u - s * v, y + s * u + c * v];
  linea(ctx, [p(-L, 0), p(L, 0)], RGB.blanco, 0.8 * a, 1.4);
  for (let k = -3; k <= 3; k++) {
    linea(ctx, [p(k * 7, 0), p(k * 7 - 6, -9)], RGB.blanco, 0.45 * a, 1);
    linea(ctx, [p(k * 7, 0), p(k * 7 - 6, 9)], RGB.blanco, 0.45 * a, 1);
  }
};
const pajita = (ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, a: number) => {
  const c = Math.cos(ang) * 22;
  const s = Math.sin(ang) * 22;
  linea(ctx, [[x - c, y - s], [x + c, y + s]], "235,205,140", 0.85 * a, 3);
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 1));
  // Ámbar: relleno con degradado y brillo cálido.
  const pts = contorno(lerp(0.8, 1, k));
  brillo(ctx, AMBAR.x, AMBAR.y, 300, COLOR_AMBAR, 0.18 * k);
  ctx.save();
  const g = ctx.createRadialGradient(AMBAR.x - 40, AMBAR.y - 40, 10, AMBAR.x, AMBAR.y, AMBAR.r * 1.3);
  g.addColorStop(0, rgba("255,214,130", 0.85 * k));
  g.addColorStop(0.5, rgba(COLOR_AMBAR, 0.55 * k));
  g.addColorStop(1, rgba("150,70,10", 0.5 * k));
  ctx.fillStyle = g;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  linea(ctx, [...pts, pts[0]], "255,200,120", 0.7 * k, 1.5);

  // Paño que frota de lado a lado.
  const kf = eOut(pr(t, T_FROTO - 0.2, 0.4)) * (1 - eIO(pr(t, T_ATRAJO - 0.3, 0.5)));
  if (kf > 0.01) {
    const dx = Math.sin((t - T_FROTO) * 9) * 70;
    ctx.save();
    ctx.fillStyle = rgba("200,205,220", 0.35 * kf);
    ctx.beginPath();
    ctx.ellipse(AMBAR.x + dx, AMBAR.y - AMBAR.r * 0.72, 80, 26, -0.1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  // Cargas que aparecen en el ámbar al frotarlo (queda con carga negativa).
  for (let i = 0; i < 9; i++) {
    const u = (i / 9) * TAU + 0.3;
    const kc = eOut(pr(t, T_FROTO + 0.15 + i * 0.12, 0.5));
    const r = AMBAR.r * (0.45 + 0.25 * azar(i * 7.7));
    signo(ctx, AMBAR.x + Math.cos(u) * r * 1.15, AMBAR.y + Math.sin(u) * r * 0.85, 9, false, kc);
  }
  // Plumas y pajitas.
  OBJETOS.forEach((o, i) => {
    const ka = eOut(pr(t, 0.4 + i * 0.05, 0.6));
    const m = eIO(pr(t, o.t0, 0.9));
    const x = lerp(o.x0, o.x1, m);
    const y = lerp(o.y0, o.y1, m) - Math.sin(m * Math.PI) * 40;
    const ang = o.giro + m * 1.5 + Math.sin(t * 1.4 + i) * 0.08 * (1 - m);
    (o.pluma ? pluma : pajita)(ctx, x, y, ang, ka);
  });
  hito(ctx, "~600 a. C.", "Tales de Mileto", 90, 470, eOut(pr(t, T_HACE, 0.7)), "left");
};

export const Ambar: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Todo empieza con *un trozo de ámbar*" />
      <Hud
        t0={T_HACE}
        items={[
          { l: "Hace unos", v: miles(HACE), u: "años", t: T_HACE + 0.2 },
          { l: "Ámbar, en griego", v: "élektron", azul: true, t: T_GRIEGO },
        ]}
      />
    </Escena>
  );
};
