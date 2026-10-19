import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { brillo, rgba, rotulo } from "../lab/luz";
import { hito, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 4;
const T_1750 = w(E, "cincuenta");
const T_FLUIDO = w(E, "fluido");
const T_EXCESO = w(E, "exceso");
const T_DEFECTO = w(E, "defecto");
const T_PASA = w(E, "pasa");
const T_TOTAL = w(E, "total");
export const sfx04: Sfx[] = [
  [E, T_1750, "tic"],
  [E, T_EXCESO, "tic"],
  [E, T_DEFECTO, "tic"],
  [E, T_TOTAL, "check"],
];

const N = 8; // pares + y − en cada cuerpo neutro
const PASAN = 5; // cargas negativas que pasan del vidrio al paño
const VIDRIO = { x: 330, y: 770, w: 330, h: 60 };
const PANO = { x: 780, y: 770, w: 230, h: 170 };

// Posiciones de las cargas dentro de cada cuerpo.
const enVidrio = (i: number, neg: boolean): [number, number] => [VIDRIO.x - VIDRIO.w / 2 + 26 + i * 40, VIDRIO.y + (neg ? 14 : -14)];
const enPano = (i: number, neg: boolean, dx: number): [number, number] => {
  // Pares + − en dos filas de cuatro; las negativas que llegan ocupan las filas de abajo.
  const col = i % 4;
  const fila = Math.floor(i / 4);
  return [PANO.x + dx - 78 + col * 52 + (neg ? 13 : -13) * (i < N ? 1 : 0), PANO.y - 52 + fila * 34];
};

// Cuántas cargas negativas ya pasaron en el instante t (y la fracción del viaje de cada una).
const viaje = (j: number, t: number) => eIO(pr(t, T_FLUIDO + j * 0.28, 0.55));
const pasadas = (t: number) => Array.from({ length: PASAN }, (_, j) => viaje(j, t)).filter((v) => v >= 0.5).length;
const conSigno = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  // El paño se acerca al vidrio para frotarlo y luego se aleja.
  const cerca = eIO(pr(t, T_FLUIDO - 0.6, 0.5)) * (1 - eIO(pr(t, T_DEFECTO + 0.5, 0.6)));
  const dx = -150 * cerca + Math.sin(t * 12) * 14 * cerca;
  // Vidrio.
  ctx.save();
  ctx.fillStyle = rgba(RGB.hielo, 0.12 * k);
  ctx.strokeStyle = rgba(RGB.hielo, 0.7 * k);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(VIDRIO.x - VIDRIO.w / 2, VIDRIO.y - VIDRIO.h / 2, VIDRIO.w, VIDRIO.h, 30);
  ctx.fill();
  ctx.stroke();
  // Paño.
  ctx.fillStyle = rgba("190,180,170", 0.14 * k);
  ctx.strokeStyle = rgba("210,200,190", 0.6 * k);
  ctx.beginPath();
  ctx.roundRect(PANO.x + dx - PANO.w / 2, PANO.y - PANO.h / 2, PANO.w, PANO.h, 18);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  rotulo(ctx, "Vidrio", VIDRIO.x, VIDRIO.y + 70, { a: k, align: "center", size: 15 });
  rotulo(ctx, "Paño", PANO.x + dx, PANO.y + 112, { a: k, align: "center", size: 15 });

  for (let i = 0; i < N; i++) {
    const [px, py] = enVidrio(i, false);
    signo(ctx, px, py, 9, true, k);
    const [qx, qy] = enPano(i, false, dx);
    signo(ctx, qx, qy, 9, true, k);
    const [rx, ry] = enPano(i, true, dx);
    signo(ctx, rx, ry, 9, false, k);
  }
  // Negativas del vidrio: las primeras PASAN viajan al paño en un arco.
  for (let i = 0; i < N; i++) {
    const [x0, y0] = enVidrio(N - 1 - i, true);
    if (i >= PASAN) {
      signo(ctx, x0, y0, 9, false, k);
      continue;
    }
    const v = viaje(i, t);
    const destino = enPano(N + i, true, dx);
    const x = lerp(x0, destino[0], v);
    const y = lerp(y0, destino[1], v) - Math.sin(v * Math.PI) * 90;
    signo(ctx, x, y, 9, false, k);
    if (v > 0 && v < 1) brillo(ctx, x, y, 40, RGB.neg, 0.4);
  }
  // Exceso y defecto.
  const ke = eOut(pr(t, T_EXCESO, 0.6));
  const kd = eOut(pr(t, T_DEFECTO, 0.6));
  rotulo(ctx, "Defecto · positivo", VIDRIO.x, VIDRIO.y - 74, { a: kd, align: "center", size: 15, rgb: RGB.hielo });
  rotulo(ctx, "Exceso · negativo", PANO.x + dx, PANO.y - 118, { a: ke, align: "center", size: 15, rgb: RGB.neg });
  hito(ctx, "~1750", "Benjamin Franklin", 540, 470, eOut(pr(t, T_1750, 0.7)), "center");
};

export const Franklin: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  // Carga neta = positivas − negativas de cada cuerpo, contadas en la simulación.
  const n = pasadas(t);
  const vidrio = N - (N - n);
  const pano = N - (N + n);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Un solo fluido, dos signos: *la carga se conserva*" />
      <Hud
        t0={T_FLUIDO}
        items={[
          { l: "Vidrio", v: conSigno(vidrio) },
          { l: "Paño", v: conSigno(pano), t: T_FLUIDO + 0.12 },
          { l: "Carga total", v: conSigno(vidrio + pano), azul: true, t: T_PASA },
        ]}
      />
    </Escena>
  );
};
