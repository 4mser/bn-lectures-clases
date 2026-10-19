import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { trazoDensidad } from "../lab/densidad";
import { brillo, chispa, flecha, linea, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";
import { A, B } from "../fisica";
import { PX, YB, camino, densidad, ejes, xpx } from "./barra";

const E = 4;
const T_ERRE = w(E, "erre");
const T_TODOS = w(E, "todos");
const T_LEJ = w(E, "lejanos");
const T_CAE = w(E, "cae");
export const sfx04: Sfx[] = [
  [E, T_ERRE, "tic"],
  [E, T_TODOS, "tic"],
  [E, T_LEJ, "tic"],
  [E, T_CAE, "check"],
];

// Ocho trozos iguales de la barra: su carga va como x, su aporte en P como αx dx / x² = α dx / x.
const N = 8;
const XS = Array.from({ length: N }, (_, j) => A + ((j + 0.5) * (B - A)) / N);
const CARGA = XS.map((x) => x / XS[0]);
const APORTE = XS.map((x) => XS[0] / x);
const LARGO = 210; // px del aporte del trozo más cercano
const XR = XS[5];

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.6));
  ejes(ctx, k);
  const kt = eOut(pr(t, T_TODOS - 0.3, 0.6));
  trazoDensidad(ctx, camino(A, B), densidad(A, B), k * (1 - 0.55 * kt), t, { grosor: 8 });
  // r = x: la distancia de P a un trozo es su coordenada.
  const kr = eOut(pr(t, T_ERRE - 0.3, 0.6)) * (1 - eOut(pr(t, T_TODOS, 0.5)));
  linea(ctx, [[PX, YB - 44], [xpx(XR), YB - 44]], RGB.blanco, 0.5 * kr, 1.2);
  for (const x of [PX, xpx(XR)]) linea(ctx, [[x, YB - 52], [x, YB - 36]], RGB.blanco, 0.5 * kr, 1.2);
  variable(ctx, "r", "", (PX + xpx(XR)) / 2, YB - 72, 30, RGB.blanco, kr, "center");
  chispa(ctx, xpx(XR), YB, 4.5, RGB.pos, kr);
  // Aportes de cada trozo, apilados sobre P: todos hacia −x; los lejanos, con más carga, aportan menos.
  const kl = eOut(pr(t, T_LEJ, 0.5));
  for (let j = 0; j < N; j++) {
    const ka = eOut(pr(t, T_TODOS + j * 0.1, 0.5));
    const lejano = j >= N - 2 ? kl : 0;
    const x = xpx(XS[j]);
    chispa(ctx, x, YB, 2.2 + 2.2 * CARGA[j], RGB.pos, ka);
    if (lejano > 0) brillo(ctx, x, YB, 50, RGB.blanco, 0.35 * lejano);
    const y = YB - 300 + j * 28;
    linea(ctx, [[x, YB - 14], [x, y]], RGB.hielo, 0.08 * ka, 1, [2, 5]);
    flecha(ctx, PX, y, PX - APORTE[j] * LARGO * ka, y, lejano > 0.5 ? RGB.blanco : RGB.hielo, ka * (0.6 + 0.4 * lejano), 2, 12);
  }
};

export const BarraAportes: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Todos los aportes en el eje: *nada que cancelar*" />
      <Formula tex="d\vec E=-\,k\,\frac{\alpha x\,dx}{x^{2}}\,\hat x=-\,\frac{k\alpha\,dx}{x}\,\hat x" t0={T_TODOS + 0.4} top={900} size={48} />
      <Hud
        t0={T_LEJ}
        items={[
          { l: "Carga: lejano / cercano", v: num(CARGA[N - 1], 2) },
          { l: "Aporte: lejano / cercano", v: num(APORTE[N - 1], 2), azul: true, t: T_CAE },
        ]}
      />
    </Escena>
  );
};
