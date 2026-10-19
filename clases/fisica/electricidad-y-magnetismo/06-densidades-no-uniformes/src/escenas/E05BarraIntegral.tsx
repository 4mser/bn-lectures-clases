import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { grafico, trazoDensidad } from "../lab/densidad";
import { linea, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";
import { A, B, campo1, campo1Suma } from "../fisica";
import { PX, YB, camino, densidad, ejes, flechaCampo, xpx } from "./barra";

const E = 5;
const T_SUMA = w(E, "sumamos");
const T_LOG = w(E, "logaritmo");
const T_CON = w(E, "con");
const T_CAMPO = w(E, "campo");
export const sfx05: Sfx[] = [
  [E, T_SUMA, "tic"],
  [E, T_LOG, "tic"],
  [E, T_CAMPO + 0.4, "golpe"],
];

// Límite superior de la integral: barre de a hasta b.
const xs = (t: number) => tramo(t, T_SUMA + 0.2, T_CON - T_SUMA, A, B);
const G = { base: 560, alto: 170 };
// Comprobación: la suma directa de los aportes coincide con kα ln(b/a).
const SUMA = campo1Suma(A, B);
if (Math.abs(SUMA / campo1(A, B) - 1) > 1e-5) throw new Error(`La suma (${SUMA}) no coincide con kα ln(b/a)`);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.6));
  const x = xs(t);
  ejes(ctx, k);
  const ks = eOut(pr(t, T_SUMA, 0.4));
  trazoDensidad(ctx, camino(A, B), densidad(A, B), k, t, { grosor: 8, hasta: ks > 0 ? (x - A) / (B - A) : 1 });
  // 1/x sobre [a, b]: el área bajo la curva hasta el límite es ln(x/a).
  const kg = eOut(pr(t, T_SUMA, 0.7));
  grafico(ctx, xpx(A), xpx(B), G.base, G.alto, (u) => A / (A + (B - A) * u), kg, (x - A) / (B - A));
  rotulo(ctx, "1 / x", xpx(A) - 20, G.base - G.alto - 30, { a: kg, size: 16, align: "right" });
  linea(ctx, [[xpx(x), G.base + 4], [xpx(x), YB - 16]], RGB.azul, 0.3 * kg, 1, [3, 5]);
  const kf = eOut(pr(t, T_SUMA + 0.1, 0.4));
  flechaCampo(ctx, campo1(A, x), kf);
  variable(ctx, "E", "", PX - (campo1(A, x) * 200) / campo1(A, B) / 2, YB - 36, 30, "91,134,255", kf, "center");
};

export const BarraIntegral: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const x = xs(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="La integral de dx/x: *un logaritmo*" />
      <Formula tex="E=k\alpha\int_a^b\frac{dx}{x}=k\alpha\,\ln\frac{b}{a}" t0={T_LOG} top={900} size={50} />
      <Hud
        t0={T_SUMA + 0.2}
        items={[
          { l: "Límite superior", v: num(x, 3), u: "m" },
          { l: "ln(x / a)", v: num(Math.log(x / A), 3) },
          { l: "Campo en P", v: num(campo1(A, x), 1), u: "N/C", azul: true },
        ]}
      />
    </Escena>
  );
};
