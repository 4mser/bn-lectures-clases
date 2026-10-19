import React, { useContext } from "react";
import { EnColumna, Mono, aparece, useT } from "../comun";
import { C, MARGEN, SANS, W, eOut, lerp, pr } from "../theme";

// Línea de tiempo de la Figura 1.13 de los apuntes: Newton (1687), Faraday (1831), Maxwell (1865).
// activo es el hito que se enciende en esta escena; en horizontal va en la columna, bajo el título.
const HITOS = [
  { anio: "1687", nombre: "Isaac Newton", obra: "Gravitación universal" },
  { anio: "1831", nombre: "Michael Faraday", obra: "Líneas de fuerza" },
  { anio: "1865", nombre: "J. C. Maxwell", obra: "Teoría del campo" },
];
const LineaTiempoBase: React.FC<{ activo: number; t0: number; top?: number }> = ({ activo, t0, top = 1060 }) => {
  const t = useT();
  const columna = useContext(EnColumna);
  const k = eOut(pr(t, t0, 0.8));
  const ancho = columna ? 600 : W - 2 * MARGEN;
  return (
    <div style={{ ...(columna ? { position: "relative", marginTop: 72 } : { position: "absolute", left: MARGEN, top }), width: ancho, ...aparece(t, t0 - 0.3, 0.8, 14) }}>
      <div style={{ position: "relative", height: 1, background: "rgba(244,245,248,.16)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: 1, width: `${lerp(0, (activo + 0.5) / 3, k) * 100}%`, background: C.azul, boxShadow: `0 0 10px ${C.azul}` }} />
      </div>
      <div style={{ display: "flex", marginTop: 18 }}>
        {HITOS.map((h, i) => {
          const on = i === activo;
          const pasado = i < activo;
          return (
            <div key={h.anio} style={{ flex: 1, opacity: on ? 1 : pasado ? 0.55 : 0.32 }}>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: columna ? 34 : 40, color: on ? C.azul : C.texto, letterSpacing: -0.5 }}>{h.anio}</div>
              <div style={{ marginTop: 6 }}>
                <Mono size={columna ? 11 : 13} color={on ? C.texto : C.texto3}>
                  {h.nombre}
                </Mono>
              </div>
              <div style={{ marginTop: 4, fontFamily: SANS, fontSize: columna ? 17 : 20, color: C.texto3 }}>{h.obra}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const LineaTiempo = Object.assign(LineaTiempoBase, { columna: true });
