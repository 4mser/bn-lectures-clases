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
  { nombre: "El ámbar", ceja: "01 · El ámbar", minimo: 6 },
  { nombre: "Gilbert y Guericke", ceja: "02 · Gilbert y Guericke", minimo: 6 },
  { nombre: "Gray", ceja: "03 · Gray", minimo: 6 },
  { nombre: "Du Fay", ceja: "04 · Du Fay", minimo: 6 },
  { nombre: "Franklin", ceja: "05 · Franklin", minimo: 6 },
  { nombre: "Priestley", ceja: "06 · Priestley", minimo: 6 },
  { nombre: "Coulomb", ceja: "07 · Coulomb", minimo: 6 },
  { nombre: "Rutherford", ceja: "08 · Rutherford", minimo: 6 },
  { nombre: "La escala", ceja: "09 · La escala", minimo: 6 },
  { nombre: "Bohr", ceja: "10 · Bohr", minimo: 6 },
  { nombre: "Millikan", ceja: "11 · Millikan", minimo: 6 },
  { nombre: "Múltiplos enteros", ceja: "12 · Múltiplos enteros", minimo: 6 },
  { nombre: "Un coulomb", ceja: "13 · Un coulomb", minimo: 6 },
  { nombre: "Electrización", ceja: "14 · Electrización", minimo: 6 },
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
