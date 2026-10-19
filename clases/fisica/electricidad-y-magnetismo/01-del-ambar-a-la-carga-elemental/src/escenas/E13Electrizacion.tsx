import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { TAU, brillo, linea, rotulo, type Pt } from "../lab/luz";
import { esfera, signo, tierra } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 13;
const T_NEUTRO = w(E, "neutro");
const T_CONTACTO = w(E, "contacto");
const T_MISMO = w(E, "mismo");
const T_INDUCCION = w(E, "inducción");
const T_TIERRA = w(E, "tierra");
const T_RETIRA = w(E, "retira");
const T_OPUESTO = w(E, "opuesto");
export const sfx13: Sfx[] = [
  [E, T_CONTACTO + 0.3, "tic"],
  [E, T_MISMO, "check"],
  [E, T_TIERRA, "tic"],
  [E, T_RETIRA, "tic"],
  [E, T_OPUESTO, "check"],
];

const RA = 66; // radio de A (cargado, +)
const RB = 78; // radio de B (neutro al comienzo)
const NA = 8; // cargas + de A
const NB = 6; // pares + y − de B
const Y1 = 540; // fila del contacto
const Y2 = 845; // fila de la inducción
const XB = 720;

const anillo = (cx: number, cy: number, n: number, r: number, fase = 0): Pt[] =>
  Array.from({ length: n }, (_, j) => [cx + Math.cos((j / n) * TAU + fase) * r, cy + Math.sin((j / n) * TAU + fase) * r]);
const mezcla = (a: Pt, b: Pt, k: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ── Contacto: A toca a B y le pasan PASAN electrones de B a A. ──
const PASAN = 4;
const xA1 = (t: number) => lerp(300, XB - RB - RA + 2, eIO(pr(t, T_CONTACTO - 0.5, 0.6))) - 160 * eIO(pr(t, T_MISMO - 0.3, 0.7));
const viajeContacto = (j: number, t: number) => eIO(pr(t, T_CONTACTO + 0.2 + j * 0.15, 0.4));
const netoContactoB = (t: number) => {
  const salen = Array.from({ length: PASAN }, (_, j) => viajeContacto(j, t)).filter((v) => v >= 0.5).length;
  return NB - (NB - salen);
};

// ── Inducción: A se acerca, B se polariza, entra carga desde tierra, se corta la tierra y se retira A. ──
const ENTRAN = 4;
const xA2 = (t: number) => lerp(260, XB - RB - RA - 80, eIO(pr(t, T_INDUCCION - 0.3, 0.7))) - 260 * eIO(pr(t, T_RETIRA + 0.45, 0.7));
const polariza = (t: number) => eIO(pr(t, T_INDUCCION + 0.1, 0.6)) * (1 - eIO(pr(t, T_RETIRA + 0.6, 0.8)));
const conectada = (t: number) => eOut(pr(t, T_TIERRA - 0.6, 0.3)) * (1 - eIO(pr(t, T_RETIRA, 0.3)));
const viajeTierra = (j: number, t: number) => eIO(pr(t, T_TIERRA - 0.3 + j * 0.1, 0.4));
const netoInduccionB = (t: number) => {
  const entran = Array.from({ length: ENTRAN }, (_, j) => viajeTierra(j, t)).filter((v) => v >= 0.5).length;
  return NB - (NB + entran);
};
const conSigno = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k1 = eOut(pr(t, 0.2, 0.7));
  const k2 = eOut(pr(t, T_INDUCCION - 0.6, 0.6));
  rotulo(ctx, "Por contacto", 90, Y1 - 120, { a: eOut(pr(t, T_CONTACTO - 0.2, 0.5)), align: "left", size: 15, rgb: RGB.hielo });
  rotulo(ctx, "Por inducción", 90, Y2 - 120, { a: k2, align: "left", size: 15, rgb: RGB.hielo });
  rotulo(ctx, "Cuerpo neutro", XB, Y1 - RB - 22, { a: eOut(pr(t, T_NEUTRO, 0.5)) * (1 - eOut(pr(t, T_CONTACTO, 0.4))), align: "center", size: 13 });

  // Contacto.
  const ax = xA1(t);
  esfera(ctx, ax, Y1, RA, RGB.pos, k1);
  esfera(ctx, XB, Y1, RB, RGB.blanco, k1 * 0.8);
  rotulo(ctx, "A", ax, Y1 + RA + 24, { a: k1, align: "center", size: 14 });
  rotulo(ctx, "B", XB, Y1 + RB + 24, { a: k1, align: "center", size: 14 });
  anillo(ax, Y1, NA, 40, 0.2).forEach(([x, y]) => signo(ctx, x, y, 8, true, k1));
  anillo(XB, Y1, NB, 30).forEach(([x, y]) => signo(ctx, x, y, 8, true, k1));
  const huecosA = anillo(ax, Y1, PASAN, 16, 0.6);
  anillo(XB, Y1, NB, 58, 0.5).forEach((p, j) => {
    if (j >= PASAN) return signo(ctx, p[0], p[1], 8, false, k1);
    const v = viajeContacto(j, t);
    const q = mezcla(p, huecosA[j], v);
    signo(ctx, q[0], q[1] - Math.sin(v * Math.PI) * 30, 8, false, k1);
  });

  // Inducción.
  if (k2 > 0.01) {
    const bx = xA2(t);
    const kA = k2 * (1 - eIO(pr(t, T_RETIRA + 0.9, 0.5)));
    esfera(ctx, bx, Y2, RA, RGB.pos, kA);
    anillo(bx, Y2, NA, 40, 0.2).forEach(([x, y]) => signo(ctx, x, y, 8, true, kA));
    rotulo(ctx, "A", bx, Y2 + RA + 24, { a: kA, align: "center", size: 14 });
    esfera(ctx, XB, Y2, RB, RGB.blanco, k2 * 0.8);
    rotulo(ctx, "B", XB + RB + 26, Y2, { a: k2, align: "left", size: 14 });
    anillo(XB, Y2, NB, 22).forEach(([x, y]) => signo(ctx, x, y, 8, true, k2));
    // Cable a tierra.
    const kt = conectada(t);
    const kSimbolo = eOut(pr(t, T_TIERRA - 0.8, 0.4));
    tierra(ctx, XB, Y2 + RB + 62, kSimbolo);
    linea(ctx, [[XB, Y2 + RB], [XB, Y2 + RB + 62]], RGB.blanco, 0.8 * kt, 2);
    rotulo(ctx, "Tierra", XB + 50, Y2 + RB + 72, { a: kSimbolo, align: "left", size: 13 });
    // Electrones de B: uniformes → del lado de A → repartidos otra vez (con los que entraron).
    const p = polariza(t);
    const kFin = eIO(pr(t, T_RETIRA + 0.6, 0.8));
    const finales = anillo(XB, Y2, NB + ENTRAN, 58, 0.1);
    const lado = (j: number, n: number): Pt => [XB - 54 + (j % 2) * 18, Y2 - 40 + (j / (n - 1)) * 80];
    anillo(XB, Y2, NB, 58, 0.5).forEach((q0, j) => {
      const q1 = mezcla(q0, lado(j, NB + ENTRAN), p);
      const q = mezcla(q1, finales[j], kFin);
      signo(ctx, q[0], q[1], 8, false, k2);
    });
    for (let j = 0; j < ENTRAN; j++) {
      const v = viajeTierra(j, t);
      if (v <= 0) continue;
      const desde: Pt = [XB, Y2 + RB + 58];
      const pie: Pt = [XB, Y2 + RB - 6];
      const dentro = mezcla(lado(NB + j, NB + ENTRAN), finales[NB + j], kFin);
      const q = v < 0.5 ? mezcla(desde, pie, v * 2) : mezcla(pie, dentro, (v - 0.5) * 2);
      signo(ctx, q[0], q[1], 8, false, k2);
      if (v < 1) brillo(ctx, q[0], q[1], 30, RGB.neg, 0.4);
    }
  }
};

export const Electrizacion: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Contacto: *mismo signo*. Inducción: *signo opuesto*" />
      <Hud
        t0={T_CONTACTO}
        items={[
          { l: "B tras el contacto", v: conSigno(netoContactoB(t)), t: T_CONTACTO + 0.2 },
          { l: "B tras la inducción", v: conSigno(netoInduccionB(t)), azul: true, t: T_INDUCCION + 0.2 },
        ]}
      />
    </Escena>
  );
};
