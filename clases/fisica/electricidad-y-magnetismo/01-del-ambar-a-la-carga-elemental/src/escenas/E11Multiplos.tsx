import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { azar, brillo, chispa, linea, rotulo, variable } from "../lab/luz";
import { E_CARGA, cientifica, potencia } from "../lab/historia";
import { INFO, w } from "../linea";
import { C, RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 11;
const T_MILES = w(E, "miles");
const T_MULTIPLO = w(E, "múltiplo");
const T_ENTERO = w(E, "entero");
const T_E = w(E, "e");
const T_2019 = w(E, "diecinueve");
const T_EXACTO = w(E, "exacto");
export const sfx11: Sfx[] = [
  [E, T_ENTERO, "check"],
  [E, T_E, "golpe"],
  [E, T_EXACTO, "tic"],
];

// Eje de cargas en unidades de 10⁻¹⁹ C.
const UNIDAD = 1e-19;
const Q_MAX = 8.6 * E_CARGA;
const XA = 130;
const XB = 950;
const YE = 870;
const xDe = (q: number) => lerp(XA, XB, q / Q_MAX);
const N_MAX = 7;
const PASO = 11; // alto de cada gota apilada

// Gotas medidas: cada una con n electrones de más (1 a 7, las chicas más frecuentes). Su carga es exactamente n e.
const GOTAS = Array.from({ length: 64 }, (_, i) => {
  const u = azar(i * 2.31 + 0.7);
  const n = Math.min(N_MAX, 1 + Math.floor(-Math.log(1 - u * 0.97) * 2.1));
  return { n, t0: T_MILES + i * 0.065 };
});
const ALTO = GOTAS.map((g, i) => GOTAS.slice(0, i).filter((h) => h.n === g.n).length);

// e con todas sus cifras (exacta desde 2019), decimales en grupos de tres.
const [MANT_E, EXP_E] = cientifica(E_CARGA, 9);
const MANT_TEX = MANT_E.replace(/,(\d{3})(\d{3})(\d{3})/, "{,}$1\\,$2\\,$3");

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  linea(ctx, [[XA - 20, YE], [XB + 20, YE]], RGB.blanco, 0.7 * k, 1.6);
  // Marcas en cada múltiplo de e, con su valor calculado.
  const km = eOut(pr(t, T_ENTERO - 0.2, 0.7));
  for (let n = 0; n <= N_MAX + 1; n++) {
    const x = xDe(n * E_CARGA);
    linea(ctx, [[x, YE - 6], [x, YE + 6]], RGB.blanco, 0.7 * k, 1.4);
    if (n > 0) {
      linea(ctx, [[x, YE - 10], [x, 525]], RGB.azul, 0.25 * km, 1, [3, 7]);
      variable(ctx, `${n}e`, "", x, 505, 24, RGB.azul, km, "center");
    }
    rotulo(ctx, num((n * E_CARGA) / UNIDAD, n === 0 ? 0 : 2), x, YE + 28, { a: k, align: "center", size: 13 });
  }
  // Rótulo del eje: «q · en unidades de 10⁻¹⁹ C».
  variable(ctx, "q", "", XA - 20, YE + 62, 26, RGB.blanco, k);
  rotulo(ctx, "en unidades de", XA + 8, YE + 64, { a: k, align: "left", size: 13 });
  ctx.save();
  ctx.font = `400 13px "IBM Plex Mono"`;
  ctx.letterSpacing = `${13 * 0.18}px`;
  const ancho = ctx.measureText("EN UNIDADES DE").width;
  ctx.restore();
  potencia(ctx, "", -19, XA + 18 + ancho, YE + 62, 20, RGB.blanco, 0.75 * k, "left", "C");
  // Gotas que caen y se apilan en su múltiplo.
  GOTAS.forEach((g, i) => {
    const kc = eIO(pr(t, g.t0, 0.55));
    if (kc <= 0) return;
    const x = xDe(g.n * E_CARGA);
    const yFin = YE - 12 - ALTO[i] * PASO;
    const y = lerp(565, yFin, kc);
    chispa(ctx, x, y, 3.2, "255,214,130", eOut(pr(t, g.t0, 0.2)));
    if (kc < 1) brillo(ctx, x, y, 22, "255,214,130", 0.3);
  });
  // La unidad: el salto entre 0 y e.
  const ke = eOut(pr(t, T_E - 0.1, 0.6));
  const x1 = xDe(E_CARGA);
  linea(ctx, [[XA, YE + 102], [x1, YE + 102]], RGB.azul, ke, 3);
  linea(ctx, [[XA, YE + 94], [XA, YE + 110]], RGB.azul, ke, 2);
  linea(ctx, [[x1, YE + 94], [x1, YE + 110]], RGB.azul, ke, 2);
  variable(ctx, "e", "", x1 + 16, YE + 102, 30, RGB.azul, ke);
};

export const Multiplos: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const medidas = GOTAS.filter((g) => t >= g.t0 + 0.55).length;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Siempre en *múltiplos enteros de e*" />
      <Formula tex="Q=n\,e,\qquad n\in\mathbb{Z}" t0={T_MULTIPLO} top={392} size={42} />
      <Hud
        t0={T_MILES}
        items={[
          { l: "Gotas medidas", v: String(medidas) },
          {
            l: "Carga elemental · exacta desde 2019",
            v: <Tex tex={`${MANT_TEX}\\times10^{${EXP_E}}`} size={40} color={C.azul} />,
            u: "C",
            azul: true,
            t: T_2019,
          },
        ]}
      />
    </Escena>
  );
};
