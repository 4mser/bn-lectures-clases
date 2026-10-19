import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { carga, linea, particulas, rgba, rotulo, type Fuente } from "../lab/luz";
import { campo, cerosEje, lineas, type Linea } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 10;
const T_MISMO = w(E, "mismo");
const T_CERO = w(E, "cero");
const T_OPUESTOS = w(E, "opuestos");
const T_NULO = w(E, "nulo");
export const sfx10: Sfx[] = [
  [E, T_MISMO, "tic"],
  [E, T_CERO, "check"],
  [E, T_OPUESTOS, "tic"],
  [E, T_NULO, "golpe"],
];

// Las cuatro combinaciones de signos de la Figura 1.18, con cargas de igual magnitud separadas L.
const L = 180;
const PW = 470;
const PH = 300;
type Panel = { cx: number; cy: number; q1: number; q2: number; nombre: string; mismo: boolean };
const PANELES: Panel[] = [
  { cx: 290, cy: 575, q1: 1, q2: 1, nombre: "+Q, +Q · repulsión", mismo: true },
  { cx: 790, cy: 575, q1: -1, q2: -1, nombre: "−Q, −Q · repulsión", mismo: true },
  { cx: 290, cy: 905, q1: 1, q2: -1, nombre: "+Q, −Q · atracción", mismo: false },
  { cx: 790, cy: 905, q1: -1, q2: 1, nombre: "−Q, +Q · atracción", mismo: false },
];
const datos = PANELES.map((p) => {
  const f: Fuente[] = [
    { x: p.cx - L / 2, y: p.cy + 12, q: p.q1 },
    { x: p.cx + L / 2, y: p.cy + 12, q: p.q2 },
  ];
  const caja: [number, number, number, number] = [p.cx - PW / 2 + 6, p.cy - PH / 2 + 40, p.cx + PW / 2 - 6, p.cy + PH / 2 - 6];
  const ls: Linea[] = lineas(f, 12, caja, { pasos: 300, h: 4, r0: 9, fase: () => 0 });
  const ceros = cerosEje(f, p.cy + 12, caja[0], caja[2], 1);
  // |E| en el punto medio, en unidades de kQ/L².
  const [ex, ey] = campo(f, p.cx, p.cy + 12);
  return { p, f, ls, ceros, medio: Math.hypot(ex, ey) * L * L };
});
const MEDIO_MISMO = datos[0].medio;
const MEDIO_OPUESTOS = datos[2].medio;

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const km = eOut(pr(t, T_MISMO - 0.2, 0.6));
  const ko = eOut(pr(t, T_OPUESTOS - 0.2, 0.6));
  datos.forEach(({ p, f, ls, ceros }, n) => {
    const k = eOut(pr(t, 0.2 + n * 0.15, 0.8));
    const foco = p.mismo ? km * (1 - ko) : ko;
    const a = k * (0.45 + 0.55 * foco);
    ctx.save();
    ctx.strokeStyle = rgba(RGB.blanco, (0.08 + 0.16 * foco) * k);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(p.cx - PW / 2, p.cy - PH / 2, PW, PH, 14);
    ctx.stroke();
    ctx.restore();
    rotulo(ctx, p.nombre, p.cx - PW / 2 + 20, p.cy - PH / 2 + 22, { a, size: 13 });
    const kl = eOut(pr(t, 0.5 + n * 0.15, 1.4));
    ls.forEach((l, i) => {
      const corte = l.pts.slice(0, Math.max(2, Math.round(l.pts.length * kl)));
      linea(ctx, corte, RGB.hielo, 0.3 * a * kl, 1);
      particulas(ctx, corte, t, 50, 2, RGB.hielo, 0.55 * a * kl, i + n * 40, 1.2);
    });
    f.forEach((c) => carga(ctx, c.x, c.y, 9, c.q > 0 ? RGB.pos : RGB.neg, a, t));
    // Punto de campo nulo (calculado como cero de Eₓ sobre el eje).
    const kc = eOut(pr(t, T_CERO - 0.3, 0.6));
    ceros.forEach((x) => {
      ctx.save();
      ctx.strokeStyle = rgba(RGB.azul, kc);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, p.cy + 12, 10 + 3 * Math.sin(t * 4), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      rotulo(ctx, "E = 0", x, p.cy + 52, { a: kc, align: "center", size: 13, rgb: RGB.azul });
    });
    if (!p.mismo) rotulo(ctx, "sin punto nulo", p.cx, p.cy + 112, { a: eOut(pr(t, T_NULO - 0.3, 0.6)), align: "center", size: 13 });
  });
};

export const Cuatro: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Mismo signo: *un punto donde el campo se anula*" />
      <Hud
        t0={T_CERO}
        items={[
          { l: "Mismo signo · E en el medio", v: num(MEDIO_MISMO, 2), u: "kQ/L²", azul: true, t: T_CERO },
          { l: "Opuestos · E en el medio", v: num(MEDIO_OPUESTOS, 2), u: "kQ/L²", t: T_NULO - 0.4 },
        ]}
      />
    </Escena>
  );
};
