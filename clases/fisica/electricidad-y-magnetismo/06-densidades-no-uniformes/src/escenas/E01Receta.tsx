import React, { useContext } from "react";
import { Cabeza, EnColumna, Escena, Mono, aparece, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { angulo, barraLuz, brillo, chispa, flecha, linea, puntoP, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, MARGEN, RGB, SANS, eIO, eOut, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 1;
// Los siete pasos de la receta (§2), cada uno anclado a la palabra con que la voz lo nombra.
const PASOS: [string, number][] = [
  ["Dibujar y fijar P", w(E, "fijar")],
  ["Escribir dq", w(E, "escribir")],
  ["Construir la geometría", w(E, "armar")],
  ["Aplicar Coulomb", w(E, "aplicar")],
  ["Usar la simetría, si existe", w(E, "usar")],
  ["Integrar sobre toda la carga", w(E, "integrar")],
  ["Revisar el resultado", w(E, "revisar")],
];
const T = PASOS.map(([, t]) => t);
export const sfx01: Sfx[] = T.map((t): Sfx => [E, t, "tic"]);

// Figura 2.2 de los apuntes: fuente sobre el eje x, P = (0, y), β medido desde la vertical descendente.
const O = { x: 440, y: 830 };
const P = { x: O.x, y: 550 };
const DQ = { x: 720, y: O.y };
const MEDIO = 320; // media barra
const r = Math.hypot(DQ.x - P.x, DQ.y - P.y);
const ux = (P.x - DQ.x) / r;
const uy = (P.y - DQ.y) / r;
const LARGO = 170;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k1 = eOut(pr(t, T[0] - 0.2, 0.6));
  linea(ctx, [[60, O.y], [1010, O.y]], RGB.blanco, 0.28 * k1, 1);
  flecha(ctx, 1000, O.y, 1024, O.y, RGB.blanco, 0.4 * k1, 1, 10);
  linea(ctx, [[O.x, O.y + 60], [O.x, 390]], RGB.blanco, 0.28 * k1, 1);
  flecha(ctx, O.x, 400, O.x, 376, RGB.blanco, 0.4 * k1, 1, 10);
  variable(ctx, "x", "", 1012, O.y + 30, 28, RGB.blanco, 0.8 * k1, "center");
  variable(ctx, "y", "", O.x - 28, 382, 28, RGB.blanco, 0.8 * k1, "center");
  variable(ctx, "O", "", O.x - 26, O.y + 28, 26, RGB.blanco, 0.7 * k1, "center");

  // La barra: tenue hasta «integrar», encendida después.
  const kb = eOut(pr(t, T[1] - 0.2, 0.6));
  const ki = eOut(pr(t, T[5], 0.8));
  barraLuz(ctx, O.x - MEDIO, O.y, O.x + MEDIO, O.y, RGB.pos, kb * (0.3 + 0.7 * ki), t, 4);

  // Paso 2: el elemento dq con su dx.
  const k2 = eOut(pr(t, T[1], 0.6)) * (1 - 0.6 * ki);
  linea(ctx, [[DQ.x - 14, O.y], [DQ.x + 14, O.y]], "250,252,255", k2, 8);
  brillo(ctx, DQ.x, O.y, 44, RGB.blanco, 0.4 * k2);
  variable(ctx, "dq", "", DQ.x, O.y + 44, 30, RGB.blanco, k2, "center");

  // Paso 3: r y β.
  const k3 = eOut(pr(t, T[2], 0.6)) * (1 - 0.6 * ki);
  linea(ctx, [[DQ.x, DQ.y], [P.x, P.y]], RGB.blanco, 0.45 * k3, 1.2, [4, 6]);
  variable(ctx, "r", "", (DQ.x + P.x) / 2 + 22, (DQ.y + P.y) / 2 + 12, 30, RGB.blanco, k3, "center");
  const aEl = Math.atan2(DQ.y - P.y, DQ.x - P.x);
  angulo(ctx, P.x, P.y, 58, aEl, Math.PI / 2, RGB.blanco, 0.6 * k3);
  variable(ctx, "β", "", P.x + 76 * Math.cos((aEl + Math.PI / 2) / 2), P.y + 76 * Math.sin((aEl + Math.PI / 2) / 2), 28, RGB.blanco, k3, "center");

  // Paso 4: dE en P, alejándose del elemento, con sus componentes.
  const k4 = eOut(pr(t, T[3], 0.6)) * (1 - 0.7 * ki);
  const ex = ux * LARGO;
  const ey = uy * LARGO;
  flecha(ctx, P.x, P.y, P.x + ex, P.y + ey, RGB.hielo, k4, 2.4, 15);
  variable(ctx, "dE", "", P.x + ex - 40, P.y + ey - 10, 28, RGB.blanco, k4, "center");
  const k5 = eOut(pr(t, T[4], 0.6));
  const kx = eIO(pr(t, T[4] + 0.9, 0.7));
  flecha(ctx, P.x, P.y, P.x + ex, P.y, RGB.neg, k4 * 0.9 * (1 - kx), 1.8, 12, [5, 5]);
  flecha(ctx, P.x, P.y, P.x, P.y + ey, RGB.hielo, k4 * 0.9, 1.8, 12, [5, 5]);

  // Paso 5: el elemento simétrico y su aporte: las componentes en x se cancelan.
  const kq = k5 * (1 - 0.6 * ki);
  const DX2 = 2 * O.x - DQ.x;
  chispa(ctx, DX2, O.y, 4, RGB.pos, kq);
  brillo(ctx, DX2, O.y, 40, RGB.blanco, 0.35 * kq);
  flecha(ctx, P.x, P.y, P.x - ex, P.y + ey, RGB.hielo, kq * (1 - 0.7 * ki), 2.4, 15);
  flecha(ctx, P.x, P.y, P.x - ex, P.y, RGB.neg, kq * 0.9 * (1 - kx), 1.8, 12, [5, 5]);

  // Paso 6: la resultante, vertical.
  flecha(ctx, P.x, P.y, P.x, P.y - 200 * ki, RGB.azul, ki, 5, 24);
  variable(ctx, "E", "", P.x + 26, P.y - 190, 32, "91,134,255", ki, "left");

  // Paso 7: lo que se revisa.
  const k7 = eOut(pr(t, T[6], 0.6));
  rotulo(ctx, "unidades · dirección", P.x + 70, P.y - 140, { a: k7, size: 14, rgb: RGB.azul });
  rotulo(ctx, "signo · casos límite", P.x + 70, P.y - 112, { a: k7, size: 14, rgb: RGB.azul });
  puntoP(ctx, P.x, P.y, k1, "P", -34, -10);
};

// La lista de pasos: abajo en vertical, bajo el título en la columna horizontal.
const PasosBase: React.FC<{ t: number }> = ({ t }) => {
  const columna = useContext(EnColumna);
  const actual = PASOS.reduce((m, [, t0], i) => (t >= t0 ? i : m), -1);
  return (
    <div style={columna ? { position: "relative", marginTop: 44 } : { position: "absolute", left: MARGEN, top: 930, width: 940, columnCount: 2, columnGap: 40 }}>
      {PASOS.map(([s, t0], i) => (
        <div key={s} style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: columna ? 14 : 16, breakInside: "avoid", ...aparece(t, i === 0 ? 0.4 : Math.min(t0, 0.4 + i * 0.08), 0.6, 10) }}>
          <Mono size={15} color={i === actual ? C.azul : C.texto3}>{String(i + 1).padStart(2, "0")}</Mono>
          <span style={{ fontFamily: SANS, fontSize: columna ? 28 : 27, color: i === actual ? C.azul : i < actual ? C.texto2 : C.texto4, fontWeight: i === actual ? 600 : 400 }}>{s}</span>
        </div>
      ))}
    </div>
  );
};
const Pasos = Object.assign(PasosBase, { columna: true });

export const Receta: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Siempre la misma receta: *siete pasos*" />
      <Pasos t={t} />
    </Escena>
  );
};
