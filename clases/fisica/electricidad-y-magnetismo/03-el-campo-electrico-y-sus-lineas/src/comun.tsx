import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, H, MARGEN, MONO, SANS, TT, W, YT, eIO, eOut, formato, lerp, pr } from "./theme";
import { SOLAPE } from "./linea";
import { SERIE } from "./serie";

// true dentro de la columna de texto de la versión horizontal: Cabeza, Hud y Formula dejan de ir en posición fija
// y se apilan en la columna.
export const EnColumna = createContext(false);

export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

// Entra subiendo y enfocándose, como los bloques del reel de B&N Lab.
export const aparece = (t: number, t0: number, d = 0.7, dy = 22): React.CSSProperties => {
  const k = eOut(pr(t, t0, d));
  return {
    opacity: k,
    transform: `translateY(${lerp(dy, 0, k)}px)`,
    filter: k < 0.98 ? `blur(${lerp(10, 0, k)}px)` : undefined,
  };
};

// Qué hace cada hijo de una escena en la versión horizontal, según la marca estática de su componente.
type Marca = { lienzo?: boolean; columna?: boolean; formula?: boolean; cuadro?: boolean };
const marca = (n: React.ReactNode): Marca => (React.isValidElement(n) && typeof n.type !== "string" ? (n.type as Marca) : {});

// Horizontal: el lienzo cubre el cuadro (con su máscara hacia la izquierda), la columna apila
// cabeza, fórmulas y lecturas centrada en alto, y lo demás (rótulos HTML de la escena) va sobre la simulación
// con la misma transformación que el lienzo. Lo marcado cuadro va en coordenadas del cuadro de 1920×1080.
const Horizontal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hijos = React.Children.toArray(children);
  const lienzo = hijos.filter((n) => marca(n).lienzo);
  const formulas = hijos.filter((n) => marca(n).formula);
  const cabeza = hijos.filter((n) => marca(n).columna === true && (n as React.ReactElement).type === Cabeza);
  const abajo = hijos.filter((n) => marca(n).columna === true && (n as React.ReactElement).type !== Cabeza);
  const cuadro = hijos.filter((n) => marca(n).cuadro);
  const escena = hijos.filter((n) => !marca(n).lienzo && !marca(n).formula && !marca(n).columna && !marca(n).cuadro);
  return (
    <>
      {lienzo}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${YT.ox}px, ${YT.oy}px) scale(${YT.s})` }}>{escena}</div>
      <EnColumna.Provider value>
        <div style={{ position: "absolute", left: YT.col.x, width: YT.col.w, top: 110, bottom: 110, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {cabeza}
          {formulas.length ? <div style={{ position: "relative", height: 170, marginTop: 56 }}>{formulas}</div> : null}
          {abajo}
        </div>
      </EnColumna.Provider>
      {cuadro}
    </>
  );
};

// 9:16: el lienzo cubre el cuadro y todo lo demás va como en el reel vertical, bajado TT.oy px.
const Alto: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hijos = React.Children.toArray(children);
  return (
    <>
      {hijos.filter((n) => marca(n).lienzo)}
      <div style={{ position: "absolute", left: 0, top: TT.oy, width: W, height: H }}>{hijos.filter((n) => !marca(n).lienzo && !marca(n).cuadro)}</div>
    </>
  );
};

// Escena: aparece desde el negro y se va desenfocándose mientras entra la siguiente.
export const Escena: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const t = useT();
  const { fps, width, height } = useVideoConfig();
  const salida = SOLAPE / fps;
  const ks = eIO(pr(t, dur - salida, salida));
  const ke = eOut(pr(t, 0, 0.6));
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(ke, 1 - ks),
        transform: `scale(${lerp(1, 1.025, ks)})`,
        filter: ks > 0.02 ? `blur(${ks * 12}px)` : undefined,
      }}
    >
      {formato(width, height) === "horizontal" ? <Horizontal>{children}</Horizontal> : formato(width, height) === "alto" ? <Alto>{children}</Alto> : children}
    </AbsoluteFill>
  );
};

// Título palabra por palabra. *texto* va en azul y negrita; _texto_ en blanco y negrita; \n fuerza un salto.
export const Titulo: React.FC<{ texto: string; t0: number; size?: number; gap?: number }> = ({ texto, t0, size = 64, gap = 0.06 }) => {
  const t = useT();
  let i = 0;
  let marca = "";
  return (
    <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: size, lineHeight: 1.1, letterSpacing: -size * 0.025, color: C.texto }}>
      {texto.split("\n").map((linea, li) => (
        <div key={li}>
          {linea.split(" ").map((palabra, pi) => {
            const abre = palabra[0] === "*" || palabra[0] === "_" ? palabra[0] : "";
            if (abre) marca = abre;
            const actual = marca;
            if (marca && palabra.endsWith(marca)) marca = "";
            const limpia = palabra.replace(/[*_]/g, "");
            const k = eOut(pr(t, t0 + i++ * gap, 0.75));
            return (
              <span
                key={pi}
                style={{
                  display: "inline-block",
                  marginRight: size * 0.24,
                  fontWeight: actual ? 700 : 400,
                  color: actual === "*" ? C.azul : C.texto,
                  opacity: k,
                  transform: `translateY(${lerp(size * 0.35, 0, k)}px)`,
                  filter: k < 0.98 ? `blur(${lerp(14, 0, k)}px)` : undefined,
                }}
              >
                {limpia}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Rótulo mono en mayúsculas con letras separadas.
export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 17, color = C.texto3, style }) => (
  <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: size, letterSpacing: size * 0.2, textTransform: "uppercase", color, whiteSpace: "nowrap", ...style }}>
    {children}
  </span>
);

// Símbolo dentro de un rótulo en mayúsculas: conserva su caja (q no es Q) y va en cursiva matemática.
export const Sim: React.FC<{ children: React.ReactNode; sub?: string }> = ({ children, sub }) => (
  <span style={{ textTransform: "none", letterSpacing: 0.5, fontSize: "1.3em", lineHeight: 0 }}>
    <span style={{ fontFamily: "KaTeX_Math", fontStyle: "italic" }}>{children}</span>
    {sub ? <span style={{ fontFamily: "KaTeX_Main", fontSize: "0.68em", verticalAlign: "-0.25em", marginLeft: 1 }}>{sub}</span> : null}
  </span>
);

// Cabeza de la escena: ceja con su línea hasta el borde, título y bajada opcional.
const CabezaBase: React.FC<{ ceja: string; titulo: string; bajada?: string; tBajada?: number; t0?: number; size?: number }> = ({ ceja, titulo, bajada, tBajada, t0 = 0.25, size }) => {
  const t = useT();
  const columna = useContext(EnColumna);
  const kc = eOut(pr(t, t0 - 0.15, 0.7));
  const palabras = titulo.split(/\s+/).length;
  return (
    <div style={columna ? { position: "relative" } : { position: "absolute", left: MARGEN, top: 112, width: W - 2 * MARGEN }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: kc, marginBottom: 26 }}>
        <Mono color={C.texto2} size={columna ? 14 : 17}>{`${SERIE.titulo} · ${ceja}`}</Mono>
        <span style={{ flex: 1, height: 1, background: "rgba(244,245,248,.16)", transform: `scaleX(${kc})`, transformOrigin: "left" }} />
      </div>
      <Titulo texto={titulo} t0={t0} size={size} />
      {bajada ? (
        <div style={{ ...aparece(t, tBajada ?? t0 + palabras * 0.06 + 0.3, 0.8, 12), marginTop: 22, fontFamily: SANS, fontSize: 27, lineHeight: 1.38, color: C.texto2, maxWidth: 860 }}>
          {bajada}
        </div>
      ) : null}
    </div>
  );
};
export const Cabeza = Object.assign(CabezaBase, { columna: true });

// Lecturas en vivo abajo, como «FLUJO SUMADO 0,568 q/ε₀» en el reel: rótulo mono chico y cifra grande.
// u puede ser texto o una fórmula (<Tex>) para unidades con letras griegas; t fija cuándo entra esa lectura.
export type Lectura = { l: React.ReactNode; v: React.ReactNode; u?: React.ReactNode; azul?: boolean; t?: number };
const HudBase: React.FC<{ items: Lectura[]; t0: number; top?: number; tFin?: number }> = ({ items, t0, top = 1086, tFin }) => {
  const t = useT();
  const columna = useContext(EnColumna);
  const sale = tFin === undefined ? 0 : eIO(pr(t, tFin, 0.5));
  const lugar: React.CSSProperties = columna ? { position: "relative", marginTop: 48, flexWrap: "wrap", columnGap: 56, rowGap: 30 } : { position: "absolute", left: MARGEN, top, gap: 64 };
  return (
    <div style={{ ...lugar, display: "flex", opacity: 1 - sale }}>
      {items.map((c, i) => (
        <div key={i} style={aparece(t, c.t ?? t0 + i * 0.12, 0.7, 14)}>
          <Mono size={14} color={C.texto3}>
            {c.l}
          </Mono>
          <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 500, fontSize: 50, letterSpacing: -1, color: c.azul ? C.azul : C.texto, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
            {c.v}
            {c.u ? <span style={{ fontSize: 24, fontWeight: 400, marginLeft: 10, color: c.azul ? C.azul : C.texto2, letterSpacing: 0 }}>{c.u}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
};
export const Hud = Object.assign(HudBase, { columna: true });
