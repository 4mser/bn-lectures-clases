// Física del campo de cargas puntuales para las escenas: constantes, campo en un punto, líneas de campo completas
// (desde las positivas y, las que faltan, desde las negativas) y flechas de campo. Todo función pura de sus argumentos.
import { TAU, flecha, trazar, type Fuente, type Pt } from "./luz";

// CODATA 2022: permitividad del vacío. k_e = 1/(4π ε₀).
export const EPS0 = 8.8541878188e-12; // F/m
export const KE = 1 / (4 * Math.PI * EPS0); // N·m²/C²
// Velocidad de la luz (exacta, SI) y unidad astronómica (exacta, UAI 2012).
export const C_LUZ = 299792458; // m/s
export const UA = 149597870700; // m

// Campo de un conjunto de fuentes en (x, y), en unidades de q/px² (la escala la pone cada escena).
export const campo = (fuentes: Fuente[], x: number, y: number): Pt => {
  let ex = 0;
  let ey = 0;
  for (const f of fuentes) {
    const dx = x - f.x;
    const dy = y - f.y;
    const r2 = dx * dx + dy * dy;
    if (r2 < 1e-9) continue;
    const k = f.q / (r2 * Math.sqrt(r2));
    ex += k * dx;
    ey += k * dy;
  }
  return [ex, ey];
};

export type Linea = { pts: Pt[]; desde: number; hasta: number }; // índices de las fuentes donde nace y muere (−1: infinito)

// Líneas de campo: n·|q| líneas por carga (n por unidad de carga). Las de las positivas siguen al campo; desde las
// negativas solo se trazan (hacia atrás) las que no vienen de una positiva, para no dibujar dos veces la misma línea.
// fase gira el abanico de salida de cada carga; r0 es el radio donde arranca la línea.
export const lineas = (
  fuentes: Fuente[],
  n: number,
  caja: [number, number, number, number],
  o: { pasos?: number; h?: number; r0?: number; fase?: (i: number) => number } = {},
): Linea[] => {
  const pasos = o.pasos ?? 400;
  const h = o.h ?? 5;
  const r0 = o.r0 ?? 12;
  const cerca = (p: Pt) => fuentes.findIndex((f) => Math.hypot(p[0] - f.x, p[1] - f.y) < h * 2.2);
  const salida: Linea[] = [];
  for (const signo of [1, -1]) {
    fuentes.forEach((f, i) => {
      if (f.q * signo <= 0) return;
      const m = n * Math.abs(f.q);
      const cuantas = Math.floor(m + 1e-9);
      for (let j = 0; j < cuantas; j++) {
        const ang = ((j + 0.5) / m) * TAU + (o.fase ? o.fase(i) : 0);
        const pts = trazar(fuentes, f.x + Math.cos(ang) * r0, f.y + Math.sin(ang) * r0, signo, pasos, h, caja);
        const fin = cerca(pts[pts.length - 1]);
        if (signo < 0 && fin >= 0 && fuentes[fin].q > 0) continue; // ya trazada desde la positiva
        const otra = fin === i ? -1 : fin;
        salida.push(signo > 0 ? { pts, desde: i, hasta: otra } : { pts: pts.reverse(), desde: otra, hasta: i });
      }
    });
  }
  return salida;
};

// Flechas del campo en una grilla: largo proporcional a |E|^pot (comprimido para que se vean todas), con tope.
export const flechasCampo = (
  ctx: CanvasRenderingContext2D,
  fuentes: Fuente[],
  puntos: Pt[],
  escala: number,
  tope: number,
  rgb: string,
  a: number,
  pot = 0.5,
  evita = 40,
) => {
  for (const [x, y] of puntos) {
    if (fuentes.some((f) => Math.hypot(x - f.x, y - f.y) < evita)) continue;
    const [ex, ey] = campo(fuentes, x, y);
    const m = Math.hypot(ex, ey);
    if (m < 1e-12) continue;
    const l = Math.min(tope, escala * Math.pow(m, pot));
    flecha(ctx, x - (ex / m) * l * 0.5, y - (ey / m) * l * 0.5, x + (ex / m) * l * 0.5, y + (ey / m) * l * 0.5, rgb, a * Math.min(1, l / tope + 0.35), 1.6, 9);
  }
};

// Ceros de E_x en el eje y = y0 (donde E_y = 0 por simetría), buscando cambios de signo lejos de las cargas.
export const cerosEje = (fuentes: Fuente[], y0: number, x0: number, x1: number, paso = 2): number[] => {
  const ex = (x: number) => campo(fuentes, x, y0)[0];
  const lejos = (a: number, b: number) => !fuentes.some((f) => f.q !== 0 && f.x >= a - 1 && f.x <= b + 1);
  const ceros: number[] = [];
  for (let a = x0; a < x1; a += paso) {
    const b = a + paso;
    if (!lejos(a, b)) continue;
    let fa = ex(a);
    const fb = ex(b);
    if (fa === 0 || fa * fb > 0) continue;
    let lo = a;
    let hi = b;
    for (let k = 0; k < 50; k++) {
      const m = (lo + hi) / 2;
      const fm = ex(m);
      if (fa * fm <= 0) hi = m;
      else {
        lo = m;
        fa = fm;
      }
    }
    ceros.push((lo + hi) / 2);
  }
  return ceros;
};
