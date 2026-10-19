import React, { useContext } from "react";
import { Img, staticFile, useVideoConfig } from "remotion";
import { Cabeza, EnColumna, Escena, Mono, aparece, useT } from "../comun";
import { Simulacion } from "../lab/motor";
import { carga, linea, particulas, trazar, type Fuente, type Pt } from "../lab/luz";
import { trazoDensidad } from "../lab/densidad";
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

// Una barra con densidad que crece hacia arriba (como λ = αx del ejercicio 1) y una carga puntual (−):
// las líneas salen de la barra, más juntas donde hay más carga, y terminan en la carga.
const BARRA = { x: 300, y0: 560, y1: 820 };
const NEG = { x: 790, y: 690, q: -1 };
const N = 24;
const PESO = Array.from({ length: N }, (_, i) => 1 / 3 + (2 / 3) * (1 - (i + 0.5) / N)); // arriba, más densa
const SUMA = PESO.reduce((a, b) => a + b, 0);
const FUENTES: Fuente[] = [
  ...PESO.map((p, i) => ({ x: BARRA.x, y: lerp(BARRA.y0, BARRA.y1, (i + 0.5) / N), q: p / SUMA })),
  NEG,
];
const CAJA: [number, number, number, number] = [-60, 300, 1140, 1000];
const LINEAS: Pt[][] = [-1, 1].flatMap((lado) =>
  Array.from({ length: 9 }, (_, i) => trazar(FUENTES, BARRA.x + lado * 7, lerp(BARRA.y0 - 30, BARRA.y1 + 30, Math.pow((i + 0.5) / 9, 1.25)), 1, 260, 5, CAJA)),
);

const step = (ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) => {
  const kl = eOut(pr(t, 0.3, 2));
  LINEAS.forEach((pts, i) => {
    const corte = pts.slice(0, Math.max(2, Math.round(pts.length * kl)));
    linea(ctx, corte, RGB.hielo, 0.16 * kl, 1);
    particulas(ctx, corte, t, 75, 4, RGB.hielo, 0.75 * kl, i + 21, 1.5);
  });
  const k = eOut(pr(t, 0.1, 0.7));
  trazoDensidad(ctx, (u) => [BARRA.x, lerp(BARRA.y1, BARRA.y0, u)], (u) => 1 / 3 + (2 / 3) * u, k, t, { grosor: 8 });
  carga(ctx, NEG.x, NEG.y, 14, RGB.neg, k, t);
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
      <Cabeza ceja={INFO[E].ceja} titulo="Cada número de este video *se calculó en vivo*" bajada="Lo que viene: la ley de Gauss." tBajada={T_VIENE} />
      <Creditos t={t} />
      {horizontal ? <Logo t={t} /> : null}
    </Escena>
  );
};
