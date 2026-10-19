import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { carga, flecha, variable, brillo } from "../lab/luz";
import { E_LAB, PL, QE, cient, placas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 1;
const T_CARGA = w(E, "carga");
const T_FUERZA = w(E, "fuerza");
const T_POS = w(E, "positiva");
const T_NEG = w(E, "negativa");
const T_INV = w(E, "invierten");
const T_INV2 = w(E, "invierte");
export const sfx01: Sfx[] = [
  [E, T_POS, "tic"],
  [E, T_NEG, "tic"],
  [E, T_INV2, "golpe"],
];

// |F| = |q| |E| con q = ±e y el campo del ejemplo de los apuntes (1,0 × 10³ N/C).
const F = QE * E_LAB;
const LARGO = 150; // px de la flecha de fuerza
const POS = { x: 340, y: 700 };
const NEG = { x: 740, y: 700 };

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.9));
  // Con «invierten» las líneas laten: siguen apuntando igual.
  const late = 1 + 0.8 * Math.max(0, Math.sin(Math.PI * pr(t, T_INV - 0.1, 1.0)));
  placas(ctx, t, PL, ka, { brilloLineas: late });
  const kp = eOut(pr(t, T_CARGA, 0.6));
  carga(ctx, POS.x, POS.y, 13, RGB.pos, kp, t);
  variable(ctx, "+e", "", POS.x - 46, POS.y - 40, 30, RGB.blanco, kp, "center");
  const fp = eOut(pr(t, T_POS, 0.7));
  const pulso = 1 + 0.25 * Math.max(0, Math.sin(Math.PI * pr(t, T_INV2, 0.8)));
  flecha(ctx, POS.x, POS.y + 26, POS.x, POS.y + 26 + LARGO * fp * pulso, RGB.azul, fp, 4, 22);
  variable(ctx, "F", "", POS.x + 30, POS.y + 26 + LARGO * 0.6, 30, RGB.azul, fp);
  const kn = eOut(pr(t, T_NEG - 0.5, 0.6));
  carga(ctx, NEG.x, NEG.y, 13, RGB.neg, kn, t);
  variable(ctx, "−e", "", NEG.x - 46, NEG.y + 44, 30, RGB.blanco, kn, "center");
  const fn = eOut(pr(t, T_NEG, 0.7));
  flecha(ctx, NEG.x, NEG.y - 26, NEG.x, NEG.y - 26 - LARGO * fn * pulso, RGB.neg, fn, 4, 22);
  variable(ctx, "F", "", NEG.x + 30, NEG.y - 26 - LARGO * 0.6, 30, RGB.neg, fn);
  brillo(ctx, NEG.x, NEG.y - 26 - LARGO * fn * pulso, 40, RGB.neg, 0.2 * fn);
};

export const Signo: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="El signo de la carga *decide el sentido de la fuerza*" />
      <Formula tex="\vec F=q\,\vec E" t0={T_FUERZA} top={985} size={48} />
      <Hud
        t0={T_POS}
        items={[
          { l: "|F| carga positiva", v: <Tex tex={cient(F, 3)} size={46} />, u: "N", t: T_POS + 0.2 },
          { l: "|F| carga negativa", v: <Tex tex={cient(F, 3)} size={46} />, u: "N", azul: true, t: T_NEG + 0.2 },
        ]}
      />
    </Escena>
  );
};
