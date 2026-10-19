import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { angulo, brillo, chispa, flecha, linea, puntoP, rgba, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";

const E = 6;
const T_CENTRO = w(E, "centro");
const T_SIM = w(E, "simetricos");
const T_VERT = w(E, "verticales");
const T_QUEDA = w(E, "queda");
const T_CIERRA = w(E, "cierra");
const T_CERO = w(E, "cero", 1);
export const sfx06: Sfx[] = [
  [E, T_SIM, "tic"],
  [E, T_VERT, "tic"],
  [E, T_QUEDA, "check"],
  [E, T_CERO, "golpe"],
];

const P = { x: 600, y: 640 };
const R = 250;
const TH0 = Math.PI / 3;
const UNIDAD = 120; // px por kλ/r en la flecha resultante
const APORTE = 150; // largo de la flecha de cada trocito

// Semiángulo del arco: se dibuja hasta 60° y con «cierra» crece hasta cerrar el anillo.
const theta = (t: number) => (t < T_CIERRA ? TH0 * eOut(pr(t, 0.2, 1.1)) : tramo(t, T_CIERRA, 1.7, TH0, Math.PI));
const campo = (t: number) => 2 * Math.sin(theta(t));

const arcoLuz = (ctx: CanvasRenderingContext2D, th: number, t: number) => {
  if (th <= 0.01) return;
  const a0 = Math.PI - th;
  const a1 = Math.PI + th;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const [ancho, alfa] of [[22, 0.1], [7, 0.3]] as const) {
    ctx.strokeStyle = rgba(RGB.pos, alfa);
    ctx.lineWidth = ancho;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(P.x, P.y, R, a0, a1);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = rgba("225,235,255", 0.9);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(P.x, P.y, R, a0, a1);
  ctx.stroke();
  const n = Math.round((th / Math.PI) * 30);
  for (let k = 0; k <= n; k++) {
    const a = lerp(a0, a1, n ? k / n : 0.5);
    chispa(ctx, P.x + R * Math.cos(a), P.y + R * Math.sin(a), 1.7, RGB.pos, 0.6 + 0.4 * Math.sin(t * 3 + k));
  }
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const th = theta(t);
  arcoLuz(ctx, th, t);
  puntoP(ctx, P.x, P.y, eOut(pr(t, 0.6, 0.6)), "P", 18, 26);

  // Todos los trocitos a la misma distancia r de P.
  const kr = eOut(pr(t, T_CENTRO - 0.3, 0.6)) * (1 - eIO(pr(t, T_SIM, 0.4)));
  linea(ctx, [[P.x, P.y], [P.x - R, P.y]], RGB.blanco, 0.5 * kr, 1.2, [4, 6]);
  variable(ctx, "r", "", P.x - R / 2, P.y - 22, 30, RGB.blanco, kr, "center");

  // Semiángulo θ₀ entre el eje y el extremo de arriba del arco.
  const ka = eOut(pr(t, 1.0, 0.6));
  linea(ctx, [[P.x, P.y], [P.x - R * 1.12, P.y]], RGB.blanco, 0.2 * ka, 1, [3, 7]);
  linea(ctx, [[P.x, P.y], [P.x + R * Math.cos(Math.PI + th), P.y + R * Math.sin(Math.PI + th)]], RGB.blanco, 0.28 * ka, 1, [3, 7]);
  angulo(ctx, P.x, P.y, 62, Math.PI, Math.PI + th, RGB.blanco, 0.6 * ka);
  variable(ctx, "θ", "0", P.x + 84 * Math.cos(Math.PI + th / 2), P.y + 84 * Math.sin(Math.PI + th / 2), 28, RGB.blanco, ka, "center");

  // Par simétrico: sus aportes en P, y cómo se cancelan las verticales.
  const kp = eOut(pr(t, T_SIM, 0.6)) * (1 - eIO(pr(t, T_CIERRA - 0.6, 0.5)));
  const kv = eOut(pr(t, T_VERT, 0.6));
  const kx = eIO(pr(t, T_VERT + 0.9, 0.7));
  const fi = 0.62 * th;
  for (const s of [-1, 1]) {
    const x = P.x - R * Math.cos(fi);
    const y = P.y - s * R * Math.sin(fi);
    brillo(ctx, x, y, 40, RGB.blanco, 0.45 * kp);
    chispa(ctx, x, y, 4, RGB.pos, kp);
    variable(ctx, "dq", "", x - 34, y - s * 26, 26, RGB.blanco, kp, "center");
    const dx = Math.cos(fi) * APORTE;
    const dy = s * Math.sin(fi) * APORTE;
    flecha(ctx, P.x, P.y, P.x + dx, P.y + dy, RGB.hielo, kp * (1 - 0.6 * kv), 2, 13);
    // Componente vertical (punteada) que se apaga: se cancela con la del otro trocito.
    flecha(ctx, P.x + dx, P.y, P.x + dx, P.y + dy, RGB.neg, kp * kv * (1 - kx), 2, 12, [5, 5]);
    flecha(ctx, P.x, P.y + 3 * s, P.x + dx, P.y + 3 * s, RGB.hielo, kp * kv, 2.2, 13);
  }
  const kq = eOut(pr(t, T_QUEDA, 0.7));
  flecha(ctx, P.x, P.y, P.x + campo(t) * UNIDAD * kq, P.y, RGB.azul, kq, 5, 24);
};

export const Arco: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const unidad = <Tex tex="k\lambda/r" size={28} color="#5B86FF" />;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Arco: *la simetría cancela*" />
      <Formula tex="E=\frac{2k\lambda\,\sin\theta_0}{r}" t0={T_QUEDA + 0.2} top={920} size={54} />
      <Hud
        t0={T_QUEDA}
        items={[
          { l: "Semiángulo", v: `${num((theta(t) * 180) / Math.PI, 0)}°` },
          { l: "Campo en P", v: num(Math.abs(campo(t)), 2), u: unidad, azul: true },
        ]}
      />
    </Escena>
  );
};
