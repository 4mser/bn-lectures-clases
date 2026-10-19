import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula, Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { trazoDensidad } from "../lab/densidad";
import { INFO, w } from "../linea";
import { C, eIO, eOut, num, pr, lerp } from "../theme";
import type { Sfx } from "../sfx";
import { A, B, campo1, carga1 } from "../fisica";
import { camino, densidad, ejes, flechaCampo } from "./barra";

const E = 6;
const T_ACERCA = w(E, "acerca");
const T_CERO = w(E, "cero");
const T_CARGA = w(E, "carga");
export const sfx06: Sfx[] = [
  [E, T_ACERCA, "tic"],
  [E, T_CERO, "check"],
  [E, T_CARGA, "tic"],
];

// b se acerca a a (hasta 0,5 % de a) y vuelve a 0,30 m cuando la voz pasa a la carga total.
const BMIN = A * 1.005;
const b = (t: number) => lerp(B, BMIN, eIO(pr(t, T_ACERCA, T_CERO - T_ACERCA + 0.2))) + (B - BMIN) * eIO(pr(t, T_CARGA - 0.3, 1.0));

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.6));
  const bb = b(t);
  ejes(ctx, k, bb);
  // La densidad sigue siendo αx: el tramo que queda conserva su brillo.
  const d = densidad(A, bb);
  trazoDensidad(ctx, camino(A, bb), d, k, t, { grosor: 8, n: Math.max(4, Math.round(90 * ((bb - A) / (B - A)))) });
  flechaCampo(ctx, campo1(A, bb), k);
};

export const BarraRevisar: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const bb = b(t);
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Revisar: si b tiende a a, *el campo se apaga*" />
      <Formula tex="Q=\int_a^b \alpha x\,dx=\frac{\alpha}{2}\left(b^{2}-a^{2}\right)" t0={T_CARGA} top={900} size={48} />
      <Hud
        t0={0.6}
        items={[
          { l: "b", v: num(bb, 3), u: "m" },
          { l: "Campo en P", v: num(campo1(A, bb), 1), u: "N/C", azul: true },
          { l: "Carga total", v: num(carga1(A, bb) * 1e9, 2), u: <Tex tex="\text{nC}" size={24} color={C.texto2} />, t: T_CARGA + 0.2 },
        ]}
      />
    </Escena>
  );
};
