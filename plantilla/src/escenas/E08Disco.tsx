import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { flecha, linea, puntoP, variable } from "../lab/luz";
import { anilloLuz, circulo, mallaDisco, proyectar, type Camara } from "../lab/proyeccion";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";

const E = 8;
const T_PILA = w(E, "pila");
const T_SUMANDO = w(E, "sumando");
const T_BORDE = w(E, "borde");
const T_SIGMA = w(E, "sigma");
export const sfx08: Sfx[] = [
  [E, T_PILA, "tic"],
  [E, T_BORDE + 0.6, "check"],
];

const CAM: Camara = { cx: 540, cy: 860, psi: 0, el: 0.32 };
const R = 260;
const Z = 0.8; // P sobre el eje, a 0,8 R
const ANILLOS = 10;
const LARGO = 420; // px por σ/2ε₀
// Campo en P del disco sumado hasta el radio a (en unidades de R), en unidades σ/2ε₀.
const campo = (a: number) => 1 - Z / Math.sqrt(Z * Z + a * a);
// Radio sumado: de 0 a R entre «sumando» y un poco después de «borde».
const radio = (t: number) => tramo(t, T_SUMANDO, T_BORDE + 0.6 - T_SUMANDO, 0, 1);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const a = radio(t);
  const kp = eOut(pr(t, T_PILA - 0.3, 0.8));
  // La pila de anillos: contornos tenues de todo el disco, que se llenan a medida que se suman.
  for (let i = 1; i <= ANILLOS; i++) {
    const ki = eOut(pr(t, T_PILA - 0.3 + i * 0.07, 0.5));
    circulo(ctx, CAM, (R * i) / ANILLOS, 0, RGB.malla, 0.35 * ki, 1);
  }
  mallaDisco(ctx, CAM, a * R, t, Math.min(1, a * 4), Math.max(1, Math.round(a * ANILLOS)), 24);
  if (a > 0.01 && a < 0.999) anilloLuz(ctx, CAM, a * R, t, 0.8);
  else if (a >= 0.999) circulo(ctx, CAM, R, 0, RGB.pos, 0.8 * kp, 2.2);
  const c = proyectar(CAM, 0, 0, 0);
  const p = proyectar(CAM, 0, 0, Z * R);
  const tope = proyectar(CAM, 0, 0, 2.1 * R);
  linea(ctx, [[c.sx, c.sy], [tope.sx, tope.sy]], RGB.blanco, 0.25 * kp, 1, [4, 7]);
  const kf = eOut(pr(t, T_SUMANDO, 0.4));
  flecha(ctx, p.sx, p.sy, p.sx, p.sy - campo(a) * LARGO * kf, RGB.azul, kf, 5, 24);
  puntoP(ctx, p.sx, p.sy, eOut(pr(t, 0.5, 0.6)), "P", 20, 8);
  const kz = eOut(pr(t, 1.0, 0.6));
  variable(ctx, "z", "", c.sx - 24, (c.sy + p.sy) / 2, 28, RGB.blanco, kz, "center");
  variable(ctx, "R", "", c.sx + R * 0.6, c.sy + 34, 28, RGB.blanco, kp, "center");
};

export const Disco: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const a = radio(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Disco: *una pila de anillos*" />
      <Formula tex="E=\frac{\sigma}{2\varepsilon_0}\left(1-\frac{z}{\sqrt{z^{2}+R^{2}}}\right)" t0={T_SIGMA} top={940} size={44} />
      <Hud
        t0={T_SUMANDO}
        items={[
          { l: "Radio sumado", v: num(a, 2), u: "R" },
          { l: "Campo en P", v: num(campo(a), 3), u: <Tex tex="\sigma/2\varepsilon_0" size={26} color="#5B86FF" />, azul: true },
        ]}
      />
    </Escena>
  );
};
