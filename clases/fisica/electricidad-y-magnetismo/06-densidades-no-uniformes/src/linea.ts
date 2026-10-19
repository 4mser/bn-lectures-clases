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
  { nombre: "Intro", ceja: "01 · La densidad cambia", minimo: 6 },
  { nombre: "Receta", ceja: "02 · La receta", minimo: 6 },
  { nombre: "Componentes", ceja: "03 · Componentes, no módulos", minimo: 6 },
  { nombre: "Barra dq", ceja: "04 · Ejercicio 1 · El elemento", minimo: 6 },
  { nombre: "Barra aportes", ceja: "05 · Ejercicio 1 · Los aportes", minimo: 6 },
  { nombre: "Barra integral", ceja: "06 · Ejercicio 1 · La integral", minimo: 6 },
  { nombre: "Barra revisar", ceja: "07 · Ejercicio 1 · Revisar", minimo: 6 },
  { nombre: "Barra uniforme", ceja: "08 · Ejercicio 1 · La trampa", minimo: 6 },
  { nombre: "Semicírculo", ceja: "09 · Ejercicio 2 · La densidad", minimo: 6 },
  { nombre: "Simetría", ceja: "10 · Ejercicio 2 · La simetría", minimo: 6 },
  { nombre: "Semicírculo integral", ceja: "11 · Ejercicio 2 · La integral", minimo: 6 },
  { nombre: "Fuerza", ceja: "12 · Ejercicio 2 · La fuerza", minimo: 6 },
  { nombre: "Otra herramienta", ceja: "13 · Otra herramienta", minimo: 6 },
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
