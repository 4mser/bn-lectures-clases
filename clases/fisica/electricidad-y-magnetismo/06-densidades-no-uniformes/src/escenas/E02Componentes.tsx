import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { barraLuz, chispa, flecha, puntoP, rotulo } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 2;
const T_SUMAN = w(E, "suman");
const T_COMP = w(E, "componentes");
const T_LARGOS = w(E, "largos");
const T_REAL = w(E, "real");
export const sfx02: Sfx[] = [
  [E, T_SUMAN, "tic"],
  [E, T_COMP + 0.5, "tic"],
  [E, T_LARGOS, "alerta"],
  [E, T_REAL, "check"],
];

// Barra uniforme con P sobre su mediatriz a altura h, vista con semiángulo de 60°. Unidades: kλ/h.
const YB = 930;
const H = 220;
const P = { x: 540, y: YB - H };
const MEDIO = H * Math.tan(Math.PI / 3);
// Suma de vectores y suma de módulos de los aportes, con muchos trozos (regla del punto medio).
const sumas = (n: number) => {
  let ex = 0;
  let ey = 0;
  let mod = 0;
  const vec: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = (-MEDIO + ((i + 0.5) * 2 * MEDIO) / n) / H;
    const dx = (2 * MEDIO) / n / H;
    const r = Math.hypot(x, 1);
    const m = dx / (r * r);
    const v: [number, number] = [(-x / r) * m, (-1 / r) * m]; // en pantalla: hacia arriba, alejándose del trozo
    vec.push(v);
    ex += v[0];
    ey += v[1];
    mod += m;
  }
  return { modSuma: Math.hypot(ex, ey), sumaMod: mod, vec };
};
const FINO = sumas(4000);
const DIBUJO = sumas(14);
const ESC = 290 / FINO.modSuma; // px por kλ/h

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  barraLuz(ctx, P.x - MEDIO, YB, P.x + MEDIO, YB, RGB.pos, k, t, 4);
  const ka = eOut(pr(t, T_SUMAN - 0.2, 0.6));
  const kc = eIO(pr(t, T_COMP + 0.4, 1.0)); // en cadena, punta con cola
  const ks = eIO(pr(t, T_LARGOS, 1.1)); // enderezada: suma de largos
  const n = DIBUJO.vec.length;
  let cx = 0;
  let cy = 0;
  DIBUJO.vec.forEach(([vx, vy], i) => {
    const xi = P.x - MEDIO + ((i + 0.5) * 2 * MEDIO) / n;
    chispa(ctx, xi, YB, 3, RGB.pos, ka);
    const m = Math.hypot(vx, vy);
    const ang = lerp(Math.atan2(vy, vx), -Math.PI / 2, ks);
    const dx = Math.cos(ang) * m * ESC;
    const dy = Math.sin(ang) * m * ESC;
    const x0 = P.x + lerp(0, cx, kc) + 80 * ks;
    const y0 = P.y + lerp(0, cy, kc);
    flecha(ctx, x0, y0, x0 + dx, y0 + dy, ks > 0.5 ? RGB.neg : RGB.hielo, ka * 0.75, 1.8, 10);
    cx += dx;
    cy += dy;
  });
  // La resultante verdadera: de la cola de la cadena a su punta.
  const kr = eOut(pr(t, T_COMP + 1.3, 0.6));
  flecha(ctx, P.x, P.y, P.x, P.y - FINO.modSuma * ESC * kr, RGB.azul, kr, 5, 24);
  rotulo(ctx, "suma de vectores", P.x - 26, P.y - FINO.modSuma * ESC - 6, { a: kr, size: 14, align: "right", rgb: RGB.azul });
  rotulo(ctx, "suma de largos", P.x + 106, P.y - FINO.sumaMod * ESC - 12, { a: eOut(pr(t, T_LARGOS + 0.9, 0.5)), size: 14, rgb: RGB.neg });
  puntoP(ctx, P.x, P.y, k, "P", -40, 14);
};

export const Componentes: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const u = <Tex tex="k\lambda/y" size={26} color={C.texto2} />;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Se suman *componentes*, no módulos" />
      <Hud
        t0={T_COMP + 1.3}
        items={[
          { l: "Módulo de la suma", v: num(FINO.modSuma, 2), u: <Tex tex="k\lambda/y" size={26} color={C.azul} />, azul: true },
          { l: "Suma de los módulos", v: num(FINO.sumaMod, 2), u, t: T_LARGOS + 0.9 },
        ]}
      />
    </Escena>
  );
};
