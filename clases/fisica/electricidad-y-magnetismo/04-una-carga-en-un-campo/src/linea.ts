import voz from "./voz.json";
import palabras from "./palabras.json";

// Línea de tiempo: cada escena dura lo que dura su voz, más un respiro antes y después.
export const FPS = 30;
export const VOZ_DESDE = 0.45;
const COLA = 0.9;
export const SOLAPE = 12; // cuadros en que una escena sale mientras la siguiente entra

// ceja: el rótulo mono sobre el título, como «LEY DE GAUSS · 04 · QUÉ ES EL FLUJO» en el reel de B&N Lab.
type Info = { nombre: string; ceja: string; minimo: number };

// Mismo orden que GUION en audio/generar_voz.py.
export const INFO: Info[] = [
  { nombre: "Campo uniforme", ceja: "01 · Campo uniforme", minimo: 6 },
  { nombre: "El signo", ceja: "02 · El signo decide", minimo: 6 },
  { nombre: "Gravedad", ceja: "03 · Con gravedad", minimo: 6 },
  { nombre: "Razón q/m", ceja: "04 · La razón q/m", minimo: 6 },
  { nombre: "Tres lanzamientos", ceja: "05 · Tres lanzamientos", minimo: 6 },
  { nombre: "Parábola", ceja: "06 · La parábola", minimo: 6 },
  { nombre: "Tiro parabólico", ceja: "07 · Tiro parabólico", minimo: 6 },
  { nombre: "Línea y trayectoria", ceja: "08 · Línea y trayectoria", minimo: 6 },
  { nombre: "Electrón", ceja: "09 · Un electrón", minimo: 6 },
  { nombre: "Despreciable", ceja: "10 · Frente a la gravedad", minimo: 6 },
  { nombre: "Un centímetro", ceja: "11 · Un centímetro", minimo: 6 },
  { nombre: "Ambos campos", ceja: "12 · Los dos campos", minimo: 6 },
  { nombre: "Cierre", ceja: "BN Lab Simulations", minimo: 6 },
];

export const DURS = INFO.map((e, i) => Math.max(e.minimo, VOZ_DESDE + voz[i] + COLA + (i === INFO.length - 1 ? 3 : 0)));
export const FRAMES = DURS.map((d) => Math.round(d * FPS));
export const INICIOS: number[] = [];
let acumulado = 0;
FRAMES.forEach((f) => {
  INICIOS.push(acumulado);
  acumulado += f - SOLAPE;
});
export const TOTAL = acumulado + SOLAPE;
export const VOZ: number[] = voz;

// Momento (en segundos desde el inicio de la escena) en que la voz dice una palabra.
const normal = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
export const w = (escena: number, palabra: string, n = 0): number => {
  let k = 0;
  for (const [p, t] of (palabras as [string, number][][])[escena]) {
    if (normal(p) === normal(palabra)) {
      if (k === n) return VOZ_DESDE + t;
      k++;
    }
  }
  throw new Error(`No encontré "${palabra}" (${n}) en la voz de la escena ${escena}`);
};
// Fin de la voz de una escena, en segundos desde su inicio.
export const finVoz = (escena: number) => VOZ_DESDE + voz[escena];
