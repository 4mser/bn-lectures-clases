import React from "react";
import { Cabeza, Escena, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { brillo, carga, flecha, linea, rgba, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";
import { LineaTiempo } from "./Linea";

const E = 0;
const T_NEWTON = w(E, "Newton");
const T_ABSURDO = w(E, "absurdo");
const T_VACIO = w(E, "vacío");
const T_COULOMB = w(E, "Coulomb");
export const sfx00: Sfx[] = [
  [E, T_NEWTON, "tic"],
  [E, T_ABSURDO, "alerta"],
  [E, T_COULOMB, "golpe"],
];

const A = { x: 250, y: 680 };
const B = { x: 830, y: 680 };

// Dos cuerpos que se atraen a través del vacío; con «Coulomb» se vuelven dos cargas de signos opuestos.
const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 1));
  const kc = eIO(pr(t, T_COULOMB - 0.2, 0.9)); // de masas a cargas
  // Masas: esferas grises con brillo tenue.
  const masa = (x: number, y: number, r: number, a: number) => {
    if (a <= 0.01) return;
    brillo(ctx, x, y, r * 3.2, RGB.blanco, 0.12 * a);
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, rgba("230,234,242", a));
    g.addColorStop(1, rgba("70,76,92", a));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  masa(A.x, A.y, 46, k * (1 - kc));
  masa(B.x, B.y, 30, k * (1 - kc));
  carga(ctx, A.x, A.y, 14, RGB.pos, kc, t);
  carga(ctx, B.x, B.y, 14, RGB.neg, kc, t);
  variable(ctx, "M", "", A.x, A.y - 92, 34, RGB.blanco, k * (1 - kc), "center");
  variable(ctx, "m", "", B.x, B.y - 92, 34, RGB.blanco, k * (1 - kc), "center");
  variable(ctx, "+q", "", A.x, A.y - 92, 34, RGB.blanco, kc, "center");
  variable(ctx, "−q", "", B.x, B.y - 92, 34, RGB.blanco, kc, "center");

  // Fuerzas: cada cuerpo tira del otro, sin nada en medio.
  const kf = eOut(pr(t, T_NEWTON + 0.3, 0.8));
  const largo = 130 * kf;
  const rgbF = kc > 0.5 ? RGB.azul : RGB.hielo;
  flecha(ctx, A.x + 60, A.y, A.x + 60 + largo, A.y, rgbF, kf, 3.5, 20);
  flecha(ctx, B.x - 50, B.y, B.x - 50 - largo, B.y, rgbF, kf, 3.5, 20);

  // El vacío entre ambos: un tramo punteado que late y una pregunta.
  const kv = eOut(pr(t, T_ABSURDO - 0.2, 0.8));
  const late = 0.6 + 0.4 * Math.sin(t * 3);
  linea(ctx, [[A.x + 200, A.y], [B.x - 190, B.y]], RGB.blanco, 0.35 * kv * late, 1.2, [3, 9]);
  ctx.save();
  ctx.font = `300 ${lerp(60, 92, kv)}px "Space Grotesk"`;
  ctx.fillStyle = rgba(RGB.blanco, 0.85 * kv);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", (A.x + B.x) / 2, A.y - 70);
  ctx.restore();
  rotulo(ctx, "vacío", (A.x + B.x) / 2, A.y + 60, { a: eOut(pr(t, T_VACIO - 0.2, 0.7)), align: "center" });
  rotulo(ctx, "acción instantánea a distancia", (A.x + B.x) / 2, A.y + 190, { a: eOut(pr(t, T_COULOMB, 0.8)), align: "center", size: 14 });
};

export const Distancia: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Newton no creía en la *acción a distancia*" />
      <LineaTiempo activo={0} t0={T_NEWTON - 0.6} />
    </Escena>
  );
};
