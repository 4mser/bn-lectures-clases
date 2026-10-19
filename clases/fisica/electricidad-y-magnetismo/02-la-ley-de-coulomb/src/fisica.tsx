// Constantes físicas y formato de cifras en notación científica, para el HUD (JSX) y para el lienzo (canvas).
// Valores CODATA 2022; e es exacta por definición del SI.
import React from "react";
import { SANS, num } from "./theme";
import { rgba } from "./lab/luz";

export const E_CARGA = 1.602176634e-19; // C
export const EPS0 = 8.8541878188e-12; // C²/(N·m²)
export const K = 1 / (4 * Math.PI * EPS0); // N·m²/C²
export const G = 6.6743e-11; // N·m²/kg²
export const M_P = 1.67262192595e-27; // kg
export const M_E = 9.1093837139e-31; // kg

// Mantisa (con coma) y exponente de v, redondeando la mantisa a d decimales.
export const cien = (v: number, d = 2): { m: string; e: number } => {
  let e = Math.floor(Math.log10(Math.abs(v)));
  let m = v / Math.pow(10, e);
  if (Math.abs(Number(m.toFixed(d))) >= 10) {
    m /= 10;
    e += 1;
  }
  return { m: num(m, d), e };
};
const exp = (e: number) => (e < 0 ? `−${-e}` : `${e}`);

// 8,99 × 10⁹ con el exponente en superíndice.
export const Cien: React.FC<{ v: number; d?: number }> = ({ v, d = 2 }) => {
  const c = cien(v, d);
  return (
    <span>
      {c.m}
      <span style={{ margin: "0 0.16em", opacity: 0.8 }}>×</span>10
      <span style={{ fontSize: "0.56em", position: "relative", top: "-0.78em", marginLeft: "0.04em" }}>{exp(c.e)}</span>
    </span>
  );
};
// Solo la potencia: 10⁻¹⁶.
export const Potencia: React.FC<{ e: number }> = ({ e }) => (
  <span>
    10<span style={{ fontSize: "0.56em", position: "relative", top: "-0.78em", marginLeft: "0.04em" }}>{exp(e)}</span>
  </span>
);

type Ctx = CanvasRenderingContext2D;
type Op = { size?: number; rgb?: string; a?: number; align?: CanvasTextAlign; peso?: number };

// Texto en Space Grotesk sobre el lienzo (sin mayúsculas forzadas, a diferencia de rotulo). Devuelve el ancho.
export const texto = (ctx: Ctx, s: string, x: number, y: number, o: Op = {}) => {
  const a = o.a ?? 1;
  const size = o.size ?? 26;
  ctx.save();
  ctx.font = `${o.peso ?? 400} ${size}px "${SANS}"`;
  const ancho = ctx.measureText(s).width;
  if (a > 0.01) {
    ctx.fillStyle = rgba(o.rgb ?? "244,245,248", a);
    ctx.textAlign = o.align ?? "left";
    ctx.textBaseline = "middle";
    ctx.fillText(s, x, y);
  }
  ctx.restore();
  return ancho;
};

// «antes 8,21 × 10⁻⁸ despues» sobre el lienzo, con el exponente en superíndice.
export const cienCtx = (ctx: Ctx, v: number, x: number, y: number, o: Op & { d?: number; antes?: string; despues?: string; pot?: boolean } = {}) => {
  const size = o.size ?? 26;
  const c = cien(v, o.d ?? 2);
  const base = o.pot ? `${o.antes ?? ""}10` : `${o.antes ?? ""}${c.m} × 10`;
  const sup = exp(c.e);
  const despues = o.despues ?? "";
  const wb = texto(ctx, base, 0, 0, { ...o, a: 0 });
  const ws = texto(ctx, sup, 0, 0, { ...o, size: size * 0.6, a: 0 });
  const wd = texto(ctx, despues, 0, 0, { ...o, a: 0 });
  const total = wb + ws + 2 + wd;
  const x0 = o.align === "center" ? x - total / 2 : o.align === "right" ? x - total : x;
  texto(ctx, base, x0, y, { ...o, align: "left" });
  texto(ctx, sup, x0 + wb + 2, y - size * 0.38, { ...o, size: size * 0.6, align: "left" });
  if (despues) texto(ctx, despues, x0 + wb + ws + 2, y, { ...o, align: "left" });
};
