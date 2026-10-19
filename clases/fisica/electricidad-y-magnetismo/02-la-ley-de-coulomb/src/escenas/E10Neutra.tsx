import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { azar, brillo, chispa } from "../lab/luz";
import { Cien, M_E, M_P } from "../fisica";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 10;
const T_NEUTRA = w(E, "neutra");
const T_CANCELAN = w(E, "cancelan");
const T_MASA = w(E, "masa");
const T_SUMA = w(E, "suma");
export const sfx10: Sfx[] = [
  [E, T_NEUTRA, "tic"],
  [E, T_CANCELAN, "check"],
  [E, T_SUMA, "golpe"],
];

// Se agregan protones y electrones de a uno, alternados: la carga neta vuelve a cero en cada par.
const N_MAX = 520;
const C = { x: 540, y: 700 };
const RADIO = 270;
const cuantas = (t: number) => Math.floor(N_MAX * eIO(pr(t, 0.6, T_SUMA + 0.4 - 0.6)));
const protones = (n: number) => Math.ceil(n / 2);
const electrones = (n: number) => Math.floor(n / 2);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const n = cuantas(t);
  // La masa siempre suma: un halo blanco que crece en el centro.
  brillo(ctx, C.x, C.y, 60 + 260 * Math.sqrt(n / N_MAX), RGB.blanco, 0.1 + 0.18 * (n / N_MAX));
  for (let i = 0; i < n; i++) {
    const r = RADIO * Math.sqrt(azar(i * 1.91 + 0.3));
    const a = 2 * Math.PI * azar(i * 3.17 + 7);
    const x = C.x + r * Math.cos(a) + 3 * Math.sin(t * 1.4 + i);
    const y = C.y + r * Math.sin(a) + 3 * Math.cos(t * 1.1 + i * 0.7);
    chispa(ctx, x, y, i % 2 ? 1.6 : 2.4, i % 2 ? RGB.neg : RGB.pos, 0.85);
  }
  const k = eOut(pr(t, 0.1, 0.6));
  void k;
};

export const Neutra: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const n = cuantas(t);
  const neta = protones(n) - electrones(n);
  const m = protones(n) * M_P + electrones(n) * M_E;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="La carga se cancela; *la masa siempre suma*" />
      <Hud
        t0={T_NEUTRA}
        items={[
          { l: "Partículas", v: String(n), t: 0.8 },
          { l: "Carga neta", v: String(neta), u: "e", t: T_NEUTRA },
          { l: "Masa total", v: m > 0 ? <Cien v={m} d={2} /> : "0", u: "kg", azul: true, t: T_MASA },
        ]}
      />
    </Escena>
  );
};
