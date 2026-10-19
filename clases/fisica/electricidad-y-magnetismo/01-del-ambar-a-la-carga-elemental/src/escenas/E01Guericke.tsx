import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { TAU, azar, brillo, chispa, linea, rgba, rotulo, type Pt } from "../lab/luz";
import { hito } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 1;
const T_1600 = w(E, "seiscientos");
const T_MUCHAS = w(E, "muchas");
const T_1660 = w(E, "sesenta");
const T_GIRAR = w(E, "girar");
const T_VOLUNTAD = w(E, "voluntad");
export const sfx01: Sfx[] = [
  [E, T_1600, "tic"],
  ...Array.from({ length: 6 }, (_, i): Sfx => [E, T_MUCHAS + i * 0.16, "tic"]),
  [E, T_1660, "tic"],
  [E, T_VOLUNTAD, "check"],
];

// Gilbert: seis muestras distintas que se electrizan al frotarlas (la primera es el ámbar).
const MUESTRAS = Array.from({ length: 6 }, (_, i) => ({
  x: lerp(150, 930, i / 5),
  y: 590,
  lados: 5 + (i % 3),
  rgb: ["255,170,60", "205,218,255", "170,150,230", "150,210,200", "230,160,170", "200,200,190"][i],
  t0: T_MUCHAS + i * 0.16,
}));

const GLOBO = { x: 540, y: 850, r: 125 };
const AZUFRE = "236,214,110";

const poligono = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, lados: number, rgb: string, a: number, giro: number) => {
  const pts: Pt[] = Array.from({ length: lados }, (_, j) => {
    const u = (j / lados) * TAU + giro;
    const rr = r * (0.82 + 0.18 * azar(j * 3.3 + lados));
    return [x + Math.cos(u) * rr, y + Math.sin(u) * rr * 0.8];
  });
  ctx.save();
  ctx.fillStyle = rgba(rgb, 0.3 * a);
  ctx.beginPath();
  pts.forEach(([px, py], j) => (j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  linea(ctx, [...pts, pts[0]], rgb, 0.85 * a, 1.6);
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const atenua = 1 - 0.55 * eIO(pr(t, T_1660 - 0.6, 0.8));
  MUESTRAS.forEach((m, i) => {
    const ka = eOut(pr(t, 0.3 + i * 0.08, 0.6)) * atenua;
    poligono(ctx, m.x, m.y, 42, m.lados, m.rgb, ka, i * 0.7);
    const kc = eOut(pr(t, m.t0, 0.5));
    brillo(ctx, m.x, m.y, 110, m.rgb, 0.2 * kc * atenua);
    for (let j = 0; j < 7; j++) {
      const u = (j / 7) * TAU + t * 0.6 + i;
      chispa(ctx, m.x + Math.cos(u) * 58, m.y + Math.sin(u) * 46, 1.6, m.rgb, kc * atenua * (0.55 + 0.45 * Math.sin(t * 3 + j)));
    }
  });
  rotulo(ctx, "Ámbar", MUESTRAS[0].x, 672, { a: eOut(pr(t, 0.6, 0.6)) * atenua, align: "center", size: 14 });
  rotulo(ctx, "… y muchas sustancias más", 620, 672, { a: eOut(pr(t, T_MUCHAS + 0.6, 0.6)) * atenua, align: "center", size: 14 });

  // Guericke: globo de azufre que gira contra la mano y se carga.
  const kg = eOut(pr(t, T_1660 - 0.2, 0.8));
  if (kg > 0.01) {
    const giro = Math.max(0, t - T_GIRAR) * 2.2;
    brillo(ctx, GLOBO.x, GLOBO.y, 260, AZUFRE, 0.14 * kg);
    ctx.save();
    const g = ctx.createRadialGradient(GLOBO.x - 40, GLOBO.y - 45, 8, GLOBO.x, GLOBO.y, GLOBO.r);
    g.addColorStop(0, rgba(AZUFRE, 0.6 * kg));
    g.addColorStop(1, rgba("150,120,30", 0.35 * kg));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(GLOBO.x, GLOBO.y, GLOBO.r * lerp(0.85, 1, kg), 0, TAU);
    ctx.fill();
    ctx.restore();
    // Meridianos que giran.
    for (let j = 0; j < 6; j++) {
      const fase = (j / 6) * Math.PI + giro;
      const rx = GLOBO.r * Math.abs(Math.cos(fase));
      ctx.save();
      ctx.strokeStyle = rgba(AZUFRE, 0.35 * kg);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(GLOBO.x, GLOBO.y, Math.max(0.5, rx), GLOBO.r, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    // Eje y manivela.
    linea(ctx, [[GLOBO.x, GLOBO.y - GLOBO.r - 22], [GLOBO.x, GLOBO.y + GLOBO.r + 22]], RGB.blanco, 0.5 * kg, 2);
    // Mano: almohadilla apoyada a la derecha.
    ctx.save();
    ctx.fillStyle = rgba("230,200,180", 0.4 * kg);
    ctx.beginPath();
    ctx.ellipse(GLOBO.x + GLOBO.r + 30, GLOBO.y + 10, 34, 62, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    rotulo(ctx, "Mano", GLOBO.x + GLOBO.r + 30, GLOBO.y + 98, { a: kg, align: "center", size: 14 });
    rotulo(ctx, "Globo de azufre", GLOBO.x - GLOBO.r - 30, GLOBO.y + 98, { a: kg, align: "right", size: 14 });
    // Carga que se acumula mientras gira: puntos sobre la esfera que giran con ella.
    const n = Math.floor(lerp(0, 46, pr(t, T_GIRAR + 0.2, 2.6)));
    for (let j = 0; j < n; j++) {
      const lat = Math.asin(lerp(-0.9, 0.9, azar(j * 1.9)));
      const lon = azar(j * 2.7 + 3) * TAU + giro;
      const z = Math.cos(lat) * Math.cos(lon);
      if (z < 0) continue;
      const x = GLOBO.x + GLOBO.r * Math.cos(lat) * Math.sin(lon);
      const y = GLOBO.y - GLOBO.r * Math.sin(lat);
      chispa(ctx, x, y, 1.8, RGB.hielo, kg * (0.4 + 0.6 * z));
    }
    // Chispas que saltan cuando ya está cargado.
    const ks = eOut(pr(t, T_VOLUNTAD - 0.4, 0.5));
    for (let j = 0; j < 5; j++) {
      const u = -2.4 + j * 0.25;
      const p = (Math.max(0, t - T_VOLUNTAD) * 1.6 + azar(j)) % 1;
      chispa(ctx, GLOBO.x + Math.cos(u) * (GLOBO.r + 20 + p * 80), GLOBO.y + Math.sin(u) * (GLOBO.r + 20 + p * 80), 2, RGB.azul, ks * (1 - p));
    }
  }
  hito(ctx, "1600", "William Gilbert", 90, 470, eOut(pr(t, T_1600, 0.7)), "left");
  hito(ctx, "~1660", "Otto von Guericke", 990, 470, eOut(pr(t, T_1660, 0.7)), "right");
};

export const Guericke: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Una curiosidad que *ya se puede estudiar*" />
      <Hud
        t0={T_MUCHAS}
        items={[
          { l: "Gilbert", v: "muchas sustancias", t: T_MUCHAS + 0.3 },
          { l: "Guericke", v: "a voluntad", azul: true, t: T_VOLUNTAD - 0.2 },
        ]}
      />
    </Escena>
  );
};
