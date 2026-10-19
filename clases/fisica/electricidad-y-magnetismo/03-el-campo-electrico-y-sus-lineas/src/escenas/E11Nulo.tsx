import React from "react";
import { Cabeza, Escena, Hud, Sim, useT } from "../comun";
import { Formula } from "../formula";
import { Simulacion } from "../lab/motor";
import { carga, flecha, linea, particulas, rgba, rotulo, variable, type Fuente, type Pt } from "../lab/luz";
import { campo, cerosEje, lineas } from "../lab/campo";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 11;
const T_VALOR = w(E, "valor");
const T_CRECE = w(E, "crece");
const T_ACHICA = w(E, "achica");
const T_SIGNO = w(E, "signo");
const T_IGUALES = w(E, "iguales");
const T_DESAPARECE = w(E, "desaparece");
const T_CRECE2 = w(E, "crece", 1);
const T_REAPARECE = w(E, "reaparece");
const T_CUMPLE = w(E, "cumple");
export const sfx11: Sfx[] = [
  [E, T_CRECE, "tic"],
  [E, T_ACHICA, "tic"],
  [E, T_SIGNO, "golpe"],
  [E, T_DESAPARECE, "alerta"],
  [E, T_REAPARECE, "tic"],
  [E, T_CUMPLE, "check"],
];

// q₁ = +1 nC fija; q₂ cambia de valor y de signo. Separación L = 10 cm (30 px por cm).
const Y = 620;
const X1 = 390;
const L = 300;
const X2 = X1 + L;
const PX_CM = 30;
const Q1 = 1;
// Valor de q₂ (en nC) en el tiempo: cada cambio va anclado a la palabra que lo dice.
const CLAVES: [number, number][] = [
  [0, 1],
  [T_CRECE, 1],
  [T_CRECE + 1.2, 4],
  [T_ACHICA, 4],
  [T_ACHICA + 1.2, 0.25],
  [T_SIGNO, 0.25],
  [T_SIGNO + 1.4, -0.25],
  [T_IGUALES - 0.5, -0.25],
  [T_IGUALES + 0.5, -1],
  [T_CRECE2, -1],
  [T_CRECE2 + 1.6, -4],
];
const q2 = (t: number) => {
  for (let i = 1; i < CLAVES.length; i++) {
    const [ta, va] = CLAVES[i - 1];
    const [tb, vb] = CLAVES[i];
    if (t < tb) return va + (vb - va) * eIO(Math.max(0, (t - ta) / (tb - ta)));
  }
  return CLAVES[CLAVES.length - 1][1];
};

// Todo lo que depende de q₂: fuentes, punto nulo (cero de Eₓ en el eje, buscado numéricamente) y razones.
const estado = (t: number) => {
  const v = q2(t);
  const fuentes: Fuente[] = [
    { x: X1, y: Y, q: Q1 },
    { x: X2, y: Y, q: v },
  ];
  const ceros = Math.abs(v) < 0.004 ? [] : cerosEje(fuentes, Y, X1 - 60 * L, X2 + 60 * L, 2);
  const xn = ceros.length ? ceros[0] : null;
  const r1 = xn === null ? 0 : Math.abs(xn - X1);
  const r2 = xn === null ? 0 : Math.abs(xn - X2);
  return { v, fuentes, xn, razon: xn === null ? null : r1 / r2, raiz: Math.abs(v) < 0.004 ? null : Math.sqrt(Math.abs(Q1) / Math.abs(v)) };
};

const VISTA: [number, number, number, number] = [-150, 160, 1230, 1260];
const YG = 900; // eje de la gráfica de Eₓ
const AG = 62; // alto máximo de la gráfica

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const { v, fuentes, xn } = estado(t);
  const k = eOut(pr(t, 0.15, 0.8));

  // Líneas de campo, recalculadas en cada cuadro: 10 por nanocoulomb.
  const ls = lineas(fuentes.filter((f) => Math.abs(f.q) > 0.02), 10, VISTA, { pasos: 420, h: 4.5, r0: 10 });
  const kl = eOut(pr(t, 0.3, 1.4));
  ls.forEach((l, i) => {
    const corte = l.pts.slice(0, Math.max(2, Math.round(l.pts.length * kl)));
    linea(ctx, corte, RGB.hielo, 0.2 * kl, 1);
    particulas(ctx, corte, t, 70, 2, RGB.hielo, 0.5 * kl, i + 7, 1.3);
  });

  // Eje de las cargas.
  linea(ctx, [[-150, Y], [1230, Y]], RGB.blanco, 0.1 * k, 1);
  carga(ctx, X1, Y, 13, RGB.pos, k, t);
  carga(ctx, X2, Y, 13 * Math.sqrt(Math.min(4, Math.abs(v)) / 1), v >= 0 ? RGB.pos : RGB.neg, k * Math.min(1, Math.abs(v) * 6), t);
  variable(ctx, "q", "1", X1, Y + 66, 30, RGB.blanco, k, "center");
  variable(ctx, "q", "2", X2, Y + 66, 30, RGB.blanco, k, "center");
  rotulo(ctx, "+1,00 nC", X1, Y + 104, { a: k, align: "center", size: 14, caja: true });
  rotulo(ctx, `${v > 0.004 ? "+" : ""}${num(v, 2)} nC`, X2, Y + 104, { a: k, align: "center", size: 14, caja: true, rgb: v >= 0 ? RGB.blanco : RGB.neg });

  // Punto nulo.
  const kn = eOut(pr(t, T_VALOR, 0.6));
  if (xn !== null && xn > -90 && xn < 1170) {
    brillo2(ctx, xn, Y, kn, t);
    rotulo(ctx, "E = 0", xn, Y - 46, { a: kn, align: "center", size: 15, rgb: RGB.azul, peso: 500 });
    // r₁ y r₂ desde el punto nulo.
    const kr = eOut(pr(t, T_CUMPLE - 0.4, 0.6));
    const cota = (xa: number, xb: number, y: number, sub: string) => {
      linea(ctx, [[xa, y], [xb, y]], RGB.azul, 0.7 * kr, 1.4);
      linea(ctx, [[xa, y - 7], [xa, y + 7]], RGB.azul, 0.7 * kr, 1.4);
      linea(ctx, [[xb, y - 7], [xb, y + 7]], RGB.azul, 0.7 * kr, 1.4);
      variable(ctx, "r", sub, (xa + xb) / 2, y - 22, 28, RGB.azul, kr, "center");
    };
    cota(xn, X1, Y - 110, "1");
    cota(xn, X2, Y - 170, "2");
  } else if (xn !== null) {
    // Existe, pero fuera del cuadro: una flecha hacia donde está.
    const der = xn > X2;
    const xb = der ? 1050 : 30;
    flecha(ctx, der ? xb - 70 : xb + 70, Y, xb, Y, RGB.azul, kn, 2.5, 14);
    rotulo(ctx, `nulo en x = ${num((xn - X1) / PX_CM, 0)} cm`, der ? xb - 40 : xb + 40, Y - 34, { a: kn, align: der ? "right" : "left", size: 13, rgb: RGB.azul, caja: true });
  } else if (Math.abs(v) > 0.05) {
    rotulo(ctx, "sin punto nulo", 540, Y - 150, { a: kn, align: "center", size: 15, rgb: RGB.azul });
  }

  // Gráfica de Eₓ sobre el eje, comprimida con tanh: cruza el cero justo en el punto nulo.
  const kg = eOut(pr(t, 0.6, 0.8));
  linea(ctx, [[-150, YG], [1230, YG]], RGB.blanco, 0.22 * kg, 1);
  rotulo(ctx, "Eₓ sobre el eje", 40, YG - AG - 18, { a: kg, size: 13 });
  const tramos: Pt[][] = [[]];
  for (let x = -150; x <= 1230; x += 2) {
    if (Math.abs(x - X1) < 3 || (Math.abs(x - X2) < 3 && Math.abs(v) > 0.004)) {
      tramos.push([]);
      continue;
    }
    const ex = campo(fuentes, x, Y)[0];
    tramos[tramos.length - 1].push([x, YG - AG * Math.tanh(ex * 2500)]);
  }
  tramos.forEach((p) => linea(ctx, p, RGB.azul, 0.85 * kg, 2));
  if (xn !== null && xn > -90 && xn < 1170) {
    linea(ctx, [[xn, Y + 20], [xn, YG]], RGB.azul, 0.35 * kn, 1, [3, 6]);
    ctx.fillStyle = rgba(RGB.azul, kn);
    ctx.beginPath();
    ctx.arc(xn, YG, 5, 0, Math.PI * 2);
    ctx.fill();
  }
};

// Anillo que late en el punto de campo nulo.
const brillo2 = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, t: number) => {
  ctx.save();
  ctx.strokeStyle = rgba(RGB.azul, a);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(x, y, 12 + 3 * Math.sin(t * 4), 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = rgba(RGB.azul, 0.3 * a);
  ctx.beginPath();
  ctx.arc(x, y, 24 + 4 * Math.sin(t * 4), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const texNum = (v: number | null) => (v === null ? "\\infty" : num(v, 2).replace(",", "{,}").replace("−", "-"));

export const Nulo: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const s = estado(t);
  const azul = t > T_CUMPLE - 0.3;
  const izq = s.razon === null ? "\\text{---}" : texNum(s.razon);
  const tex = `\\frac{r_1}{r_2}=${azul ? `\\textcolor{#5B86FF}{${izq}}` : izq}\\qquad\\sqrt{\\frac{|q_1|}{|q_2|}}=${azul ? `\\textcolor{#5B86FF}{${texNum(s.raiz)}}` : texNum(s.raiz)}`;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="El punto nulo *se mueve con las cargas*" />
      <Formula tex={tex} t0={T_CRECE - 0.3} top={1112} size={34} />
      <Hud
        t0={T_VALOR}
        top={1000}
        items={[
          { l: <>Carga <Sim sub="2">q</Sim></>, v: `${s.v > 0.004 ? "+" : ""}${num(s.v, 2)}`, u: "nC", t: T_VALOR },
          { l: <>Punto nulo (desde <Sim sub="1">q</Sim>)</>, v: s.xn === null ? "no hay" : num((s.xn - X1) / PX_CM, 1), u: s.xn === null ? undefined : "cm", azul: true, t: T_VALOR + 0.15 },
        ]}
      />
    </Escena>
  );
};
