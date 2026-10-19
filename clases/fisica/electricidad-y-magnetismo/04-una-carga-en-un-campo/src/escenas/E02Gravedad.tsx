import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { brillo, flecha, linea, rotulo, rgba, variable } from "../lab/luz";
import { G } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 2;
const T_MG = w(E, "ge");
const T_CANCELA = w(E, "cancela");
const T_TODOS = w(E, "todos");
const T_NUEVE = w(E, "nueve");
export const sfx02: Sfx[] = [
  [E, T_CANCELA, "tic"],
  [E, T_TODOS + 1.6, "golpe"],
  [E, T_NUEVE, "check"],
];

// Tres cuerpos de masas 1, 2 y 4 (en unidades de la más chica) que se sueltan juntos.
const MASAS = [1, 2, 4];
const X = [280, 540, 800];
const Y0 = 480;
const SUELO = 940;
const T_CAIDA = 1.6; // segundos de animación hasta el suelo
const radio = (m: number) => 16 * Math.cbrt(m);
// Aceleración de cada cuerpo: (m g) / m. Es la misma para los tres.
const acel = (m: number) => (m * G) / m;
const APX = (2 * (SUELO - Y0 - radio(4))) / (T_CAIDA * T_CAIDA); // px/s² que representan g
const yEn = (m: number, s: number) => Math.min(SUELO - radio(m), Y0 + 0.5 * APX * (acel(m) / G) * s * s);

const cuerpo = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) => {
  brillo(ctx, x, y, r * 3, RGB.blanco, 0.18 * a);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, rgba("250,252,255", a));
  g.addColorStop(1, rgba("120,130,150", a));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.8));
  linea(ctx, [[110, SUELO], [970, SUELO]], RGB.blanco, 0.3 * ka, 1.2);
  rotulo(ctx, "suelo", 110, SUELO + 26, { a: ka * 0.8, size: 13 });
  flecha(ctx, 1010, 520, 1010, 640, RGB.hielo, 0.7 * ka, 2, 12);
  variable(ctx, "g", "", 1012, 494, 30, RGB.hielo, 0.85 * ka, "center");
  const s = Math.max(0, t - T_TODOS);
  const km = eOut(pr(t, T_MG - 0.3, 0.6)) * (1 - eOut(pr(t, T_TODOS - 0.2, 0.4)));
  const kac = eOut(pr(t, T_CANCELA, 0.6));
  MASAS.forEach((m, i) => {
    const r = radio(m);
    // Estela: posiciones cada 0,2 s de caída.
    for (let k = 1; k * 0.2 < Math.min(s, T_CAIDA); k++) {
      ctx.fillStyle = rgba(RGB.hielo, 0.25);
      ctx.beginPath();
      ctx.arc(X[i], yEn(m, k * 0.2), 3, 0, Math.PI * 2);
      ctx.fill();
    }
    const y = yEn(m, s);
    cuerpo(ctx, X[i], y, r, ka);
    rotulo(ctx, `masa ${m}`, X[i], Y0 - r - 30, { a: ka, align: "center", size: 14 });
    // Peso m g: proporcional a la masa.
    flecha(ctx, X[i] - r - 18, y, X[i] - r - 18, y + 40 * m * km, RGB.blanco, km, 2.5, 14);
    // Aceleración: la misma flecha para los tres.
    const enAire = s < T_CAIDA ? 1 : 1 - eOut(pr(s, T_CAIDA, 0.3));
    flecha(ctx, X[i] + r + 18, y, X[i] + r + 18, y + 90 * (acel(m) / G) * kac, RGB.azul, kac * enAire, 3.5, 18);
  });
  rotulo(ctx, "peso", X[0] - 60, Y0 + 130, { a: km, size: 13, align: "center" });
  rotulo(ctx, "aceleración", X[2] + 80, Y0 + 130, { a: kac * (s < 0.2 ? 1 : 0), size: 13, align: "center" });
};

export const Gravedad: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Con gravedad, *todos caen igual*" />
      <Formula tex="m\vec a=m\vec g\;\Rightarrow\;\vec a=\vec g" t0={T_CANCELA} top={975} size={46} />
      <Hud
        t0={T_CANCELA}
        items={[
          { l: "Masas", v: MASAS.join(" : ") },
          { l: "Aceleración de cada uno", v: MASAS.map((m) => num(acel(m), 1)).filter((v, i, a) => a.indexOf(v) === i).join(" · "), u: "m/s²", azul: true, t: T_NUEVE },
        ]}
      />
    </Escena>
  );
};
