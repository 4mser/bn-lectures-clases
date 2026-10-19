import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { TAU, azar, brillo, chispa, linea, rgba, rotulo, type Pt } from "../lab/luz";
import { hito, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 7;
const T_1911 = w(E, "once");
const T_LANZO = w(E, "lanzó");
const T_ORO = w(E, "oro");
const T_REBOTA = w(E, "rebotaba");
const T_NUCLEO = w(E, "núcleo");
export const sfx07: Sfx[] = [
  [E, T_1911, "tic"],
  [E, T_REBOTA, "golpe"],
  [E, T_NUCLEO, "check"],
];

// Lámina delgada: una columna de átomos casi vacíos, con su núcleo diminuto en el centro.
const XL = 640;
const X_FUENTE = 135;
const NUCLEOS: Pt[] = Array.from({ length: 9 }, (_, i) => [XL, 450 + i * 68]);
const R_ATOMO = 32;
// Repulsión coulombiana núcleo–alfa: aceleración K/r². D = 2K/v² es la distancia de máximo acercamiento de frente.
const V = 1;
const D = 1.5;
const K = (D * V * V) / 2;

// Integra una trayectoria desde x = X_FUENTE a la altura y0, con paso adaptativo cerca de los núcleos.
const trayectoria = (y0: number): Pt[] => {
  let x = X_FUENTE;
  let y = y0;
  let vx = V;
  let vy = 0;
  const pts: Pt[] = [[x, y]];
  let recorrido = 0;
  for (let i = 0; i < 200000 && x > -60 && x < 1140 && y > 300 && y < 1100 && recorrido < 1400; i++) {
    let ax = 0;
    let ay = 0;
    let rmin = 1e9;
    for (const [nx, ny] of NUCLEOS) {
      const dx = x - nx;
      const dy = y - ny;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2);
      rmin = Math.min(rmin, r);
      ax += (K * dx) / (r2 * r);
      ay += (K * dy) / (r2 * r);
    }
    const dt = Math.min(2, Math.max(0.002, 0.02 * rmin));
    vx += ax * dt;
    vy += ay * dt;
    const px = x;
    const py = y;
    x += vx * dt;
    y += vy * dt;
    recorrido += Math.hypot(x - px, y - py);
    const [lx, ly] = pts[pts.length - 1];
    if (Math.hypot(x - lx, y - ly) > 3) pts.push([x, y]);
  }
  pts.push([x, y]);
  return pts;
};

// Alturas de entrada: al azar, lejos de los núcleos (pasan entre átomos), y una casi de frente que rebota.
const ALTURAS: number[] = [];
for (let i = 0; ALTURAS.length < 52; i++) {
  const y = 440 + azar(i * 3.7 + 1) * 560;
  if (NUCLEOS.every(([, ny]) => Math.abs(y - ny) > 12)) ALTURAS.push(y);
}
const REBOTE = 26; // índice de la que entra casi de frente
const B_REBOTE = 0.13;
ALTURAS.splice(REBOTE, 0, NUCLEOS[4][1] + B_REBOTE);
const VEL = 520; // px/s en pantalla
const LARGO_RECORRIDO = XL - X_FUENTE;
const LANZA = ALTURAS.map((_, i) => (i === REBOTE ? T_REBOTA - LARGO_RECORRIDO / VEL - 0.15 : T_LANZO + i * 0.19));
const TRAYECTORIAS = ALTURAS.map(trayectoria);
const ACUM = TRAYECTORIAS.map((pts) => {
  const a = [0];
  for (let i = 1; i < pts.length; i++) a.push(a[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return a;
});
// Ángulo con que sale la que rebota, respecto de su dirección de entrada.
const DESVIO = (() => {
  const p = TRAYECTORIAS[REBOTE];
  const [x1, y1] = p[p.length - 1];
  const [x0, y0] = p[p.length - 6];
  return (Math.abs(Math.atan2(y1 - y0, x1 - x0)) * 180) / Math.PI;
})();

// Punto a la distancia s del inicio de la trayectoria i.
const enS = (i: number, s: number): Pt => {
  const pts = TRAYECTORIAS[i];
  const a = ACUM[i];
  if (s >= a[a.length - 1]) return pts[pts.length - 1];
  let lo = 0;
  let hi = a.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (a[m] < s) lo = m;
    else hi = m;
  }
  const f = (s - a[lo]) / Math.max(1e-6, a[hi] - a[lo]);
  return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f];
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kf = eOut(pr(t, T_ORO - 0.6, 0.8));
  ctx.save();
  ctx.fillStyle = rgba("255,200,90", 0.07 * kf);
  ctx.fillRect(XL - 36, 410, 72, 640);
  ctx.restore();
  rotulo(ctx, "Lámina de oro", XL, 395, { a: kf, align: "center", size: 14, rgb: "255,210,120" });
  const kn = eOut(pr(t, T_NUCLEO, 0.6));
  NUCLEOS.forEach(([x, y], i) => {
    ctx.save();
    ctx.strokeStyle = rgba(RGB.hielo, 0.18 * kf);
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.arc(x, y, R_ATOMO, 0, TAU);
    ctx.stroke();
    ctx.restore();
    chispa(ctx, x, y, 2.2, RGB.pos, kf);
    if (i === 4) {
      brillo(ctx, x, y, 90, RGB.pos, 0.5 * kn);
      signo(ctx, x, y, 9, true, kn);
    }
  });
  rotulo(ctx, "Núcleo: diminuto, denso y positivo", XL - 56, NUCLEOS[4][1] - 52, { a: kn, align: "right", size: 14, rgb: RGB.hielo });
  // Fuente de partículas alfa.
  const kd = eOut(pr(t, T_LANZO - 0.4, 0.6));
  ctx.save();
  ctx.fillStyle = rgba(RGB.blanco, 0.1 * kd);
  ctx.strokeStyle = rgba(RGB.blanco, 0.5 * kd);
  ctx.beginPath();
  ctx.roundRect(X_FUENTE - 34, 400, 26, 620, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  rotulo(ctx, "Partículas alfa", X_FUENTE - 34, 380, { a: kd, align: "left", size: 14 });
  // Partículas: cabeza brillante y estela.
  TRAYECTORIAS.forEach((_, i) => {
    const s = (t - LANZA[i]) * VEL;
    const rebote = i === REBOTE;
    if (s <= 0) return;
    const total = ACUM[i][ACUM[i].length - 1];
    if (s > total + 260 && !rebote) return;
    const estela: Pt[] = [];
    for (let u = rebote ? 0 : Math.max(0, s - 240); u <= Math.min(s, total); u += 8) estela.push(enS(i, u));
    linea(ctx, estela, rebote ? RGB.neg : RGB.hielo, rebote ? 0.8 : 0.4, rebote ? 2 : 1.2);
    if (s <= total) {
      const [x, y] = enS(i, s);
      chispa(ctx, x, y, rebote ? 3.2 : 2.2, rebote ? RGB.neg : RGB.hielo, 1);
    }
  });
  hito(ctx, "1911", "Ernest Rutherford", 990, 470, eOut(pr(t, T_1911, 0.7)), "right");
};

const lanzadas = (t: number) => LANZA.filter((a) => t >= a).length;

export const Rutherford: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Una de cada varios miles rebota: *hay un núcleo*" />
      <Hud
        t0={T_LANZO}
        items={[
          { l: "Partículas alfa lanzadas", v: String(lanzadas(t)) },
          { l: "La que rebota sale a", v: num(DESVIO, 0) + "°", azul: true, t: T_REBOTA + 0.4 },
        ]}
      />
    </Escena>
  );
};
