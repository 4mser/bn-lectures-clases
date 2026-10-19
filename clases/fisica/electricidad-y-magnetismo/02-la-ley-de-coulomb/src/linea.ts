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
  { nombre: "Cargas en reposo", ceja: "01 · Cargas en reposo", minimo: 6 },
  { nombre: "La pregunta", ceja: "02 · La pregunta", minimo: 6 },
  { nombre: "Balanza de torsión", ceja: "03 · Balanza de torsión", minimo: 6 },
  { nombre: "Producto de cargas", ceja: "04 · Producto de cargas", minimo: 6 },
  { nombre: "Inverso del cuadrado", ceja: "05 · Inverso del cuadrado", minimo: 6 },
  { nombre: "Fuerza central", ceja: "06 · Fuerza central", minimo: 6 },
  { nombre: "La constante", ceja: "07 · La constante", minimo: 6 },
  { nombre: "Forma vectorial", ceja: "08 · Forma vectorial", minimo: 6 },
  { nombre: "Como Newton", ceja: "09 · Como Newton", minimo: 6 },
  { nombre: "Treinta y nueve órdenes", ceja: "10 · 39 órdenes", minimo: 6 },
  { nombre: "Por qué gana la gravedad", ceja: "11 · Por qué gana la gravedad", minimo: 6 },
  { nombre: "Superposición", ceja: "12 · Superposición", minimo: 6 },
  { nombre: "Tres cargas en línea", ceja: "13 · Tres cargas en línea", minimo: 6 },
  { nombre: "Equilibrio", ceja: "14 · Equilibrio", minimo: 6 },
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
