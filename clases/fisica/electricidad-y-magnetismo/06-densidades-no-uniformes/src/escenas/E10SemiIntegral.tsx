import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { trazoDensidad } from "../lab/densidad";
import { flecha, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eOut, num, numMiles, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";
import { E2, campo2En } from "../fisica";
import { CX, CY, FESC, camino, dens, ejes } from "./semi";

const E = 10;
const T_VERT = w(E, "vertical");
const T_MEDIOS = w(E, "medios");
const T_CAMPO = w(E, "campo");
export const sfx10: Sfx[] = [
  [E, T_VERT, "tic"],
  [E, T_MEDIOS, "check"],
  [E, T_CAMPO + 1.8, "golpe"],
];

// Barrido: se suman los aportes desde θ = −π/2 hasta θs. Al completar el semicírculo, Ex se anula y queda Ey.
const ths = (t: number) => tramo(t, T_VERT + 0.2, T_MEDIOS - T_VERT, -Math.PI / 2, Math.PI / 2);
const integralCos2 = (th: number) => (th + Math.PI / 2) / 2 + Math.sin(2 * th) / 4;
const [, EYTOT] = campo2En(0, 0);
if (Math.abs(-EYTOT / E2 - 1) > 1e-5) throw new Error(`La suma (${EYTOT}) no coincide con −πkλ₀/(2R)`);

const campoParcial = (t: number): [number, number] => {
  const th = ths(t);
  if (th <= -Math.PI / 2 + 1e-6) return [0, 0];
  return campo2En(0, 0, -Math.PI / 2, th, 600);
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.6));
  ejes(ctx, k);
  const th = ths(t);
  trazoDensidad(ctx, camino, dens, k, t, { grosor: 9, n: 120, chispas: 90, hasta: t < T_VERT + 0.2 ? 1 : (th + Math.PI / 2) / Math.PI });
  const [ex, ey] = campoParcial(t);
  const kf = eOut(pr(t, T_VERT + 0.2, 0.4));
  flecha(ctx, CX, CY, CX + ex * FESC, CY - ey * FESC, RGB.azul, kf, 5, 24);
  variable(ctx, "E", "", CX + ex * FESC + 30, CY - ey * FESC - 10, 32, RGB.azul, kf * eOut(pr(t, T_MEDIOS, 0.5)), "left");
};

export const SemiIntegral: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const [ex, ey] = campoParcial(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Sobrevive *la componente vertical*" />
      <Formula tex="\vec E(P)=-\frac{k\lambda_0}{R}\int_{-\pi/2}^{\pi/2}\cos^2\theta\,d\theta\;\hat y=-\frac{\pi k\lambda_0}{2R}\,\hat y" t0={T_CAMPO} top={985} size={40} />
      <Hud
        t0={T_VERT + 0.2}
        top={1150}
        items={[
          { l: "Integral de cos²", v: num(integralCos2(ths(t)), 3) },
          { l: "Módulo del campo", v: numMiles(Math.hypot(ex, ey)), u: "N/C", azul: true },
        ]}
      />
    </Escena>
  );
};
