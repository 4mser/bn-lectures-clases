import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Mono } from "./comun";
import { C, H, MARGEN, MONO, TT, formato } from "./theme";
import { FPS, INICIOS, TOTAL } from "./linea";

// Fondo negro con una viñeta apenas azul al centro, donde vive la simulación.
// En horizontal la viñeta se corre a la derecha, bajo la simulación.
export const Fondo: React.FC = () => {
  const { width, height } = useVideoConfig();
  const centro = width > height ? "ellipse 45% 70% at 70% 50%" : "ellipse 70% 45% at 50% 52%";
  return <AbsoluteFill style={{ background: `radial-gradient(${centro}, #070b18 0%, ${C.fondo} 100%)` }} />;
};

// Cromo fijo del reel: «B&N LAB» y el tema arriba, la web y «calculado en vivo» abajo.
export const Cromo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cierre = frame >= INICIOS[INICIOS.length - 1] + 6;
  const punto = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 4));
  const entrada = Math.min(1, frame / 18);
  const salida = Math.min(1, (TOTAL - frame) / 24);
  const { width, height } = useVideoConfig();
  // En 9:16 el cromo queda en el marco de la escena vertical, no en los bordes que tapa la app.
  const lugar = formato(width, height) === "alto" ? { top: TT.oy, height: H, bottom: "auto" } : {};
  return (
    <AbsoluteFill style={{ opacity: Math.min(entrada, salida), ...lugar }}>
      <div style={{ position: "absolute", left: MARGEN, right: MARGEN, top: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: MONO, fontSize: 17, letterSpacing: 3.4, color: C.texto3 }}>
          <b style={{ fontWeight: 500, color: C.texto }}>B&amp;N</b> LAB
        </span>
        <Mono size={15}>Campo eléctrico · Campos conocidos</Mono>
      </div>
      <div style={{ position: "absolute", left: MARGEN, right: MARGEN, top: 76, height: 1, background: "rgba(244,245,248,.08)" }} />
      <div style={{ position: "absolute", left: MARGEN, right: MARGEN, bottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Mono size={14} color={C.texto4}>
          bnsolutions.cl/research
        </Mono>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Mono size={14} color={C.texto4}>
            {cierre ? "Código abierto · MIT" : "Simulación ·"}
          </Mono>
          {cierre ? null : (
            <>
              <i style={{ display: "block", width: 9, height: 9, borderRadius: 5, background: C.azul, opacity: punto, boxShadow: `0 0 12px ${C.azul}` }} />
              <Mono size={14} color={C.texto4}>
                Calculado en vivo
              </Mono>
            </>
          )}
        </span>
      </div>
    </AbsoluteFill>
  );
};
