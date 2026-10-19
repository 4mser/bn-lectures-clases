import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { TAU, brillo, chispa, flecha, rgba, rotulo } from "../lab/luz";
import { hito, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 5;
const T_1767 = w(E, "siete");
const T_DENTRO = w(E, "dentro");
const T_FUERZA = w(E, "fuerza");
const T_NEWTON = w(E, "newton");
const T_LEY = w(E, "ley");
export const sfx05: Sfx[] = [
  [E, T_1767, "tic"],
  [E, T_FUERZA, "golpe"],
  [E, T_LEY, "check"],
];

const C0 = { x: 540, y: 665 };
const R = 195;
// Carga repartida en la superficie de una esfera hueca: puntos de Fibonacci (en 3D, unidades = px).
const NP = 1600;
const CASCARA = Array.from({ length: NP }, (_, i) => {
  const z = 1 - (2 * (i + 0.5)) / NP;
  const r = Math.sqrt(1 - z * z);
  const u = i * Math.PI * (3 - Math.sqrt(5));
  return [R * r * Math.cos(u), R * r * Math.sin(u), R * z] as const;
});

// Fuerza sobre una carga de prueba en (x, y, 0) relativa al centro: suma de los aportes 1/r² de cada punto.
const fuerza = (x: number, y: number): [number, number] => {
  let fx = 0;
  let fy = 0;
  for (const [px, py, pz] of CASCARA) {
    const dx = x - px;
    const dy = y - py;
    const dz = -pz;
    const d2 = dx * dx + dy * dy + dz * dz;
    const k = 1 / (d2 * Math.sqrt(d2));
    fx += k * dx;
    fy += k * dy;
  }
  return [fx / NP, fy / NP];
};
// Referencia: la fuerza afuera, a 1,6 R del centro.
const AFUERA = { x: 1.6 * R, y: 0 };
const F_REF = Math.hypot(...fuerza(AFUERA.x, AFUERA.y));

// Trayectoria de la carga de prueba (relativa al centro): afuera hasta «dentro»; ahí se apaga y reaparece adentro
// (sin cruzar la cáscara, donde las cargas puntuales del dibujo darían picos que una cáscara continua no tiene).
const T_CAMBIO = T_DENTRO + 0.15;
const prueba = (t: number): [number, number] => {
  if (t < T_CAMBIO) return [AFUERA.x, AFUERA.y];
  const s = t - T_CAMBIO;
  return [-30 + 85 * Math.sin(s * 0.9), -20 + 65 * Math.sin(s * 1.3 + 0.4)];
};
// Visibilidad: se apaga antes del cambio y vuelve a encenderse después.
const visible = (t: number) => eOut(pr(t, 0.9, 0.6)) * (t < T_CAMBIO ? 1 - eIO(pr(t, T_CAMBIO - 0.3, 0.3)) : eOut(pr(t, T_CAMBIO, 0.4)));
const relativa = (t: number) => {
  const [x, y] = prueba(t);
  return Math.hypot(...fuerza(x, y)) / F_REF;
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 1));
  const giro = t * 0.25;
  // Contorno de la esfera y su brillo.
  brillo(ctx, C0.x, C0.y, R * 1.6, RGB.pos, 0.1 * k);
  ctx.save();
  ctx.strokeStyle = rgba(RGB.pos, 0.55 * k);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(C0.x, C0.y, R, 0, TAU);
  ctx.stroke();
  ctx.restore();
  // Algunas cargas de la cáscara (una de cada 8), girando: las de atrás más tenues.
  for (let i = 0; i < NP; i += 8) {
    const [px, py, pz] = CASCARA[i];
    const x = px * Math.cos(giro) + pz * Math.sin(giro);
    const z = -px * Math.sin(giro) + pz * Math.cos(giro);
    chispa(ctx, C0.x + x, C0.y + py, 1.5, RGB.pos, k * (z > 0 ? 0.9 : 0.3));
  }
  for (let j = 0; j < 10; j++) {
    const u = (j / 10) * TAU + giro;
    signo(ctx, C0.x + Math.cos(u) * R, C0.y + Math.sin(u) * R, 8, true, k);
  }
  // Carga de prueba y su fuerza (flecha a escala: 130 px = fuerza afuera).
  const kp = visible(t);
  const [x, y] = prueba(t);
  const [fx, fy] = fuerza(x, y);
  const esc = 130 / F_REF;
  flecha(ctx, C0.x + x, C0.y + y, C0.x + x + fx * esc * kp, C0.y + y + fy * esc * kp, RGB.azul, kp, 3.5, 18);
  signo(ctx, C0.x + x, C0.y + y, 10, true, kp);
  ctx.save();
  ctx.strokeStyle = rgba(RGB.blanco, 0.8 * kp);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(C0.x + x, C0.y + y, 18, 0, TAU);
  ctx.stroke();
  ctx.restore();
  rotulo(ctx, "Carga de prueba", C0.x + x, C0.y + y + 40, { a: kp, align: "center", size: 13 });
  rotulo(ctx, "Adentro: sin fuerza", C0.x, C0.y + R + 38, { a: eOut(pr(t, T_FUERZA, 0.6)), align: "center", size: 15, rgb: RGB.hielo });
  hito(ctx, "1767", "Joseph Priestley", 90, 455, eOut(pr(t, T_1767, 0.7)), "left");
};

export const Priestley: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Sin fuerza adentro: *la ley va como 1/r²*" />
      <Formula tex="F\;\propto\;\frac{1}{r^{2}}" t0={T_LEY} top={912} size={42} />
      <Hud
        t0={1}
        items={[
          { l: "Fuerza sobre la prueba", v: num(relativa(t)), u: "× la de afuera", azul: true },
          { l: "Igual que en", v: "la gravedad", t: T_NEWTON },
        ]}
      />
    </Escena>
  );
};
