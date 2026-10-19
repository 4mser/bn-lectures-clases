import React, { useContext } from "react";
import { Img, staticFile, useVideoConfig } from "remotion";
import { Cabeza, EnColumna, Escena, Mono, aparece, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { barraLuz, carga, rotulo, variable } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, MARGEN, MONO, RGB, SANS, W, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";
import { SERIE } from "../serie";

const E = 12;
const T_VIVO = w(E, "vivo");
const T_CUANT = w(E, "cuantizada");
const T_CONT = w(E, "continuas");
const T_VIENE = w(E, "viene");
export const sfx12: Sfx[] = [
  [E, T_VIVO, "check"],
  [E, T_CUANT, "tic"],
  [E, T_VIENE + 1.6, "campana"],
];

// Lo que viene: cargas discretas que se multiplican hasta verse como una línea continua.
const X0 = 170;
const X1 = 910;
const Y = 700;
const PASOS: [number, number][] = [
  [0, 6],
  [T_CUANT, 12],
  [T_CUANT + 0.9, 24],
  [T_CUANT + 1.6, 48],
];
const fila = (ctx: CanvasRenderingContext2D, t: number, n: number, a: number) => {
  for (let i = 0; i < n; i++) {
    const x = lerp(X0, X1, (i + 0.5) / n);
    carga(ctx, x, Y, lerp(11, 3.5, Math.log2(n / 6) / 3), RGB.pos, a, t);
  }
};

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kb = eOut(pr(t, T_CONT - 0.1, 0.9));
  PASOS.forEach(([t0, n], i) => {
    const entra = eOut(pr(t, t0 + 0.1, 0.4));
    const sale = i + 1 < PASOS.length ? eOut(pr(t, PASOS[i + 1][0] + 0.1, 0.3)) : kb;
    fila(ctx, t, n, entra * (1 - sale));
  });
  barraLuz(ctx, X0, Y, X1, Y, RGB.pos, kb, t, 5);
  rotulo(ctx, "discreto", X0, Y + 60, { a: eOut(pr(t, 0.4, 0.6)) * (1 - kb), size: 14 });
  rotulo(ctx, "continuo · densidad", X0, Y + 60, { a: kb, size: 14, rgb: RGB.azul });
  variable(ctx, "λ", "", X0 + 290, Y + 60, 26, RGB.azul, kb);
  variable(ctx, "Q = ne", "", X1, Y + 60, 26, RGB.blanco, eOut(pr(t, T_CUANT, 0.5)) * (1 - kb), "right");
};

// Créditos: abajo del reel en vertical; en horizontal, en la columna bajo el título.
const CreditosBase: React.FC<{ t: number }> = ({ t }) => {
  const columna = useContext(EnColumna);
  return (
    <div style={{ ...(columna ? { position: "relative", marginTop: 64 } : { position: "absolute", left: MARGEN, right: MARGEN, top: 1010 }), ...aparece(t, T_VIVO, 0.8, 16) }}>
      <Mono size={columna ? 11 : 13} color={C.texto4}>
        {SERIE.credito}
      </Mono>
      <div style={{ height: 1, background: "rgba(244,245,248,.1)", margin: "18px 0 22px", width: columna ? "100%" : W - 2 * MARGEN }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Mono size={14} color={C.texto3}>
            Código abierto · Licencia MIT
          </Mono>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 44, color: C.texto, marginTop: 12, letterSpacing: -0.5 }}>BN Lab Simulations</div>
          <div style={{ fontFamily: MONO, fontSize: columna ? 18 : 21, color: C.azul, marginTop: 8, whiteSpace: "nowrap" }}>github.com/4mser/bn-lab-simulations</div>
        </div>
        {columna ? null : <Img src={staticFile("img/bn-logo.png")} style={{ height: 84, marginBottom: 6 }} />}
      </div>
    </div>
  );
};
const Creditos = Object.assign(CreditosBase, { columna: true });

// Solo en horizontal: el logo va abajo a la derecha, justo sobre «Código abierto · MIT» del cromo.
const LogoBase: React.FC<{ t: number }> = ({ t }) => (
  <Img src={staticFile("img/bn-logo.png")} style={{ position: "absolute", right: MARGEN, bottom: 84, height: 84, ...aparece(t, T_VIVO, 0.8, 16) }} />
);
const Logo = Object.assign(LogoBase, { cuadro: true });

export const Cierre: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT();
  const { width, height } = useVideoConfig();
  const horizontal = width > height;
  return (
    <Escena dur={dur}>
      <Simulacion t={t} step={step} />
      <Cabeza ceja={INFO[E].ceja} titulo="Cada número de este video *se calculó en vivo*" bajada="Lo que viene: de lo discreto a lo continuo, las distribuciones de carga." tBajada={T_VIENE} />
      <Creditos t={t} />
      {horizontal ? <Logo t={t} /> : null}
    </Escena>
  );
};
