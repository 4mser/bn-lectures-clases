import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { marcaDq, trazoDensidad } from "../lab/densidad";
import { linea, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";
import { LAMBDA0, Q2, R2, carga2Suma } from "../fisica";
import { CX, CY, RPX, anguloTheta, camino, dens, ejes, enArco } from "./semi";

const E = 8;
const T_DOCE = w(E, "doce");
const T_LAMBDA = w(E, "lambda");
const T_MAX = w(E, "maxima");
const T_NULA = w(E, "nula");
const T_TOTAL = w(E, "total");
const T_VALE = w(E, "vale");
export const sfx08: Sfx[] = [
  [E, T_DOCE, "tic"],
  [E, T_MAX, "tic"],
  [E, T_NULA, "tic"],
  [E, T_VALE, "golpe"],
];

const TH = (40 * Math.PI) / 180; // elemento de muestra
const DTH = 0.05;
// Comprobación: la suma de λ₀ cos θ R dθ devuelve la carga total del enunciado.
const QSUMA = carga2Suma();
if (Math.abs(QSUMA / Q2 - 1) > 1e-5) throw new Error(`La suma de la carga (${QSUMA}) no da Q`);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.6));
  ejes(ctx, k);
  const ks = eOut(pr(t, T_DOCE - 0.2, 0.8));
  trazoDensidad(ctx, camino, dens, ks, t, { grosor: 9, n: 120, chispas: 90 });
  // Radio R hacia la izquierda.
  const kr = eOut(pr(t, T_DOCE + 1.2, 0.6));
  const pr0 = enArco(-Math.PI / 2 + 0.001);
  linea(ctx, [[CX, CY + 40], [pr0[0], CY + 40]], RGB.blanco, 0.45 * kr, 1.2);
  for (const x of [CX, pr0[0]]) linea(ctx, [[x, CY + 32], [x, CY + 48]], RGB.blanco, 0.45 * kr, 1.2);
  variable(ctx, "R", "", CX - RPX / 2, CY + 70, 28, RGB.blanco, kr, "center");
  // θ y el elemento dq en θ = 40°.
  const kt = eOut(pr(t, T_LAMBDA + 1.2, 0.6));
  anguloTheta(ctx, TH, kt);
  marcaDq(ctx, enArco(TH - DTH), enArco(TH + DTH), kt);
  const [dx, dy] = enArco(TH, RPX + 44);
  variable(ctx, "dq", "", dx, dy, 28, RGB.blanco, kt, "center");
  // Dónde es máxima y dónde se anula.
  const km = eOut(pr(t, T_MAX, 0.5));
  rotulo(ctx, "máxima", CX, CY - RPX - 104, { a: km, size: 14, align: "center", rgb: RGB.azul });
  const kn = eOut(pr(t, T_NULA, 0.5));
  rotulo(ctx, "nula", CX - RPX - 12, CY - 34, { a: kn, size: 14, align: "right" });
  rotulo(ctx, "nula", CX + RPX + 12, CY - 34, { a: kn, size: 14, align: "left" });
};

export const Semicirculo: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const uc = <Tex tex="\mu\text{C}" size={24} color={C.texto2} />;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Ejercicio 2: un semicírculo *más cargado arriba*" />
      <Formula tex="\lambda(\theta)=\lambda_0\cos\theta" t0={T_LAMBDA} top={985} size={50} tFin={T_TOTAL - 0.4} />
      <Formula tex="Q=\int_{-\pi/2}^{\pi/2}\lambda_0\cos\theta\,R\,d\theta=2\lambda_0R" t0={T_TOTAL} top={985} size={44} />
      <Hud
        t0={T_DOCE}
        top={1150}
        items={[
          { l: "Carga total", v: num(QSUMA * 1e6, 1), u: uc },
          { l: "Radio", v: num(R2, 2), u: "m" },
          { l: "Lambda cero", v: num(LAMBDA0 * 1e6, 1), u: <Tex tex="\mu\text{C/m}" size={24} color={C.azul} />, azul: true, t: T_VALE },
        ]}
      />
    </Escena>
  );
};
