import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { carga, chispa, linea, rotulo, type Pt } from "../lab/luz";
import { PL, camino, placas, rastro } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 5;
const T_UNIF = w(E, "uniforme");
const T_ACEL = w(E, "acelerado");
const NUMEROS = ["uno", "cuatro", "nueve", "dieciseis"].map((p) => w(E, p));
const T_PARAB = w(E, "parabola");
export const sfx05: Sfx[] = [...NUMEROS.map((t): Sfx => [E, t, "tic"]), [E, T_PARAB, "check"]];

// Carga positiva lanzada en horizontal; el campo apunta hacia abajo. Cuatro intervalos iguales de tiempo.
const X0 = 210;
const Y0 = PL.y0 + 50;
const DS = 0.85; // s de animación por intervalo
const N = 4;
const VX = 175 / DS;
const AY = (2 * 24) / (DS * DS); // caída del primer intervalo: 24 px
const T_LANZA = 0.9;
const pos = (s: number): Pt => [X0 + VX * s, Y0 + 0.5 * AY * s * s];
const MARCAS: Pt[] = Array.from({ length: N }, (_, k) => pos((k + 1) * DS));
const REGLA_Y = 160;
const REGLA_X = PL.y0 + 26;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const ka = eOut(pr(t, 0.1, 0.9));
  placas(ctx, t, PL, ka, { kl: 0.6 });
  const s = Math.min(N * DS, Math.max(0, t - T_LANZA));
  const kp = eOut(pr(t, T_PARAB, 0.8));
  rastro(ctx, camino(X0, Y0, VX, 0, 0, AY, s, 80), kp > 0 ? RGB.azul : RGB.pos, 0.7 + 0.3 * kp, 2 + kp);
  // Reglas: arriba, la posición x de cada marca; a la izquierda, su caída y.
  const kx = eOut(pr(t, T_UNIF - 0.4, 0.6));
  const ky = eOut(pr(t, T_ACEL - 0.4, 0.6));
  linea(ctx, [[X0, REGLA_X], [MARCAS[N - 1][0], REGLA_X]], RGB.blanco, 0.3 * kx, 1);
  linea(ctx, [[REGLA_Y, Y0], [REGLA_Y, MARCAS[N - 1][1]]], RGB.blanco, 0.3 * ky, 1);
  chispa(ctx, X0, Y0, 3, RGB.blanco, ka);
  MARCAS.forEach(([x, y], k) => {
    const visto = t >= T_LANZA + (k + 1) * DS;
    if (!visto) return;
    chispa(ctx, x, y, 4, RGB.blanco, 1);
    linea(ctx, [[x, y], [x, REGLA_X]], RGB.blanco, 0.18 * kx, 1, [3, 6]);
    linea(ctx, [[REGLA_Y - 8, REGLA_X], [REGLA_Y, REGLA_X]], RGB.blanco, 0, 1);
    linea(ctx, [[x, REGLA_X - 7], [x, REGLA_X + 7]], RGB.blanco, 0.7 * kx, 1.5);
    linea(ctx, [[x, y], [REGLA_Y, y]], RGB.blanco, 0.18 * ky, 1, [3, 6]);
    linea(ctx, [[REGLA_Y - 7, y], [REGLA_Y + 7, y]], RGB.blanco, 0.7 * ky, 1.5);
    // Caída acumulada relativa a la del primer intervalo: 1, 4, 9, 16.
    const kn = eOut(pr(t, NUMEROS[k] - 0.1, 0.4));
    rotulo(ctx, num((y - Y0) / (MARCAS[0][1] - Y0), 0), REGLA_Y - 14, y, { a: kn, size: 16, align: "right", rgb: RGB.azul });
    rotulo(ctx, String(k + 1), x, REGLA_X + 22, { a: kx, size: 13, align: "center" });
  });
  const [x, y] = pos(s);
  carga(ctx, x, y, 11, RGB.pos, ka, t);
};

export const Parabola: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const vistos = MARCAS.filter((_, k) => t >= T_LANZA + (k + 1) * DS);
  const avances = vistos.map(([x], k) => num((x - (k ? vistos[k - 1][0] : X0)) / (MARCAS[0][0] - X0), 0));
  const caidas = vistos.filter((_, k) => t >= NUMEROS[k] - 0.1).map(([, y]) => num((y - Y0) / (MARCAS[0][1] - Y0), 0));
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Uniforme en x, acelerado en y: *una parábola*" />
      <Formula tex="y=\frac{a_y}{2v_0^{2}}\,x^{2}" t0={T_PARAB - 0.3} top={975} size={46} />
      <Hud
        t0={T_UNIF}
        items={[
          { l: "Avance por intervalo", v: avances.join(" · ") || "—" },
          { l: "Caída acumulada", v: caidas.join(" · ") || "—", azul: true, t: T_ACEL },
        ]}
      />
    </Escena>
  );
};
