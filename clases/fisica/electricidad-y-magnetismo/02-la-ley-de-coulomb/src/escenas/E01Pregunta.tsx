import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza } from "../lab/cargas";
import { linea, rotulo } from "../lab/luz";
import { texto } from "../fisica";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 1;
const T_REP = w(E, "repelen");
const T_CUANTO = w(E, "cuanto");
const T_NUM = w(E, "numero");
const T_ANIO = w(E, "mil");
export const sfx01: Sfx[] = [
  [E, T_REP, "tic"],
  [E, T_CUANTO, "alerta"],
  [E, T_ANIO + 0.4, "golpe"],
];

const A = { x: 330, y: 720 };
const B = { x: 750, y: 720 };

// Signo de la carga de la derecha: negativa (se atraen) y, con «repelen», positiva.
const signo = (t: number) => lerp(-1, 1, eIO(pr(t, T_REP - 0.1, 0.7)));
// Largo de las flechas: fijo mientras solo importa el sentido; con «cuánto», titubea.
const largo = (t: number) => {
  const k = eOut(pr(t, T_CUANTO, 0.6));
  return 110 * (1 + k * 0.5 * Math.sin(t * 3.1) * Math.sin(t * 1.7 + 0.6));
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  const s = signo(t);
  linea(ctx, [[A.x, A.y], [B.x, B.y]], RGB.blanco, 0.14 * k, 1, [4, 7]);
  cargaQ(ctx, A.x, A.y, 13, 1, k, t);
  cargaQ(ctx, B.x, B.y, 13, s, k, t);
  const L = largo(t) * s;
  fuerza(ctx, B.x, B.y, 1, 0, L, RGB.hielo, k);
  fuerza(ctx, A.x, A.y, -1, 0, L, RGB.hielo, k);
  rotulo(ctx, "se atraen", (A.x + B.x) / 2, A.y - 70, { a: k * eOut(pr(-s, 0, 0.4)), align: "center" });
  rotulo(ctx, "se repelen", (A.x + B.x) / 2, A.y - 70, { a: eOut(pr(s, 0, 0.4)), align: "center" });
  // Con «cuánto»: signos de pregunta sobre las flechas.
  const kq = eOut(pr(t, T_CUANTO, 0.6));
  for (const [x, dir] of [[B.x, 1], [A.x, -1]] as const) {
    texto(ctx, "?", x + dir * (22 + Math.abs(L) / 2), A.y - 58, { size: 62, peso: 500, rgb: RGB.azul, a: kq * (0.75 + 0.25 * Math.sin(t * 4)), align: "center" });
  }
};

export const Pregunta: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Se atraen o se repelen. *¿Con cuánta fuerza?*" />
      <Hud
        t0={T_NUM}
        items={[
          { l: "Fuerza entre ellas", v: "?", u: "N", t: T_NUM },
          { l: "Medida por Coulomb", v: "1785", azul: true, t: T_ANIO + 0.3 },
        ]}
      />
    </Escena>
  );
};
