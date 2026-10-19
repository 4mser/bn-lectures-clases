import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { barraLuz, flecha, linea, particulas, puntoP, rotulo, trazar, type Fuente } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, RGB, eIO, eOut, lerp, num, pr, tramo } from "../theme";
import type { Sfx } from "../sfx";

const E = 9;
const T_CRECE = w(E, "crece");
const T_QUEDA = w(E, "queda");
const T_CUALQ = w(E, "cualquier");
export const sfx09: Sfx[] = [
  [E, T_QUEDA, "check"],
  [E, T_CUALQ, "tic"],
];

// Vista de canto: el disco es un segmento que crece hasta salirse del cuadro.
const YP = 870;
const R0 = 260;
const Z0 = 140;
const LARGO = 180; // px por σ/2ε₀
const crecer = (t: number) => eIO(pr(t, T_CRECE - 0.1, 1.9));
// Radio del modelo (hasta millones de px: un plano) y el que se dibuja.
const radioModelo = (t: number) => R0 * Math.pow(10, 4 * crecer(t));
const radioVisto = (t: number) => Math.min(radioModelo(t), 900);
const altura = (t: number) => tramo(t, T_CUALQ - 0.1, 1.4, Z0, 2.5 * Z0);
const campo = (t: number) => 1 - altura(t) / Math.hypot(altura(t), radioModelo(t));

const P_X = 576;
const CAJA: [number, number, number, number] = [-40, 320, 1120, 1060];

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.8));
  const rv = radioVisto(t);
  // Líneas de campo de la sección (cargas a lo largo del segmento), cada 72 px, a ambos lados.
  const fuentes: Fuente[] = Array.from({ length: 48 }, (_, i) => ({ x: 540 + lerp(-rv, rv, (i + 0.5) / 48), y: YP, q: 1 / 48 }));
  let j = 0;
  for (let x = 540 - 36 - 72 * 7; x <= 540 + 36 + 72 * 7; x += 72) {
    if (Math.abs(x - 540) > rv - 8) continue;
    for (const lado of [-1, 1]) {
      const pts = trazar(fuentes, x, YP + lado * 6, 1, 70, 7, CAJA);
      linea(ctx, pts, RGB.hielo, 0.15 * k, 1);
      particulas(ctx, pts, t, 65, 3, RGB.hielo, 0.65 * k, j++ * 2 + 1, 1.4);
    }
  }
  barraLuz(ctx, 540 - rv * k, YP, 540 + rv * k, YP, RGB.pos, k, t, 5);
  rotulo(ctx, "disco visto de canto", 72, YP + 44, { a: k * (1 - crecer(t)), size: 13 });
  rotulo(ctx, "plano visto de canto", 72, YP + 44, { a: crecer(t), size: 13 });
  const z = altura(t);
  const kf = eOut(pr(t, 0.7, 0.6));
  flecha(ctx, P_X, YP - z, P_X, YP - z - campo(t) * LARGO * kf, RGB.azul, kf, 5, 24);
  // Del otro lado, el mismo campo apuntando hacia abajo.
  flecha(ctx, P_X, YP + 60, P_X, YP + 60 + campo(t) * LARGO * 0.4 * kf, RGB.azul, 0.45 * kf, 3, 18);
  puntoP(ctx, P_X, YP - z, eOut(pr(t, 0.5, 0.6)), "P", 20, 8);
};

export const Plano: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const proporcion = radioModelo(t) / altura(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Plano infinito: *el campo no decae*" />
      <Formula tex="E=\frac{\sigma}{2\varepsilon_0}" t0={T_QUEDA} top={930} size={54} />
      <Hud
        t0={T_CRECE}
        items={[
          { l: "Radio / distancia", v: proporcion > 999 ? <Tex tex="\infty" size={50} /> : num(proporcion, 1) },
          { l: "Distancia", v: `×${num(altura(t) / Z0, 2)}` },
          { l: "Campo en P", v: num(campo(t), 3), u: <Tex tex="\sigma/2\varepsilon_0" size={26} color={C.azul} />, azul: true },
        ]}
      />
    </Escena>
  );
};
