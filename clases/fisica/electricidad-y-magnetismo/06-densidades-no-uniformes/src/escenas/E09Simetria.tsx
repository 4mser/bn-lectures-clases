import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { trazoDensidad } from "../lab/densidad";
import { brillo, chispa, flecha } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, numMiles, pr } from "../theme";
import type { Sfx } from "../sfx";
import { campo2En } from "../fisica";
import { CX, CY, camino, dens, ejes, enArco } from "./semi";

const E = 9;
const T_TROZOS = w(E, "trozos");
const T_CARGA = w(E, "carga");
const T_CANCELAN = w(E, "cancelan");
const T_PAR2 = w(E, "par", 1);
export const sfx09: Sfx[] = [
  [E, T_TROZOS, "tic"],
  [E, T_CARGA, "tic"],
  [E, T_CANCELAN, "check"],
];

// Tres pares de elementos en ±θ: misma carga (cos θ es par) y misma distancia R a P.
const PARES = [20, 45, 70].map((g) => (g * Math.PI) / 180);
const LARGO = 200; // px del aporte de un elemento con cos θ = 1
// Componentes del campo en P sumando todo el semicírculo y solo la mitad derecha (θ > 0).
const [EX, EY] = campo2En(0, 0);
const [EXD] = campo2En(0, 0, 0, Math.PI / 2);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.6));
  ejes(ctx, k);
  const kp = eOut(pr(t, T_TROZOS - 0.2, 0.6));
  trazoDensidad(ctx, camino, dens, k * (1 - 0.5 * kp), t, { grosor: 9, n: 120, chispas: 90 });
  const kc = eOut(pr(t, T_CARGA, 0.5));
  const kv = eOut(pr(t, T_CANCELAN - 0.6, 0.5));
  const kx = eIO(pr(t, T_CANCELAN + 0.2, 0.8));
  PARES.forEach((th, i) => {
    const ka = eOut(pr(t, T_TROZOS + i * 0.15, 0.5));
    const m = Math.cos(th) * LARGO;
    for (const s of [-1, 1]) {
      const [x, y] = enArco(s * th);
      chispa(ctx, x, y, 2.5 + 4 * Math.cos(th), RGB.pos, ka);
      brillo(ctx, x, y, 30 + 30 * Math.cos(th), RGB.blanco, 0.3 * ka * kc);
      // Aporte en P: se aleja del elemento, r̂ = −(sin θ, cos θ).
      const dx = -s * Math.sin(th) * m;
      const dy = Math.cos(th) * m;
      flecha(ctx, CX, CY, CX + dx, CY + dy, RGB.hielo, ka * (1 - 0.6 * kv), 1.8, 11);
      flecha(ctx, CX, CY + dy, CX + dx, CY + dy, RGB.neg, ka * kv * (1 - kx), 1.8, 10, [5, 5]);
    }
  });
};

export const Simetria: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const cero = (v: number) => (Math.abs(v) < 0.05 ? 0 : v);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Densidad par: *la simetría sigue cancelando*" />
      <Formula tex="E_x\propto\int_{-\pi/2}^{\pi/2}\sin\theta\cos\theta\,d\theta=0" t0={T_CANCELAN} top={985} size={46} />
      <Hud
        t0={T_CANCELAN}
        top={1150}
        items={[
          { l: "Horizontal, mitad derecha", v: numMiles(EXD), u: "N/C" },
          { l: "Horizontal, total", v: numMiles(cero(EX)), u: "N/C", azul: true, t: T_PAR2 - 0.6 },
        ]}
      />
    </Escena>
  );
};
// EY se usa en la escena siguiente; aquí solo se comprueba que el total horizontal es despreciable frente a él.
if (Math.abs(EX) > 1e-9 * Math.abs(EY)) throw new Error("Ex no se anula");
