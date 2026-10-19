import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Cromo, Fondo } from "./Marco";
import { DURS, FPS, FRAMES, INFO, INICIOS, TOTAL, VOZ, VOZ_DESDE } from "./linea";
import { SANS, lerp } from "./theme";
import type { Sfx } from "./sfx";
import { Intro, sfx00 } from "./escenas/E00Intro";
import { Receta, sfx01 } from "./escenas/E01Receta";
import { Componentes, sfx02 } from "./escenas/E02Componentes";
import { BarraDq, sfx03 } from "./escenas/E03BarraDq";
import { BarraAportes, sfx04 } from "./escenas/E04BarraAportes";
import { BarraIntegral, sfx05 } from "./escenas/E05BarraIntegral";
import { BarraRevisar, sfx06 } from "./escenas/E06BarraRevisar";
import { BarraUniforme, sfx07 } from "./escenas/E07BarraUniforme";
import { Semicirculo, sfx08 } from "./escenas/E08Semicirculo";
import { Simetria, sfx09 } from "./escenas/E09Simetria";
import { SemiIntegral, sfx10 } from "./escenas/E10SemiIntegral";
import { Fuerza, sfx11 } from "./escenas/E11Fuerza";
import { OtraHerramienta, sfx12 } from "./escenas/E12OtraHerramienta";
import { Cierre, sfx13 } from "./escenas/E13Cierre";

// Mismo orden que INFO en linea.ts y que GUION en audio/generar_voz.py.
const ESCENAS: React.FC<{ dur: number }>[] = [
  Intro, Receta, Componentes, BarraDq, BarraAportes, BarraIntegral, BarraRevisar, BarraUniforme, Semicirculo, Simetria, SemiIntegral, Fuerza, OtraHerramienta, Cierre,
];
const SFX: Sfx[] = [...sfx00, ...sfx01, ...sfx02, ...sfx03, ...sfx04, ...sfx05, ...sfx06, ...sfx07, ...sfx08, ...sfx09, ...sfx10, ...sfx11, ...sfx12, ...sfx13];
const VOLUMEN: Record<Sfx[2], number> = { soplido: 0.3, tic: 0.2, check: 0.28, golpe: 0.4, campana: 0.26, alerta: 0.28 };

// Cuánto está hablando la voz en este cuadro (0 a 1), para bajar la música debajo de ella.
const habla = (f: number) => {
  let s = 0;
  INFO.forEach((_, i) => {
    const a = INICIOS[i] + VOZ_DESDE * FPS;
    const b = a + VOZ[i] * FPS;
    s = Math.max(s, Math.min(1, Math.max(0, Math.min((f - a + 10) / 10, (b - f + 14) / 14))));
  });
  return s;
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Video: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: SANS }}>
    <Fondo />
    {ESCENAS.map((Escena, i) => (
      <Sequence key={INFO[i].nombre} name={INFO[i].nombre} from={INICIOS[i]} durationInFrames={FRAMES[i]}>
        <Escena dur={DURS[i]} />
      </Sequence>
    ))}
    <Cromo />
    {INFO.map((e, i) => (
      <Sequence key={`voz${i}`} name={`Voz ${e.nombre}`} from={INICIOS[i] + Math.round(VOZ_DESDE * FPS)} durationInFrames={Math.ceil(VOZ[i] * FPS) + 6}>
        <Audio src={staticFile(`voz/${String(i).padStart(2, "0")}.mp3`)} />
      </Sequence>
    ))}
    {INICIOS.slice(1).map((a, k) => (
      <Sequence key={`sop${k}`} name="Soplido" from={a - 8} durationInFrames={30}>
        <Audio src={staticFile("sfx/soplido.wav")} volume={VOLUMEN.soplido} />
      </Sequence>
    ))}
    {SFX.map(([e, s, n], k) => (
      <Sequence key={`sfx${k}`} name={n} from={Math.max(0, INICIOS[e] + Math.round(s * FPS))} durationInFrames={70}>
        <Audio src={staticFile(`sfx/${n}.wav`)} volume={VOLUMEN[n]} />
      </Sequence>
    ))}
    <Audio
      src={staticFile("musica.wav")}
      volume={(f) => interpolate(f, [0, 30, TOTAL - 80, TOTAL], [0, 1, 1, 0], clamp) * lerp(0.2, 0.075, habla(f))}
    />
  </AbsoluteFill>
);
