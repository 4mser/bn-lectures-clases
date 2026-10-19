import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { brillo, linea, rotulo, type Pt } from "../lab/luz";
import { esfera, hito, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 2;
const T_1729 = w(E, "veintinueve");
const T_LLEVO = w(E, "llevó");
const T_UNOS = w(E, "unos");
const T_COND = w(E, "conductores");
const T_AISL = w(E, "aislantes");
export const sfx02: Sfx[] = [
  [E, T_1729, "tic"],
  [E, T_COND, "check"],
  [E, T_AISL, "tic"],
];

const X0 = 170;
const X1 = 940;
const HILOS = [
  { y: 620, nombre: "Hilo húmedo · conductor", conduce: true },
  { y: 880, nombre: "Hilo aislante", conduce: false },
];
const N = 14;
const SAG = 46;

const punto = (y: number, u: number): Pt => [lerp(X0, X1, u), y + SAG * 4 * u * (1 - u)];

// Dónde está la carga j del hilo (fracción del largo) en el instante t.
const posicion = (conduce: boolean, j: number, t: number) => {
  const t0 = T_LLEVO + j * 0.2;
  if (conduce) return lerp(0, 1 - j * 0.022, eIO(pr(t, t0, 1.6)));
  return lerp(0, 0.02 + j * 0.009, eIO(pr(t, t0, 1.2)));
};
// Cuántas cargas pasaron de la mitad del hilo (más allá del 60 %).
const llegan = (conduce: boolean, t: number) => Array.from({ length: N }, (_, j) => posicion(conduce, j, t)).filter((s) => s > 0.6).length;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  HILOS.forEach((h, i) => {
    const k = eOut(pr(t, 0.3 + i * 0.2, 0.9));
    const pts = Array.from({ length: 60 }, (_, s) => punto(h.y, s / 59));
    linea(ctx, pts.slice(0, Math.max(2, Math.round(60 * k))), h.conduce ? RGB.hielo : "200,190,170", 0.75 * k, 2);
    // Fuente cargada a la izquierda y esfera receptora a la derecha.
    esfera(ctx, X0 - 40, h.y, 34, RGB.pos, k);
    signo(ctx, X0 - 40, h.y, 9, true, k);
    const lleg = llegan(h.conduce, t);
    esfera(ctx, X1 + 30, h.y, 24, h.conduce ? RGB.pos : RGB.blanco, k * (h.conduce ? lerp(0.35, 1, lleg / N) : 0.35));
    if (h.conduce) brillo(ctx, X1 + 30, h.y, 90, RGB.pos, 0.3 * (lleg / N) * k);
    for (let j = 0; j < N; j++) {
      const s = posicion(h.conduce, j, t);
      const ka = eOut(pr(t, T_LLEVO + j * 0.2 - 0.1, 0.3));
      const [x, y] = punto(h.y, s);
      signo(ctx, x, y - 1, 7, true, ka);
    }
    rotulo(ctx, h.nombre, (X0 + X1) / 2, h.y - 46, { a: eOut(pr(t, h.conduce ? T_COND - 0.3 : T_AISL - 0.3, 0.6)), align: "center", size: 15 });
  });
  hito(ctx, "1729", "Stephen Gray", 90, 470, eOut(pr(t, T_1729, 0.7)), "left");
  rotulo(ctx, "Cientos de metros", 990, 470, { a: eOut(pr(t, T_LLEVO + 1, 0.6)), align: "right", size: 15 });
};

export const Gray: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="La electrización *viaja por algunos materiales*" />
      <Hud
        t0={T_UNOS}
        items={[
          { l: "Llegan · conductor", v: String(llegan(true, t)), u: "de " + N, azul: true, t: T_UNOS },
          { l: "Llegan · aislante", v: String(llegan(false, t)), u: "de " + N, t: T_UNOS + 0.3 },
        ]}
      />
    </Escena>
  );
};
