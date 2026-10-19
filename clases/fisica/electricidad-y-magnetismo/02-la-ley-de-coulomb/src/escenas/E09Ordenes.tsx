import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { cargaQ, fuerza } from "../lab/cargas";
import { brillo, chispa, linea } from "../lab/luz";
import { Cien, E_CARGA, G, K, M_E, M_P, cienCtx, texto } from "../fisica";
import { INFO, w } from "../linea";
import { RGB, cl, eIO, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 9;
const T_PROTON = w(E, "proton");
const T_COMO = w(E, "como");
const T_RAZON = w(E, "razon");
const T_ELEC = w(E, "electrica");
const T_ORD = w(E, "ordenes");
export const sfx09: Sfx[] = [
  [E, T_PROTON, "tic"],
  [E, T_RAZON, "check"],
  [E, T_ELEC, "tic"],
  [E, T_ORD + 0.2, "golpe"],
];

// Átomo de hidrógeno (Ejemplo 2 de los apuntes): protón y electrón a 5,3 × 10⁻¹¹ m.
const R_H = 5.3e-11;
const fe = (r: number) => (K * E_CARGA * E_CARGA) / (r * r);
const fg = (r: number) => (G * M_P * M_E) / (r * r);
const RAZON = fe(R_H) / fg(R_H);
const ORDENES = Math.log10(RAZON);

// Mientras dice que la razón no depende de la distancia, el electrón se acerca y se aleja.
const factor = (t: number) => {
  const env = eOut(pr(t, T_COMO, 0.6)) * (1 - eIO(pr(t, T_ELEC - 0.9, 0.7)));
  return Math.pow(2, 0.75 * Math.sin((t - T_COMO) * 1.7) * env);
};
// Cuánto de la distancia entre las dos fuerzas ya recorrió la barra que sube.
const sube = (t: number) => eIO(pr(t, T_ELEC, T_ORD + 0.3 - T_ELEC));

// Escala logarítmica vertical de fuerzas, de 10⁻⁵⁰ N a 10⁻⁴ N.
const X = 230;
const Y0 = 1030;
const EMIN = -50;
const EMAX = -4;
const S = 12; // px por década
const yDe = (f: number) => Y0 - (Math.log10(f) - EMIN) * S;

const P = { x: 640, y: 720 };
const DIST = 190; // px para la distancia de Bohr

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  const f = factor(t);
  const r = R_H * f;
  // Átomo.
  const ka = eOut(pr(t, T_PROTON - 0.2, 0.7));
  const ex = P.x + DIST * f;
  linea(ctx, [[P.x, P.y], [ex, P.y]], RGB.blanco, 0.2 * ka, 1, [4, 6]);
  cargaQ(ctx, P.x, P.y, 13, 1, ka, t);
  cargaQ(ctx, ex, P.y, 9, -1, ka, t);
  fuerza(ctx, P.x, P.y, 1, 0, 60 * ka, RGB.hielo, ka, 22, 2.6, 14);
  fuerza(ctx, ex, P.y, -1, 0, 60 * ka, RGB.hielo, ka, 18, 2.6, 14);
  texto(ctx, "protón", P.x, P.y - 66, { size: 22, a: ka * 0.75, align: "center" });
  texto(ctx, "electrón", ex, P.y - 66, { size: 22, a: ka * 0.75, align: "center" });
  cienCtx(ctx, r, (P.x + ex) / 2, P.y + 92, { size: 24, a: ka * 0.85, align: "center", antes: "r = ", despues: " m" });

  // Escala.
  linea(ctx, [[X, yDe(Math.pow(10, EMIN))], [X, yDe(Math.pow(10, EMAX))]], RGB.blanco, 0.35 * k, 1.2);
  const lFe = Math.log10(fe(r));
  const lFg = Math.log10(fg(r));
  const p = sube(t);
  const tope = lerp(lFg, lFe, p);
  for (let e = EMIN; e <= EMAX; e++) {
    const y = Y0 - (e - EMIN) * S;
    const encendida = p > 0 && e >= lFg && e <= tope;
    const largo = e % 5 === 0 ? 18 : 9;
    linea(ctx, [[X - largo, y], [X, y]], encendida ? RGB.azul : RGB.blanco, (encendida ? 0.95 : 0.3) * k, encendida ? 2 : 1);
    if (e % 10 === 0) cienCtx(ctx, Math.pow(10, e), X - 28, y, { size: 22, a: 0.55 * k, align: "right", pot: true });
  }
  texto(ctx, "N", X - 28, yDe(Math.pow(10, EMAX)) - 26, { size: 20, a: 0.5 * k, align: "right" });
  // Barra que sube de la gravitatoria a la eléctrica, una década por vez.
  if (p > 0) {
    linea(ctx, [[X, Y0 - (lFg - EMIN) * S], [X, Y0 - (tope - EMIN) * S]], RGB.azul, 0.25, 12);
    linea(ctx, [[X, Y0 - (lFg - EMIN) * S], [X, Y0 - (tope - EMIN) * S]], RGB.azul, 0.95, 3);
    brillo(ctx, X, Y0 - (tope - EMIN) * S, 40, RGB.azul, 0.5);
  }
  // Marcas de cada fuerza, con su valor.
  const km = eOut(pr(t, T_PROTON + 0.4, 0.7));
  for (const [l, nombre, v, azul] of [[lFe, "Eléctrica", fe(r), true], [lFg, "Gravitatoria", fg(r), false]] as const) {
    const y = Y0 - (l - EMIN) * S;
    const rgb = azul ? RGB.azul : RGB.blanco;
    chispa(ctx, X, y, 4.5, rgb, km);
    linea(ctx, [[X + 10, y], [X + 46, y]], rgb, 0.7 * km, 1.4);
    texto(ctx, nombre, X + 58, y - 18, { size: 24, a: 0.75 * km, rgb });
    cienCtx(ctx, v, X + 58, y + 18, { size: 32, a: km, rgb, despues: " N", peso: 500 });
  }
  void cl;
};

export const Ordenes: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Eléctrica contra gravedad: *39 órdenes de magnitud*" />
      <Hud
        t0={T_RAZON}
        items={[
          { l: "Eléctrica ÷ gravitatoria", v: <Cien v={RAZON} d={2} />, t: T_RAZON },
          { l: "Órdenes de magnitud", v: String(Math.floor(ORDENES * sube(t))), azul: true, t: T_ELEC },
        ]}
      />
    </Escena>
  );
};
