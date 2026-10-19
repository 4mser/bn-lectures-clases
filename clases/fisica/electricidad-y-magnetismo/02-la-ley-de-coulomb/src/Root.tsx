import React from "react";
import { Composition } from "remotion";
import "./theme";
import { Video } from "./Video";
import { FPS, TOTAL } from "./linea";
import { H, TT, W, YT } from "./theme";

// Reel vertical 4:5, como el de B&N Lab sobre la ley de Gauss, y la misma clase en 16:9 para YouTube y en 9:16 para TikTok y Reels.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Clase" component={Video} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="ClaseYT" component={Video} durationInFrames={TOTAL} fps={FPS} width={YT.W} height={YT.H} />
    <Composition id="ClaseTT" component={Video} durationInFrames={TOTAL} fps={FPS} width={TT.W} height={TT.H} />
  </>
);
