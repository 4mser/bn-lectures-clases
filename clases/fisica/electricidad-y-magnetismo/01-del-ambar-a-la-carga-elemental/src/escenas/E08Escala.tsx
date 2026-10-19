import React from "react";
import { Cabeza, Escena, Hud, useT } from "../comun";
import { Tex } from "../formula";
import { Simulacion } from "../lab/motor";
import { TAU, azar, brillo, chispa, linea, rgba, rotulo } from "../lab/luz";
import { cientifica, potencia, signo } from "../lab/historia";
import { INFO, w } from "../linea";
import { RGB, eIO, eOut, lerp, num, pr } from "../theme";
import type { Sfx } from "../sfx";

const E = 8;
const T_ATOMO = w(E, "átomo");
const T_NUCLEO = w(E, "núcleo");
const T_QUINCE = w(E, "quince");
const T_SI = w(E, "si");
const T_KM = w(E, "kilómetro");
const T_VACIA = w(E, "vacía");
export const sfx08: Sfx[] = [
  [E, T_NUCLEO, "tic"],
  [E, T_QUINCE + 0.4, "golpe"],
  [E, T_KM, "check"],
];

// Radios típicos de los apuntes.
const R_ATOMO = 1e-10; // m
const R_NUCLEO = 1e-15; // m
const RAZON = R_ATOMO / R_NUCLEO;
const NUCLEO_CM = 0.01; // m
const ATOMO_KM = (NUCLEO_CM * RAZON) / 1000;

const C0 = { x: 540, y: 700 };
const ANCHO_PX = 900; // ancho de la vista en píxeles
// Ancho de la vista en metros: de 4 radios atómicos a 4 radios nucleares, y de vuelta.
const L_ATOMO = Math.log10(4.4 * R_ATOMO);
const L_NUCLEO = Math.log10(4.4 * R_NUCLEO);
const logVista = (t: number) => lerp(lerp(L_ATOMO, L_NUCLEO, eIO(pr(t, T_NUCLEO, 2.2))), L_ATOMO, eIO(pr(t, T_SI, 2.4)));

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.2, 0.9));
  const S = ANCHO_PX / Math.pow(10, logVista(t)); // px por metro
  // Nube electrónica a escala.
  const ra = R_ATOMO * S;
  if (ra < 4000) {
    ctx.save();
    const g = ctx.createRadialGradient(C0.x, C0.y, ra * 0.2, C0.x, C0.y, ra);
    g.addColorStop(0, rgba(RGB.neg, 0.03 * k));
    g.addColorStop(0.85, rgba(RGB.neg, 0.1 * k));
    g.addColorStop(1, rgba(RGB.neg, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(C0.x, C0.y, ra, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = rgba(RGB.neg, 0.4 * k);
    ctx.setLineDash([3, 7]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(C0.x, C0.y, ra, 0, TAU);
    ctx.stroke();
    ctx.restore();
    for (let j = 0; j < 6; j++) {
      const u = (j / 6) * TAU + t * (0.3 + 0.1 * j);
      const rr = ra * (0.55 + 0.35 * azar(j * 2.1));
      signo(ctx, C0.x + Math.cos(u) * rr, C0.y + Math.sin(u) * rr, 8, false, k);
    }
  }
  // Núcleo a escala (con un mínimo para que se vea como punto de luz).
  const rn = R_NUCLEO * S;
  if (rn < 5) {
    brillo(ctx, C0.x, C0.y, 26, RGB.pos, 0.8 * k);
    chispa(ctx, C0.x, C0.y, 2, RGB.pos, k);
  } else {
    brillo(ctx, C0.x, C0.y, rn * 2.2, RGB.pos, 0.35 * k);
    // Protones repartidos parejo en el disco (espiral de ángulo áureo).
    for (let j = 0; j < 30; j++) {
      const rr = rn * 0.82 * Math.sqrt((j + 0.5) / 30);
      const u = j * 2.39996 + 0.4 * azar(j);
      const x = C0.x + Math.cos(u) * rr;
      const y = C0.y + Math.sin(u) * rr;
      if (rn > 60) signo(ctx, x, y, Math.min(15, rn * 0.075), true, k);
      else chispa(ctx, x, y, Math.max(1, rn * 0.1), RGB.pos, k);
    }
    ctx.save();
    ctx.strokeStyle = rgba(RGB.pos, 0.5 * k);
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.arc(C0.x, C0.y, rn, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  // Circunferencias de referencia en cada potencia de diez (de 10⁻¹¹ a 10⁻¹⁴ m): marcan el zoom.
  for (let p = -11; p >= -14; p--) {
    const r = Math.pow(10, p) * S;
    const a = k * cl01((r - 30) / 60) * cl01((430 - r) / 90);
    if (a <= 0.01) continue;
    ctx.save();
    ctx.strokeStyle = rgba(RGB.hielo, 0.3 * a);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(C0.x, C0.y, r, 0, TAU);
    ctx.stroke();
    ctx.restore();
    potencia(ctx, "", p, C0.x + r * 0.71 + 8, C0.y - r * 0.71 - 8, 18, RGB.hielo, 0.8 * a, "left", "m");
  }
  // Rótulos según la escala: el átomo cuando se ve entero, el núcleo cuando llena la vista.
  const kAt = cl01((ANCHO_PX * 0.6 - ra) / 120) * k;
  rotulo(ctx, "Átomo", C0.x, C0.y - ra - 24, { a: kAt, align: "center", size: 14, rgb: RGB.neg });
  rotulo(ctx, "Núcleo", C0.x, C0.y - Math.max(rn, 18) - 22, { a: cl01((rn - 20) / 60) * k, align: "center", size: 14, rgb: RGB.hielo });
  // Barra de escala: 200 px, con su largo en metros calculado en vivo.
  const largo = 200 / S;
  const [m, e] = cientifica(largo, 1);
  linea(ctx, [[C0.x - 100, 1010], [C0.x + 100, 1010]], RGB.blanco, 0.8 * k, 2);
  linea(ctx, [[C0.x - 100, 1002], [C0.x - 100, 1018]], RGB.blanco, 0.8 * k, 2);
  linea(ctx, [[C0.x + 100, 1002], [C0.x + 100, 1018]], RGB.blanco, 0.8 * k, 2);
  potencia(ctx, m, e, C0.x, 1046, 26, RGB.blanco, k, "center", "m");
  rotulo(ctx, "Casi todo es espacio vacío", C0.x, C0.y + 30, { a: eOut(pr(t, T_VACIA - 0.6, 0.6)), align: "center", size: 15, rgb: RGB.hielo });
};
const cl01 = (v: number) => Math.min(1, Math.max(0, v));

export const Escala: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="El núcleo es *cien mil veces más chico* que el átomo" />
      <Hud
        t0={T_ATOMO}
        items={[
          { l: "Radio atómico ÷ nuclear", v: <Tex tex={`10^{${Math.round(Math.log10(RAZON))}}`} size={46} />, t: T_QUINCE },
          { l: "Núcleo de 1 cm · átomo de", v: num(ATOMO_KM, 0), u: "km", azul: true, t: T_KM },
        ]}
      />
    </Escena>
  );
};
