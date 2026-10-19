import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { brillo, chispa, linea, rgba, rotulo, type Pt } from "../lab/luz";
import { C_LUZ, UA } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";
import { LineaTiempo } from "./Linea";

const E = 2;
const T_ECUACIONES = w(E, "ecuaciones");
const T_LUZ = w(E, "luz");
const T_FINITA = w(E, "finita");
const T_SOL = w(E, "desapareciera");
const T_OCHO = w(E, "ocho");
const VIAJE = T_OCHO + 0.4 - T_SOL; // segundos de animación que dura el viaje del frente
export const sfx02: Sfx[] = [
  [E, T_LUZ, "tic"],
  [E, T_SOL, "golpe"],
  [E, T_SOL + VIAJE, "campana"],
];

// Tiempo que tarda un cambio del campo en recorrer 1 UA: Δt = r / c.
const DT_S = UA / C_LUZ;
const DT_MIN = DT_S / 60;

const SOL = { x: 130, y: 600 };
const R = 810; // órbita, en píxeles
const ANG0 = -0.05; // posición inicial de la Tierra en su órbita
const OMEGA = 0.012; // rad/s de animación (exagerado: en 8 minutos reales la Tierra casi no se mueve)

const frente = (t: number) => (t < T_SOL ? -1 : Math.min(1, (t - T_SOL) / VIAJE) * R * 1.4);

const tierra = (t: number): Pt => {
  const tLlega = T_SOL + VIAJE; // el frente llega a la Tierra: desde ahí sigue en línea recta (tangente)
  const ang = ANG0 + OMEGA * Math.min(t, tLlega);
  const x = SOL.x + R * Math.cos(ang);
  const y = SOL.y + R * Math.sin(ang);
  const extra = Math.max(0, t - tLlega) * OMEGA * R;
  return [x - Math.sin(ang) * extra, y + Math.cos(ang) * extra];
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 1));
  const ks = 1 - eOut(pr(t, T_SOL, 0.35)); // el Sol se apaga
  // Órbita.
  ctx.save();
  ctx.strokeStyle = rgba(RGB.hielo, 0.16 * k);
  ctx.setLineDash([3, 8]);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(SOL.x, SOL.y, R, -0.38, 0.38);
  ctx.stroke();
  ctx.restore();
  // Sol.
  brillo(ctx, SOL.x, SOL.y, 230, "255,196,96", 0.4 * k * ks);
  brillo(ctx, SOL.x, SOL.y, 70, "255,214,140", 0.95 * k * ks);
  ctx.fillStyle = rgba("255,244,220", k * ks);
  ctx.beginPath();
  ctx.arc(SOL.x, SOL.y, 26, 0, Math.PI * 2);
  ctx.fill();
  rotulo(ctx, "Sol", SOL.x, SOL.y + 92, { a: k, align: "center" });
  // Donde estaba el Sol queda solo su contorno punteado.
  ctx.save();
  ctx.strokeStyle = rgba("255,214,140", 0.35 * (1 - ks));
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.arc(SOL.x, SOL.y, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Luz: una onda que viaja del Sol a la Tierra. Detrás del frente ya no hay onda.
  const [tx, ty] = tierra(t);
  const kw = eOut(pr(t, T_LUZ - 0.3, 0.8));
  const fr = frente(t);
  const pts: Pt[] = [];
  for (let x = SOL.x + 40; x <= tx - 24; x += 3) {
    if (fr >= 0 && x - SOL.x < fr) continue;
    pts.push([x, SOL.y + Math.sin((x - SOL.x) * 0.045 - t * 6) * 26 * (ty - SOL.y > 0 ? 1 : 1)]);
  }
  linea(ctx, pts, RGB.azul, 0.75 * kw, 2);
  rotulo(ctx, "onda electromagnética", (SOL.x + tx) / 2 + 30, SOL.y - 70, { a: kw * (1 - eOut(pr(t, T_SOL, 0.5))), align: "center", size: 14 });

  // Frente del cambio: un anillo que se expande a velocidad c.
  if (fr > 0 && fr < R * 1.35) {
    const kf = 1 - pr(fr, R * 1.1, R * 0.25);
    ctx.save();
    ctx.strokeStyle = rgba(RGB.blanco, 0.7 * kf);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(SOL.x, SOL.y, fr, -0.6, 0.6);
    ctx.stroke();
    ctx.restore();
    rotulo(ctx, "c", SOL.x + fr + 18, SOL.y - 150, { a: kf, size: 18, caja: true });
  }

  // Tierra.
  brillo(ctx, tx, ty, 60, RGB.pos, 0.5 * k);
  chispa(ctx, tx, ty, 10, RGB.pos, k);
  rotulo(ctx, "Tierra", tx, ty + 56, { a: k, align: "center" });
  const ke = eOut(pr(t, T_ECUACIONES, 0.8));
  rotulo(ctx, "1 UA", (SOL.x + tx) / 2, SOL.y + 92, { a: ke, align: "center", size: 14 });
  linea(ctx, [[SOL.x + 60, SOL.y + 60], [tx - 30, SOL.y + 60]], RGB.blanco, 0.2 * ke, 1, [3, 6]);
};

export const Maxwell: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const viaje = pr(t, T_SOL, VIAJE);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Los cambios del campo *viajan a velocidad finita*" />
      <Hud
        t0={T_FINITA}
        top={850}
        items={[
          { l: "Distancia Sol–Tierra", v: num(UA / 1e9, 1), u: "millones de km", t: T_FINITA },
          { l: "Tiempo desde que se apaga", v: num(lerp(0, DT_MIN, viaje), 1), u: "min", azul: true, t: T_SOL - 0.2 },
        ]}
      />
      <LineaTiempo activo={2} t0={0.3} />
    </Escena>
  );
};
