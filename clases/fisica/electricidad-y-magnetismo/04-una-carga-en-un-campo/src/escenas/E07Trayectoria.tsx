import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { carga, flecha, linea, rotulo, variable, brillo } from "../lab/luz";
import { PL, camino, placas, rastro } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 7;
const T_RECTAS = w(E, "rectas");
const T_CURVA = w(E, "curva");
const T_FUERZA = w(E, "fuerza");
const T_VEL = w(E, "trayectoria", 1);
const T_SOLO = w(E, "Solo");
const T_REPOSO = w(E, "reposo");
export const sfx07: Sfx[] = [
  [E, T_FUERZA, "tic"],
  [E, T_VEL, "tic"],
  [E, T_REPOSO, "check"],
];

// Carga positiva lanzada a 60° en el campo uniforme hacia abajo (figura 1.21), en cámara lenta,
// y otra soltada desde el reposo, que sí baja sobre su línea de campo.
const THETA = (60 * Math.PI) / 180;
const X0 = 170;
const Y0 = PL.y1 - 30;
const RANGO = 480;
const TV = 7.6;
const VX = RANGO / TV;
const VY = VX * Math.tan(THETA);
const A = (2 * VY) / TV;
const T_LANZA = 1.0;
const XR = 830;
const YR0 = PL.y0 + 40;
const T_SUELTA = T_SOLO - 0.2;
const AR = (2 * (PL.y1 - 30 - YR0)) / (3.4 * 3.4);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.9));
  const kr = 1 + 0.7 * Math.max(0, Math.sin(Math.PI * pr(t, T_RECTAS - 0.2, 1.0)));
  placas(ctx, t, PL, ka, { brilloLineas: kr });
  // Lanzada.
  const s = Math.min(TV, Math.max(0, t - T_LANZA));
  const pts = camino(X0, Y0, VX, -VY, 0, A, s, 90);
  const kc = 1 + 0.5 * Math.max(0, Math.sin(Math.PI * pr(t, T_CURVA - 0.2, 0.9)));
  rastro(ctx, pts, RGB.azul, Math.min(1, 0.75 * kc), 2.2 * kc);
  const [x, y] = pts[pts.length - 1];
  const vx = VX;
  const vy = -VY + A * s;
  const vuela = s < TV ? 1 : 1 - eOut(pr(t, T_LANZA + TV, 0.4));
  // La línea de campo que pasa por la carga: recta, vertical.
  const kl = eOut(pr(t, T_FUERZA - 0.3, 0.5)) * vuela;
  linea(ctx, [[x, PL.y0 + 10], [x, PL.y1 - 10]], RGB.hielo, 0.45 * kl, 1.6);
  carga(ctx, x, y, 10, RGB.pos, ka * vuela, t);
  flecha(ctx, x, y + 16, x, y + 16 + 80 * kl, RGB.hielo, kl, 3, 15);
  variable(ctx, "F", "", x + 16, y + 70, 26, RGB.hielo, kl);
  const kv = eOut(pr(t, T_VEL - 0.3, 0.5)) * vuela;
  const nv = Math.hypot(vx, vy);
  flecha(ctx, x, y, x + (vx / nv) * 95 * kv, y + (vy / nv) * 95 * kv, RGB.azul, kv, 3, 15);
  variable(ctx, "v", "", x + (vx / nv) * 95 + 14, y + (vy / nv) * 95 - 14, 26, RGB.azul, kv);
  // Desde el reposo.
  const k2 = eOut(pr(t, T_SUELTA - 0.4, 0.5));
  const s2 = Math.max(0, t - T_SUELTA);
  const y2 = Math.min(PL.y1 - 30, YR0 + 0.5 * AR * s2 * s2);
  linea(ctx, [[XR, PL.y0 + 10], [XR, PL.y1 - 10]], RGB.hielo, 0.45 * k2, 1.6);
  brillo(ctx, XR, y2, 60, RGB.pos, 0.1 * k2);
  carga(ctx, XR, y2, 10, RGB.pos, k2, t);
  rotulo(ctx, "desde el reposo", XR - 30, YR0 + 44, { a: k2, size: 13, align: "right" });
  const kf2 = eOut(pr(t, T_REPOSO - 0.2, 0.5)) * (y2 < PL.y1 - 31 ? 1 : 1 - eOut(pr(s2, 3.4, 0.3)));
  flecha(ctx, XR, y2 + 16, XR, y2 + 16 + 70 * kf2, RGB.hielo, kf2, 3, 14);
};

export const Trayectoria: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const s = Math.min(TV, Math.max(0, t - T_LANZA));
  const vy = -VY + A * s;
  // Ángulo entre la velocidad y la fuerza (vertical hacia abajo, en el canvas +y).
  const ang = (Math.acos(vy / Math.hypot(VX, vy)) * 180) / Math.PI;
  // Soltada desde el reposo: v = AR·s apunta como F, así que el ángulo es 0.
  const s2 = Math.max(1e-3, t - T_SUELTA);
  const angReposo = (Math.acos((AR * s2) / Math.hypot(0, AR * s2)) * 180) / Math.PI;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="La trayectoria *no es una línea de campo*" />
      <Hud
        t0={T_FUERZA}
        items={[
          { l: "Ángulo velocidad-fuerza", v: `${num(ang, 0)}°`, t: T_VEL },
          { l: "Soltada en reposo", v: `${num(angReposo, 0)}°`, azul: true, t: T_REPOSO },
        ]}
      />
    </Escena>
  );
};
