import React from "react";
import { Cabeza, Escena, Hud, Sim, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { TAU, carga, chispa, flecha, linea, particulas, puntoP, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 9;
const T_JUNTAS = w(E, "juntas");
const T_INTENSO = w(E, "intenso");
const T_PARALELAS = w(E, "paralelas");
const T_UNIFORME = w(E, "uniforme");
export const sfx09: Sfx[] = [
  [E, T_JUNTAS, "tic"],
  [E, T_PARALELAS, "soplido"],
  [E, T_UNIFORME, "check"],
];

// Parte 1: carga puntual, A cerca (rA) y B al doble (rB = 2 rA). |E| ∝ 1/r²: la flecha en B mide (rA/rB)² de la de A.
const Q = { x: 300, y: 700 };
const RA = 170;
const RB = 340;
const RAZON = (RB / RA) ** 2; // E_A / E_B
const LARGO_A = 150;
// Parte 2: placas paralelas; entre ellas, líneas paralelas e igualmente espaciadas.
const PLACA = { x0: 150, x1: 930, y0: 470, y1: 930 };
const PUNTOS: [number, number][] = [
  [300, 600],
  [540, 700],
  [780, 800],
];

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const cambio = eIO(pr(t, T_PARALELAS - 0.4, 0.8));
  const k1 = eOut(pr(t, 0.15, 0.8)) * (1 - cambio);
  if (k1 > 0.01) {
    for (let j = 0; j < 22; j++) {
      const ang = (j / 22) * TAU + 0.07;
      const pts: [number, number][] = [
        [Q.x + Math.cos(ang) * 30, Q.y + Math.sin(ang) * 30],
        [Q.x + Math.cos(ang) * 1100, Q.y + Math.sin(ang) * 1100],
      ];
      linea(ctx, pts, RGB.hielo, 0.2 * k1, 1);
      particulas(ctx, pts, t, 80, 4, RGB.hielo, 0.6 * k1, j + 3, 1.4);
    }
    carga(ctx, Q.x, Q.y, 15, RGB.pos, k1, t);
    const ka = eOut(pr(t, T_JUNTAS - 0.4, 0.6)) * (1 - cambio);
    for (const [r, nombre, largo, ang] of [
      [RA, "A", LARGO_A, -0.9],
      [RB, "B", LARGO_A / RAZON, 0.35],
    ] as [number, string, number, number][]) {
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const x = Q.x + c * r;
      const y = Q.y + s * r;
      ctx.save();
      ctx.strokeStyle = `rgba(244,245,248,${0.18 * ka})`;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(Q.x, Q.y, r, 0, TAU);
      ctx.stroke();
      ctx.restore();
      flecha(ctx, x, y, x + c * largo * ka, y + s * largo * ka, RGB.azul, ka, 4, 20);
      puntoP(ctx, x, y, ka, nombre, -26, 26);
    }
    rotulo(ctx, "líneas juntas", Q.x, Q.y + 120, { a: ka, align: "center", size: 14 });
    rotulo(ctx, "líneas separadas", Q.x + 470, Q.y + 330, { a: eOut(pr(t, T_INTENSO - 0.2, 0.6)) * (1 - cambio), align: "center", size: 14 });
  }

  // Placas.
  const k2 = eOut(pr(t, T_PARALELAS - 0.1, 0.8));
  if (k2 > 0.01) {
    for (const [y, rgb, signo] of [
      [PLACA.y0, RGB.pos, "+"],
      [PLACA.y1, RGB.neg, "−"],
    ] as [number, string, string][]) {
      linea(ctx, [[PLACA.x0, y], [PLACA.x1, y]], rgb, 0.9 * k2, 5);
      for (let x = PLACA.x0 + 30; x < PLACA.x1; x += 60) {
        chispa(ctx, x, y, 1.6, rgb, k2 * (0.6 + 0.4 * Math.sin(t * 2 + x)));
        rotulo(ctx, signo, x, y + (signo === "+" ? -26 : 28), { a: 0.7 * k2, align: "center", size: 16, rgb });
      }
    }
    for (let x = PLACA.x0 + 60; x < PLACA.x1 - 20; x += 60) {
      const pts: [number, number][] = [
        [x, PLACA.y0 + 10],
        [x, PLACA.y1 - 10],
      ];
      linea(ctx, pts, RGB.hielo, 0.3 * k2, 1.2);
      particulas(ctx, pts, t, 70, 3, RGB.hielo, 0.6 * k2, x, 1.4);
    }
    const kp = eOut(pr(t, T_UNIFORME - 0.4, 0.6));
    PUNTOS.forEach(([x, y], i) => {
      const xp = x; // entre dos líneas
      flecha(ctx, xp, y, xp, y + 90 * kp, RGB.azul, kp, 4, 20);
      puntoP(ctx, xp, y, kp, "", 0, 0);
      variable(ctx, "E", String(i + 1), xp + 22, y + 50, 28, RGB.azul, kp, "left");
    });
  }
};

export const Densidad: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Más juntas, *más intenso*. Paralelas, *uniforme*" />
      <Hud
        t0={T_JUNTAS}
        items={[
          { l: "Campo en A / campo en B", v: num(RAZON, 2), t: T_INTENSO - 0.3 },
          { l: <>|<Sim sub="1">E</Sim>| = |<Sim sub="2">E</Sim>| = |<Sim sub="3">E</Sim>|</>, v: "uniforme", azul: true, t: T_UNIFORME },
        ]}
      />
    </Escena>
  );
};
