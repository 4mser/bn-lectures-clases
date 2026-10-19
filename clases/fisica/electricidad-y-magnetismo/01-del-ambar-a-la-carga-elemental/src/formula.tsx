import React, { useContext, useMemo } from "react";
import katex from "katex";
import { EnColumna, aparece, useT } from "./comun";
import { C, W, eIO, pr } from "./theme";

// Fórmula con KaTeX. Las fuentes ya están cargadas (theme.ts), así que el primer cuadro sale bien.
export const Tex: React.FC<{ tex: string; size?: number; color?: string; style?: React.CSSProperties }> = ({ tex, size = 46, color = C.texto, style }) => {
  const html = useMemo(() => katex.renderToString("\\displaystyle " + tex, { throwOnError: true, strict: "ignore", output: "html" }), [tex]);
  return <span style={{ fontSize: size, color, lineHeight: 1.2, whiteSpace: "nowrap", ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
};

// Fórmula centrada a lo ancho, a la altura top, que entra enfocándose en t0 y (si se pide) se va en tFin.
// En la columna horizontal todas las fórmulas de la escena comparten un mismo hueco, alineadas a la izquierda.
const FormulaBase: React.FC<{ tex: string; t0: number; top: number; size?: number; tFin?: number; color?: string }> = ({ tex, t0, top, size = 50, tFin, color }) => {
  const t = useT();
  const columna = useContext(EnColumna);
  const entra = aparece(t, t0, 0.8, 18);
  const sale = tFin === undefined ? 0 : eIO(pr(t, tFin, 0.5));
  const lugar: React.CSSProperties = columna ? { left: 0, top: 0, justifyContent: "flex-start" } : { left: 0, width: W, top, justifyContent: "center" };
  return (
    <div style={{ position: "absolute", display: "flex", ...lugar, ...entra, opacity: (entra.opacity as number) * (1 - sale) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};
export const Formula = Object.assign(FormulaBase, { formula: true });

// Pinta un término en azul (k = 1) o en blanco (k = 0).
export const resalta = (tex: string, k: number) => (k > 0.5 ? `\\textcolor{#5B86FF}{${tex}}` : tex);
