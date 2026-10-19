import React, { useContext } from "react";
import { Img, staticFile, useVideoConfig } from "remotion";
import { Cabeza, EnColumna, Escena, Mono, aparece, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { barraLuz, carga, flecha, linea, particulas, type Pt } from "../lab/luz";
import { INFO, w } from "../linea";
import { C, MARGEN, MONO, RGB, SANS, W, eOut, lerp, pr } from "../theme";
import type { Sfx } from "../sfx";
import { SERIE } from "../serie";

const E = 13;
const T_VIVO = w(E, "vivo");
const T_VIENE = w(E, "viene");
export const sfx13: Sfx[] = [
  [E, T_VIVO, "check"],
  [E, T_VIENE + 1.6, "campana"],
];

// Lo que viene: placas paralelas con su campo uniforme y una carga positiva quieta entre ellas.
const PLACA = { x0: 170, x1: 910, y0: 430, y1: 880 };
const CARGA = { x: 540, y: 655 };

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const k = eOut(pr(t, 0.1, 0.8));
  for (const [y, rgb] of [
    [PLACA.y0, RGB.pos],
    [PLACA.y1, RGB.neg],
  ] as [number, string][]) {
    barraLuz(ctx, PLACA.x0, y, PLACA.x1, y, rgb, 0.8 * k, t, 4);
  }
  const kl = eOut(pr(t, 0.3, 1.6));
  for (let x = PLACA.x0 + 46; x < PLACA.x1 - 20; x += 58) {
    const pts: Pt[] = [
      [x, PLACA.y0 + 12],
      [x, lerp(PLACA.y0 + 14, PLACA.y1 - 12, kl)],
    ];
    linea(ctx, pts, RGB.hielo, 0.22 * kl, 1.1);
    particulas(ctx, pts, t, 75, 3, RGB.hielo, 0.65 * kl, x, 1.4);
  }
  const kc = eOut(pr(t, T_VIENE, 0.8));
  carga(ctx, CARGA.x, CARGA.y, 12, RGB.pos, kc, t);
  const late = 0.5 + 0.5 * Math.sin(t * 3);
  flecha(ctx, CARGA.x + 50, CARGA.y - 40, CARGA.x + 50, CARGA.y + 40 + 14 * late, RGB.azul, kc * 0.8, 3, 16);
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
      <Cabeza ceja={INFO[E].ceja} titulo="Cada número de este video *se calculó en vivo*" bajada="Lo que viene: una carga suelta dentro de un campo." tBajada={T_VIENE} />
      <Creditos t={t} />
      {horizontal ? <Logo t={t} /> : null}
    </Escena>
  );
};
