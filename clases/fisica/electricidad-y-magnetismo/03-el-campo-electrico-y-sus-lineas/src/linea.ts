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
  { nombre: "Acción a distancia", ceja: "01 · Acción a distancia", minimo: 6 },
  { nombre: "Faraday", ceja: "02 · Faraday", minimo: 6 },
  { nombre: "Maxwell", ceja: "03 · Maxwell", minimo: 6 },
  { nombre: "Definición", ceja: "04 · Qué es el campo", minimo: 6 },
  { nombre: "Convención", ceja: "05 · Carga de prueba", minimo: 6 },
  { nombre: "Carga puntual", ceja: "06 · Carga puntual", minimo: 6 },
  { nombre: "Superposición", ceja: "07 · Superposición", minimo: 6 },
  { nombre: "Tangente", ceja: "08 · Líneas de fuerza", minimo: 6 },
  { nombre: "Reglas", ceja: "09 · Nacen y mueren", minimo: 6 },
  { nombre: "Densidad", ceja: "10 · Densidad de líneas", minimo: 6 },
  { nombre: "Cuatro combinaciones", ceja: "11 · Cuatro combinaciones", minimo: 6 },
  { nombre: "Dónde se anula", ceja: "12 · Dónde se anula", minimo: 6 },
  { nombre: "Igualar no basta", ceja: "13 · Igualar no basta", minimo: 6 },
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
