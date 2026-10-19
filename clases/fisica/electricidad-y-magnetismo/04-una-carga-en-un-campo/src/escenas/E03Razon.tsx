import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { carga, flecha, variable } from "../lab/luz";
import { PL, estrobo, placas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 3;
const T_QE = w(E, "E");
const T_ACEL = w(E, "aceleracion");
const T_CAMBIA = w(E, "cambia");
const T_SEPARA = w(E, "separa");
export const sfx03: Sfx[] = [
  [E, T_ACEL, "tic"],
  [E, T_CAMBIA, "tic"],
  [E, T_SEPARA, "golpe"],
];

// Tres cargas positivas soltadas desde el reposo, con razones q/m de 1, 2 y ½ (relativas a la primera).
const RAZON = [1, 2, 0.5];
const NOMBRE = ["q/m", "2q/m", "q/2m"];
const X = [280, 540, 800];
const Y0 = PL.y0 + 40;
const YF = PL.y1 - 24;
const T1 = 2.4; // s de animación que tarda la de razón 1 en llegar a la placa
const A1 = (2 * (YF - Y0)) / (T1 * T1);
const T_SUELTA = T_CAMBIA - 0.3;
const yEn = (r: number, s: number) => Math.min(YF, Y0 + 0.5 * A1 * r * s * s);
// Tiempo hasta la placa relativo a la de razón 1: t ∝ 1/√a.
const tiempo = (r: number) => Math.sqrt(1 / r);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.9));
  placas(ctx, t, PL, ka);
  const s = Math.max(0, t - T_SUELTA);
  const kf = eOut(pr(t, T_ACEL, 0.6));
  RAZON.forEach((r, i) => {
    const marcas = [];
    for (let k = 1; k * 0.25 < s; k++) if (yEn(r, k * 0.25) < YF) marcas.push([X[i], yEn(r, k * 0.25)] as [number, number]);
    estrobo(ctx, marcas, RGB.pos, 0.5 * ka);
    const y = yEn(r, s);
    carga(ctx, X[i], y, 11, RGB.pos, ka, t);
    variable(ctx, NOMBRE[i], "", X[i] - 30, Y0, 24, RGB.blanco, ka, "right");
    // Flecha de aceleración, proporcional a q/m.
    flecha(ctx, X[i] + 30, y, X[i] + 30, y + 55 * r * kf, RGB.azul, kf * (y < YF - 1 ? 1 : 0.3), 3, 14);
  });
};

export const Razon: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="En un campo eléctrico, *manda la razón q/m*" />
      <Formula tex="m\vec a=q\vec E\;\Rightarrow\;\vec a=\frac{q}{m}\vec E" t0={T_QE} top={958} size={44} />
      <Hud
        t0={T_CAMBIA}
        items={[
          { l: "Aceleración relativa", v: RAZON.map((r) => num(r, r % 1 ? 1 : 0)).join(" · ") },
          { l: "Tiempo a la placa", v: RAZON.map((r) => num(tiempo(r), 2)).join(" · "), azul: true, t: T_SEPARA - 0.4 },
        ]}
      />
    </Escena>
  );
};
