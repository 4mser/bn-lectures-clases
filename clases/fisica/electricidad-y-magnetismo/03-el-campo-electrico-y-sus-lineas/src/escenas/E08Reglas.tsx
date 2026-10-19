import React from "react";
import { Cabeza, Escena, Hud, Sim, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { carga, linea, particulas, rotulo, variable, type Fuente, type Pt } from "../lab/luz";
import { lineas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 8;
const T_NACEN = w(E, "nacen");
const T_MUEREN = w(E, "mueren");
const T_CRUZAN = w(E, "cruzan");
const T_DOBLE = w(E, "doble");
const T_MITAD = w(E, "mitad");
const T_INFINITO = w(E, "infinito");
export const sfx08: Sfx[] = [
  [E, T_NACEN, "tic"],
  [E, T_MUEREN, "tic"],
  [E, T_MITAD, "check"],
  [E, T_INFINITO, "campana"],
];

// +2q y −q: 12 líneas por unidad de carga. Se trazan en una caja enorme para saber cuáles vuelven a −q
// y cuáles se van al infinito; en pantalla se dibuja solo el tramo visible.
const Y = 700;
const FUENTES: Fuente[] = [
  { x: 400, y: Y, q: 2 },
  { x: 690, y: Y, q: -1 },
];
const TODAS = lineas(FUENTES, 12, [-30000, -30000, 30000, 30000], { pasos: 12000, h: 6, r0: 12 });
const DE_POS = TODAS.filter((l) => l.desde === 0);
const A_NEG = DE_POS.filter((l) => l.hasta === 1).length;
const AL_INF = DE_POS.filter((l) => l.hasta === -1).length;
const VISTA: [number, number, number, number] = [-150, 100, 1230, 1300];
const fuera = (p: Pt) => p[0] < VISTA[0] || p[0] > VISTA[2] || p[1] < VISTA[1] || p[1] > VISTA[3];
const DIBUJO = DE_POS.map((l) => {
  const i = l.pts.findIndex(fuera);
  return { pts: l.hasta === 1 || i < 0 ? l.pts.filter((p) => !fuera(p)) : l.pts.slice(0, i + 1), aNeg: l.hasta === 1 };
});

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kl = eOut(pr(t, T_NACEN - 0.2, 2));
  const km = eOut(pr(t, T_MITAD - 0.2, 0.7));
  const ki = eOut(pr(t, T_INFINITO - 0.3, 0.7));
  DIBUJO.forEach((l, i) => {
    const corte = l.pts.slice(0, Math.max(2, Math.round(l.pts.length * kl)));
    const rgb = l.aNeg ? (km > 0.5 ? RGB.azul : RGB.hielo) : RGB.hielo;
    const a = l.aNeg ? 0.22 + 0.45 * km : 0.14 + 0.14 * ki;
    linea(ctx, corte, rgb, a * kl, l.aNeg ? 1 + km : 1 + ki * 0.6);
    particulas(ctx, corte, t, 80, 3, rgb, 0.65 * kl, i + 13, 1.4);
  });
  const k = eOut(pr(t, 0.15, 0.7));
  carga(ctx, FUENTES[0].x, Y, 15, RGB.pos, k, t);
  carga(ctx, FUENTES[1].x, Y, 11, RGB.neg, k, t);
  variable(ctx, "+2q", "", FUENTES[0].x - 60, Y - 54, 32, RGB.blanco, k, "right");
  variable(ctx, "−q", "", FUENTES[1].x + 50, Y - 54, 32, RGB.blanco, k, "left");
  rotulo(ctx, "nacen", FUENTES[0].x, Y + 150, { a: eOut(pr(t, T_NACEN, 0.6)), align: "center", size: 14 });
  rotulo(ctx, "mueren", FUENTES[1].x, Y + 150, { a: eOut(pr(t, T_MUEREN, 0.6)), align: "center", size: 14, rgb: RGB.neg });
  rotulo(ctx, "nunca se cruzan", 540, Y + 330, { a: eOut(pr(t, T_CRUZAN - 0.2, 0.6)), align: "center", size: 14 });
};

export const Reglas: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Nacen en las positivas, *mueren en las negativas*" />
      <Hud
        t0={T_DOBLE}
        items={[
          { l: <>Salen de +2<Sim>q</Sim></>, v: String(DE_POS.length), t: T_DOBLE - 0.2 },
          { l: <>Terminan en −<Sim>q</Sim></>, v: String(A_NEG), azul: true, t: T_MITAD },
          { l: "Al infinito", v: String(AL_INF), t: T_INFINITO - 0.2 },
        ]}
      />
    </Escena>
  );
};
