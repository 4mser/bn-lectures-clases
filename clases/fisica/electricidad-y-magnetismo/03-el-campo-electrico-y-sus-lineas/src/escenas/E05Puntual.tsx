import React from "react";
import { Cabeza, Escena, Hud, Sim, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { flecha, carga, linea, puntoP, rotulo, variable, type Fuente, type Pt } from "../lab/luz";
import { KE, flechasCampo } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";

const E = 5;
const T_KA = w(E, "ka");
const T_AFUERA = w(E, "afuera");
const T_NEGATIVA = w(E, "negativa");
export const sfx05: Sfx[] = [
  [E, T_KA, "tic"],
  [E, T_AFUERA, "tic"],
  [E, T_NEGATIVA, "golpe"],
];

// Carga de ±1 nC; la sonda se aleja de 6 a 16 cm (20 px por cm).
const QF = 1e-9;
const PX_CM = 20;
const Q = { x: 470, y: 690 };
const signo = (t: number) => tramo(t, T_NEGATIVA - 0.5, 0.9, 1, -1);
const rCm = (t: number) => tramo(t, T_KA, T_AFUERA - T_KA, 6, 16);

const GRILLA: Pt[] = [];
for (let y = 420; y <= 870; y += 90) for (let x = 65; x <= 1030; x += 90) if (Math.abs(y - Q.y) > 40) GRILLA.push([x, y]);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const s = signo(t);
  const fuente: Fuente = { x: Q.x, y: Q.y, q: s };
  const k = eOut(pr(t, 0.2, 0.9));
  flechasCampo(ctx, [fuente], GRILLA, 2600, 60, s >= 0 ? RGB.hielo : RGB.neg, 0.55 * k * Math.min(1, Math.abs(s) * 2.5), 0.35, 60);
  carga(ctx, Q.x, Q.y, 15 * Math.max(0.4, Math.abs(s)), s >= 0 ? RGB.pos : RGB.neg, k, t);
  variable(ctx, s >= 0 ? "+Q" : "−Q", "", Q.x, Q.y - 72, 34, RGB.blanco, k, "center");

  // Sonda en el eje: flecha del campo, que cae como 1/r² (largo ∝ E, con tope).
  const r = rCm(t);
  const x = Q.x + r * PX_CM;
  const kp = eOut(pr(t, T_KA - 0.3, 0.6));
  linea(ctx, [[Q.x + 30, Q.y], [x, Q.y]], RGB.blanco, 0.25 * kp, 1, [3, 6]);
  rotulo(ctx, `r = ${num(r, 1)} cm`, (Q.x + x) / 2, Q.y + 40, { a: kp, align: "center", size: 14, caja: true });
  const largo = Math.min(240, (240 * 36) / (r * r)) * s;
  const x0 = x + (s >= 0 ? 18 : -18);
  flecha(ctx, x0, Q.y, x0 + largo, Q.y, RGB.azul, kp * Math.min(1, Math.abs(s) * 3), 4, 20);
  puntoP(ctx, x, Q.y, kp, "", 0, 0);
};

export const Puntual: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const s = signo(t);
  const r = rCm(t);
  const eNC = (KE * QF) / ((r / 100) * (r / 100));
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Hacia afuera si es positiva, *hacia adentro si es negativa*" />
      <Formula tex="\vec E=k_e\,\frac{Q}{r^{2}}\,\hat r" t0={T_KA} top={935} size={50} />
      <Hud
        t0={T_KA}
        items={[
          { l: <>Distancia <Sim>r</Sim></>, v: num(r, 1), u: "cm" },
          { l: <>Módulo |<Sim>E</Sim>|</>, v: num(eNC * Math.abs(s), 0), u: "N/C", t: T_KA + 0.12 },
          { l: "Sentido", v: s > 0.02 ? "afuera" : s < -0.02 ? "adentro" : "—", azul: true, t: T_AFUERA - 0.2 },
        ]}
      />
    </Escena>
  );
};
