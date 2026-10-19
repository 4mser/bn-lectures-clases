import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { carga, flecha, rotulo, variable } from "../lab/luz";
import { A_E, E_LAB, ME, PL, QE, cient, estrobo, placas } from "../lab/campo";
import { INFO, w } from "../linea";
import { C, RGB, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 8;
const T_ELEC = w(E, "electron");
const T_MIL = w(E, "mil");
const T_ACEL = w(E, "aceleracion");
const T_E = w(E, "e");
const T_UNO = w(E, "uno");
export const sfx08: Sfx[] = [
  [E, T_ELEC, "tic"],
  [E, T_MIL, "tic"],
  [E, T_UNO, "golpe"],
];

// Ejemplo 4 de §10.4: un electrón en E = 1,0 × 10³ N/C. Es negativo: la fuerza va contra las líneas, hacia arriba.
const X = 540;
const Y0 = PL.y1 - 40;
const YF = PL.y0 + 30;
const TS = 2.6; // s de animación de placa a placa (cámara muy lenta)
const APX = (2 * (Y0 - YF)) / (TS * TS);
const T_SUELTA = T_ACEL - 0.2;
const yEn = (s: number) => Math.max(YF, Y0 - 0.5 * APX * s * s);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.9));
  placas(ctx, t, PL, ka, { brilloLineas: 1 + 0.6 * eOut(pr(t, T_MIL, 0.5)) });
  const ke = eOut(pr(t, T_ELEC - 0.2, 0.6));
  const s = Math.max(0, t - T_SUELTA);
  const marcas: [number, number][] = [];
  for (let k = 1; k * 0.3 < Math.min(s, TS); k++) marcas.push([X, yEn(k * 0.3)]);
  estrobo(ctx, marcas, RGB.neg, 0.55);
  const y = yEn(s);
  carga(ctx, X, y, 12, RGB.neg, ke, t);
  variable(ctx, "−e", "", X - 50, y + 4, 28, RGB.blanco, ke, "center");
  const kf = eOut(pr(t, T_ACEL - 0.1, 0.5)) * (1 - eOut(pr(s, TS, 0.3)));
  flecha(ctx, X + 34, y, X + 34, y - 110 * kf, RGB.neg, kf, 3.5, 18);
  variable(ctx, "a", "", X + 56, y - 60, 28, RGB.neg, kf);
  rotulo(ctx, "cámara lenta", PL.x0, PL.y1 + 60, { a: eOut(pr(t, T_SUELTA, 0.5)), size: 13 });
};

export const Electron: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Un electrón en un campo modesto: *aceleración enorme*" />
      <Formula tex="a_E=\frac{eE}{m_e}" t0={T_E - 0.2} top={960} size={46} />
      <Hud
        t0={T_MIL}
        items={[
          { l: "Campo", v: <Tex tex={cient(E_LAB, 2)} size={40} />, u: "N/C" },
          { l: "Carga / masa", v: <Tex tex={cient(QE / ME, 3)} size={40} />, u: "C/kg", t: T_E },
          { l: "Aceleración", v: <Tex tex={cient(A_E, 2)} size={40} color={C.azul} />, u: "m/s²", azul: true, t: T_UNO },
        ]}
      />
    </Escena>
  );
};
