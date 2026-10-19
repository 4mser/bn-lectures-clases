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
  { nombre: "Una carga", ceja: "01 · Una carga", minimo: 6 },
  { nombre: "Superposición", ceja: "02 · Superposición", minimo: 6 },
  { nombre: "Miles de millones", ceja: "03 · Miles de millones", minimo: 6 },
  { nombre: "Densidad", ceja: "04 · Densidad", minimo: 6 },
  { nombre: "Paso al límite", ceja: "05 · El paso al límite", minimo: 6 },
  { nombre: "Integral", ceja: "06 · La integral", minimo: 6 },
  { nombre: "Arco", ceja: "07 · Arco", minimo: 6 },
  { nombre: "Anillo", ceja: "08 · Anillo", minimo: 6 },
  { nombre: "Disco", ceja: "09 · Disco", minimo: 6 },
  { nombre: "Plano", ceja: "10 · Plano infinito", minimo: 6 },
  { nombre: "Barra en su eje", ceja: "11 · Barra en su eje", minimo: 6 },
  { nombre: "Mediatriz", ceja: "12 · Barra en su mediatriz", minimo: 6 },
  { nombre: "Barra infinita", ceja: "13 · Barra infinita", minimo: 6 },
  { nombre: "El patrón", ceja: "14 · El patrón", minimo: 6 },
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
