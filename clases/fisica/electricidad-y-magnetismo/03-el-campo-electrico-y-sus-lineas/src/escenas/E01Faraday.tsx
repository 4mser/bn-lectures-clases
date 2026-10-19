import React from "react";
import { Cabeza, Escena, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { azar, linea, particulas, rgba, rotulo, type Fuente } from "../lab/luz";
import { campo, lineas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";
import { LineaTiempo } from "./Linea";

const E = 1;
const T_LINEAS = w(E, "líneas");
const T_LIMADURAS = w(E, "limaduras");
const T_TRANSMITE = w(E, "transmite");
export const sfx01: Sfx[] = [
  [E, T_LINEAS, "tic"],
  [E, T_LIMADURAS, "tic"],
  [E, T_TRANSMITE, "check"],
];

// Imán de barra como dos polos (modelo de polos: el campo de lejos es el de un dipolo).
const Y = 690;
const IMAN = { x0: 390, x1: 690, alto: 56 };
const POLOS: Fuente[] = [
  { x: IMAN.x0 + 26, y: Y, q: 1 },
  { x: IMAN.x1 - 26, y: Y, q: -1 },
];
const CAJA: [number, number, number, number] = [-200, 250, 1280, 1150];
const LINEAS = lineas(POLOS, 18, CAJA, { pasos: 500, h: 5, r0: 10 });

// Limaduras: trocitos cortos alineados con el campo en una grilla con algo de desorden.
const LIMADURAS = (() => {
  const out: { x: number; y: number; ux: number; uy: number; a: number; t: number }[] = [];
  let n = 0;
  for (let y = 410; y <= 980; y += 19) {
    for (let x = 40; x <= 1040; x += 19) {
      n++;
      const px = x + (azar(n * 1.7) - 0.5) * 14;
      const py = y + (azar(n * 2.3) - 0.5) * 14;
      if (px > IMAN.x0 - 14 && px < IMAN.x1 + 14 && Math.abs(py - Y) < IMAN.alto / 2 + 14) continue;
      const [ex, ey] = campo(POLOS, px, py);
      const m = Math.hypot(ex, ey);
      out.push({ x: px, y: py, ux: ex / m, uy: ey / m, a: Math.min(1, Math.pow(m * 3e4, 0.35)), t: azar(n * 3.9) });
    }
  }
  return out;
})();

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  // Limaduras: caen al azar y se alinean.
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = 1.6;
  for (const f of LIMADURAS) {
    const k = eOut(pr(t, T_LIMADURAS - 0.4 + f.t * 1.4, 0.5));
    if (k <= 0.01) continue;
    const l = 6.5;
    ctx.strokeStyle = rgba("200,206,220", 0.55 * k * f.a);
    ctx.beginPath();
    ctx.moveTo(f.x - f.ux * l, f.y - f.uy * l);
    ctx.lineTo(f.x + f.ux * l, f.y + f.uy * l);
    ctx.stroke();
  }
  ctx.restore();

  // Líneas de fuerza: se dibujan desde el polo norte; con «transmite» corren partículas por ellas.
  const kl = eOut(pr(t, T_LINEAS - 0.2, 1.6));
  const kp = eOut(pr(t, T_TRANSMITE - 0.3, 0.8));
  LINEAS.forEach((l, i) => {
    const corte = l.pts.slice(0, Math.max(2, Math.round(l.pts.length * kl)));
    linea(ctx, corte, RGB.azul, 0.42 * kl, 1.3);
    particulas(ctx, corte, t, 90, 4, RGB.hielo, kp, i + 5, 1.6);
  });

  // El imán.
  const ki = eOut(pr(t, 0.2, 0.8));
  const mitad = (IMAN.x0 + IMAN.x1) / 2;
  ctx.fillStyle = rgba(RGB.pos, 0.85 * ki);
  ctx.fillRect(IMAN.x0, Y - IMAN.alto / 2, mitad - IMAN.x0, IMAN.alto);
  ctx.fillStyle = rgba("120,128,148", 0.85 * ki);
  ctx.fillRect(mitad, Y - IMAN.alto / 2, IMAN.x1 - mitad, IMAN.alto);
  rotulo(ctx, "N", IMAN.x0 + 36, Y, { a: ki, size: 22, peso: 500, align: "center" });
  rotulo(ctx, "S", IMAN.x1 - 34, Y, { a: ki, size: 22, peso: 500, align: "center" });
  rotulo(ctx, "imán y limaduras de hierro", 540, 1010, { a: eOut(pr(t, T_LIMADURAS + 0.6, 0.7)), align: "center", size: 14 });
};

export const Faraday: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Para Faraday, *el espacio transmite la acción*" />
      <LineaTiempo activo={1} t0={0.3} />
    </Escena>
  );
};
