import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { TAU, angulo, linea, rgba, rotulo, variable } from "../lab/luz";
import { esfera, hito, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 6;
const T_CAV = w(E, "cavendish");
const T_PUBLICO = w(E, "publicó");
const T_1785 = w(E, "cinco");
const T_TORSION = w(E, "torsión");
const T_MITAD = w(E, "mitad");
const T_CUATRO = w(E, "cuatro");
export const sfx06: Sfx[] = [
  [E, T_CAV, "tic"],
  [E, T_1785, "tic"],
  [E, T_MITAD, "tic"],
  [E, T_CUATRO, "golpe"],
];

// Balanza de torsión vista desde arriba: la fibra en el centro, la varilla gira θ desde la marca cero.
// El giro de la fibra es proporcional a la fuerza; con distancia d entre las esferas, θ = θ₀ (d₀/d)².
const C0 = { x: 540, y: 765 };
const R = 225;
const RAD = Math.PI / 180;
const A0 = -40 * RAD; // dirección de la marca cero (sentido del lienzo)
const D0 = 180;
const TH0 = 5 * RAD;

const distancia = (t: number) => lerp(D0, D0 / 2, eIO(pr(t, T_MITAD - 0.2, 1.3)));
const giro = (d: number) => TH0 * (D0 / d) ** 2;
// La esfera fija queda a un ángulo α al otro lado de la marca cero, tal que la cuerda entre ambas mida d.
const alfa = (d: number) => 2 * Math.asin(d / (2 * R)) - giro(d);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  // Cavendish: esferas concéntricas, que se apagan cuando entra Coulomb.
  const kc = eOut(pr(t, 0.2, 0.7)) * (1 - eIO(pr(t, T_1785 - 0.8, 0.6)));
  esfera(ctx, C0.x, C0.y, 180, RGB.pos, kc * 0.7);
  esfera(ctx, C0.x, C0.y, 105, RGB.pos, kc);
  rotulo(ctx, "Esferas concéntricas", C0.x, C0.y + 215, { a: kc, align: "center", size: 14 });
  rotulo(ctx, "Inédito hasta 1879", 90, 505, { a: eOut(pr(t, T_PUBLICO, 0.6)) * kc, align: "left", size: 14, rgb: RGB.neg });

  const kb = eOut(pr(t, T_1785 - 0.3, 0.9));
  if (kb > 0.01) {
    // Escala graduada.
    ctx.save();
    ctx.strokeStyle = rgba(RGB.hielo, 0.35 * kb);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(C0.x, C0.y, R + 34, 0, TAU);
    ctx.stroke();
    ctx.restore();
    for (let g = 0; g < 72; g++) {
      const u = A0 + g * 5 * RAD;
      const l = g % 2 ? 8 : 16;
      linea(ctx, [[C0.x + Math.cos(u) * (R + 34), C0.y + Math.sin(u) * (R + 34)], [C0.x + Math.cos(u) * (R + 34 - l), C0.y + Math.sin(u) * (R + 34 - l)]], RGB.hielo, (g === 0 ? 0.9 : 0.4) * kb, g === 0 ? 2 : 1);
    }
    const d = distancia(t);
    const th = giro(d);
    const al = alfa(d);
    const am = A0 + th; // varilla
    const af = A0 - al; // esfera fija
    // Varilla con su contrapeso y la esfera móvil.
    const mx = C0.x + Math.cos(am) * R;
    const my = C0.y + Math.sin(am) * R;
    linea(ctx, [[C0.x - Math.cos(am) * R, C0.y - Math.sin(am) * R], [mx, my]], RGB.blanco, 0.7 * kb, 2.5);
    esfera(ctx, C0.x - Math.cos(am) * R, C0.y - Math.sin(am) * R, 16, RGB.blanco, 0.6 * kb);
    ctx.fillStyle = rgba(RGB.blanco, kb);
    ctx.beginPath();
    ctx.arc(C0.x, C0.y, 6, 0, TAU);
    ctx.fill();
    rotulo(ctx, "Fibra", C0.x, C0.y + 30, { a: kb, align: "center", size: 13 });
    // Esferas cargadas.
    const fx = C0.x + Math.cos(af) * R;
    const fy = C0.y + Math.sin(af) * R;
    esfera(ctx, mx, my, 22, RGB.pos, kb);
    signo(ctx, mx, my, 8, true, kb);
    esfera(ctx, fx, fy, 22, RGB.pos, kb);
    signo(ctx, fx, fy, 8, true, kb);
    // Distancia d y ángulo de giro θ.
    linea(ctx, [[mx, my], [fx, fy]], RGB.blanco, 0.45 * kb, 1.2, [4, 6]);
    const nx = (mx + fx) / 2 + Math.cos((am + af) / 2) * 34;
    const ny = (my + fy) / 2 + Math.sin((am + af) / 2) * 34;
    variable(ctx, "d", "", nx, ny, 28, RGB.blanco, kb, "center");
    angulo(ctx, C0.x, C0.y, 120, A0, am, RGB.azul, kb, 2.5);
    linea(ctx, [[C0.x, C0.y], [C0.x + Math.cos(A0) * (R + 30), C0.y + Math.sin(A0) * (R + 30)]], RGB.hielo, 0.3 * kb, 1, [3, 6]);
    variable(ctx, "θ", "", C0.x + Math.cos(A0 + th / 2) * 150, C0.y + Math.sin(A0 + th / 2) * 150, 28, RGB.azul, kb, "center");
    rotulo(ctx, "Balanza de torsión", 990, 455, { a: eOut(pr(t, T_TORSION, 0.6)), align: "right", size: 14 });
  }
  hito(ctx, "1771–1773", "Henry Cavendish", 90, 455, eOut(pr(t, T_CAV, 0.6)) * (1 - eIO(pr(t, T_1785 - 0.8, 0.6))), "left");
  hito(ctx, "1785", "Charles-Augustin de Coulomb", 90, 455, eOut(pr(t, T_1785, 0.7)), "left");
};

export const Coulomb: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const d = distancia(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="A la mitad de distancia, *cuatro veces la fuerza*" />
      <Hud
        t0={T_TORSION}
        items={[
          { l: "Distancia", v: num(d / D0), u: "× la inicial" },
          { l: "Fuerza · giro de la fibra", v: num(giro(d) / TH0), u: "× la inicial", azul: true, t: T_TORSION + 0.15 },
        ]}
      />
    </Escena>
  );
};
