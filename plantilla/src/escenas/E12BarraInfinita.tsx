import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { barraLuz, flecha, linea, particulas, puntoP, rotulo, type Pt } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eIO, eOut, lerp, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";
import { P_MED, marcaBeta } from "./E11Mediatriz";

const E = 12;
const T_FIN = w(E, "fin");
const T_NOVENTA = w(E, "noventa");
const T_CAMPO = w(E, "campo");
const T_CAE = w(E, "cae");
export const sfx12: Sfx[] = [
  [E, T_NOVENTA, "golpe"],
  [E, T_CAMPO, "check"],
  [E, T_CAE, "tic"],
];

// Más abajo que en la mediatriz: P sube al alejarse y su flecha no puede tocar el título.
const BARRA = { y: 930 };
const MEDIO0 = 400;
const Y0 = 260;
const UNIDAD = 200; // px de la flecha para la barra infinita a distancia y₀
// Media barra: de 400 px a más de un millón (sin fin) con «fin»; P se aleja a 1,5 y₀ con «cae».
const medio = (t: number) => MEDIO0 * Math.pow(10, 3.5 * eIO(pr(t, T_FIN - 0.2, 1.4)));
const dist = (t: number) => tramo(t, T_CAE - 0.1, 1.3, Y0, 1.5 * Y0);
const beta = (t: number) => Math.atan2(medio(t), dist(t));
// Campo en P relativo al de la barra infinita a distancia y₀ (2kλ/y₀).
const campo = (t: number) => (Math.sin(beta(t)) * Y0) / dist(t);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.15, 0.6));
  const m = Math.min(medio(t), 700);
  const ext = eIO(pr(t, T_FIN, 1.2));
  // Líneas de campo perpendiculares a la barra, más pobladas a medida que se alarga.
  for (let j = -7; j <= 7; j++) {
    const x = 540 + 36 + j * 72;
    if (Math.abs(x - 540) > m - 6) continue;
    for (const lado of [-1, 1]) {
      const pts: Pt[] = [[x, BARRA.y + lado * 6], [x, lado < 0 ? 330 : 1060]];
      linea(ctx, pts, RGB.hielo, (lado < 0 ? 0.13 : 0.08) * k * lerp(0.6, 1, ext), 1);
      particulas(ctx, pts, t, 65, 3, RGB.hielo, 0.55 * k, j * 3 + lado + 40, 1.4);
    }
  }
  barraLuz(ctx, 540 - m, BARRA.y, 540 + m, BARRA.y, RGB.pos, k, t, 5);
  const y = dist(t);
  const py = BARRA.y - y;
  // marcaBeta dibuja desde P_MED: se corre en vertical si P se aleja.
  ctx.save();
  ctx.translate(0, py - P_MED.y);
  marcaBeta(ctx, beta(t), eOut(pr(t, 0.4, 0.6)) * (1 - eIO(pr(t, T_CAE - 0.3, 0.5))), y);
  ctx.restore();
  const kq = eOut(pr(t, 0.5, 0.7));
  flecha(ctx, P_MED.x, py, P_MED.x, py - campo(t) * UNIDAD * kq, RGB.azul, kq, 5, 24);
  // Fantasma: lo que quedaría si cayera como 1/y².
  const kg = eOut(pr(t, T_CAE, 0.6));
  const fantasma = (Y0 / y) * (Y0 / y);
  linea(ctx, [[P_MED.x + 60, py], [P_MED.x + 60, py - fantasma * UNIDAD]], RGB.blanco, 0.45 * kg, 2, [5, 5]);
  rotulo(ctx, "si fuera 1/y²", P_MED.x + 76, py - fantasma * UNIDAD + 6, { a: kg, size: 13 });
  rotulo(ctx, "1/y", P_MED.x - 26, py - campo(t) * UNIDAD + 6, { a: kg, size: 13, align: "right", rgb: RGB.azul });
  puntoP(ctx, P_MED.x, py, eOut(pr(t, 0.3, 0.6)), "P", 22, 18);
};

export const BarraInfinita: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Barra infinita: *el campo cae como 1/y*" />
      <Formula tex="E=\frac{2k\lambda}{y}=\frac{\lambda}{2\pi\varepsilon_0\,y}" t0={T_CAMPO} top={968} size={42} />
      <Hud
        t0={0.6}
        top={1100}
        items={[
          { l: "Semiángulo", v: `${num((beta(t) * 180) / Math.PI, 1)}°` },
          { l: "Distancia", v: `×${num(dist(t) / Y0, 2)}` },
          { l: "Campo en P", v: num(campo(t), 3), u: <Tex tex="2k\lambda/y_0" size={26} color={C.azul} />, azul: true },
        ]}
      />
    </Escena>
  );
};
