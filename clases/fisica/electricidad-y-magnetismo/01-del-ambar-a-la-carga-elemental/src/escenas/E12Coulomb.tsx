import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { brillo, chispa, linea, rotulo } from "../lab/luz";
import { E_CARGA, cientifica, cientificaTex, palabra, potencia, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { C, RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 12;
const T_COULOMB = w(E, "coulomb");
const T_ELECTRONES = w(E, "electrones");
const T_GLOBO = w(E, "globo");
const T_NC = w(E, "nanocoulomb");
const T_UN = w(E, "electrón");
const T_CONTINUA = w(E, "continua");
export const sfx12: Sfx[] = [
  [E, T_ELECTRONES, "golpe"],
  [E, T_NC, "tic"],
  [E, T_CONTINUA, "check"],
];

// Cuántos electrones hay en cada carga: n = Q/e.
const N_1C = 1 / E_CARGA;
const N_GLOBO = 1e-8 / E_CARGA; // «quizá ~10⁻⁸ C» en los apuntes
const N_1NC = 1e-9 / E_CARGA;

// Regla logarítmica: de 1 electrón (10⁰) a 10¹⁹.
const XA = 110;
const XB = 970;
const YR = 640;
const xDe = (n: number) => lerp(XA, XB, Math.log10(n) / 19);

const marca = (ctx: CanvasRenderingContext2D, n: number, texto: string, arriba: boolean, a: number, azul: boolean) => {
  if (a <= 0.01) return;
  const x = xDe(n);
  const y1 = YR + (arriba ? -70 : 70);
  linea(ctx, [[x, YR], [x, y1]], azul ? RGB.azul : RGB.blanco, 0.8 * a, 2);
  brillo(ctx, x, YR, 30, azul ? RGB.azul : RGB.blanco, 0.5 * a);
  palabra(ctx, texto, x, y1 + (arriba ? -20 : 22), 24, azul ? RGB.azul : RGB.blanco, a, x > 800 ? "right" : "center");
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  linea(ctx, [[XA, YR], [XB, YR]], RGB.blanco, 0.6 * k, 2);
  for (let p = 0; p <= 19; p++) {
    const x = xDe(Math.pow(10, p));
    linea(ctx, [[x, YR - (p % 3 ? 5 : 10)], [x, YR + (p % 3 ? 5 : 10)]], RGB.blanco, 0.6 * k, 1.2);
    if (p % 3 === 0) potencia(ctx, "", p, x, YR + 34, 18, RGB.blanco, 0.55 * k, "center");
  }
  rotulo(ctx, "Electrones", XA, YR - 34, { a: k, align: "left", size: 13 });
  // Puntero que recorre la regla hasta 1 C.
  const kp = eIO(pr(t, T_COULOMB, T_ELECTRONES - T_COULOMB));
  const xp = lerp(XA, xDe(N_1C), kp);
  chispa(ctx, xp, YR, 4, RGB.azul, eOut(pr(t, T_COULOMB - 0.2, 0.3)));
  marca(ctx, N_1C, "1 C", true, eOut(pr(t, T_ELECTRONES, 0.5)), true);
  marca(ctx, N_GLOBO, "Globo frotado · ~10 nC", true, eOut(pr(t, T_GLOBO, 0.5)), false);
  marca(ctx, N_1NC, "1 nC", false, eOut(pr(t, T_UN - 0.4, 0.5)), false);
  // Un electrón en 1 nC: una parte en N_1NC.
  const [m, e] = cientifica(N_1NC, 2);
  const ku = eOut(pr(t, T_UN, 0.6));
  palabra(ctx, "Un electrón más en 1 nC: una parte en", 540, 800, 26, RGB.blanco, 0.8 * ku, "center", 400);
  potencia(ctx, m, e, 540, 840, 30, RGB.azul, ku, "center");
  // Fila de cargas que se juntan hasta parecer continua.
  const kc = eIO(pr(t, T_UN + 0.3, T_CONTINUA - T_UN + 0.3));
  const paso = lerp(46, 0.9, Math.pow(kc, 0.6));
  const n = Math.min(900, Math.floor(820 / paso));
  const ka = eOut(pr(t, T_UN, 0.6));
  for (let i = 0; i <= n; i++) {
    const x = 130 + i * paso;
    if (paso > 14) signo(ctx, x, 940, 8, false, ka);
    else chispa(ctx, x, 940, lerp(1, 2.6, paso / 14), RGB.neg, ka * 0.8);
  }
};

export const UnCoulomb: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Un coulomb es *una cantidad enorme* de electrones" />
      <Hud
        t0={T_ELECTRONES}
        items={[
          { l: "Electrones en 1 C", v: <Tex tex={cientificaTex(N_1C)} size={44} color={C.azul} />, azul: true },
          { l: "En un globo frotado", v: <Tex tex={cientificaTex(N_GLOBO)} size={44} />, t: T_NC },
        ]}
      />
    </Escena>
  );
};
