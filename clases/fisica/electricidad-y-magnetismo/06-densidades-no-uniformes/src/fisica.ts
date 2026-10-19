// Constantes y resultados de los dos ejercicios guiados (Clase 2, §3 y §4). Todo número que muestra el video sale de aquí.
// ε₀: CODATA 2022.
export const EPS0 = 8.8541878188e-12;
export const K = 1 / (4 * Math.PI * EPS0);

// ── Ejercicio 1 (§3): barra en a ≤ x ≤ b con λ(x) = αx; P en el origen. ──
export const A = 0.1; // m
export const B = 0.3; // m
export const ALFA = 4.0e-9; // C/m²
// Módulo del campo en P (apunta hacia −x si α > 0): E = kα ln(b/a).
export const campo1 = (a: number, b: number) => K * ALFA * Math.log(b / a);
// Lo mismo por suma directa de aportes kα dx/x (regla del punto medio), para comprobar la integral.
export const campo1Suma = (a: number, b: number, n = 4000) => {
  let s = 0;
  const dx = (b - a) / n;
  for (let i = 0; i < n; i++) {
    const x = a + (i + 0.5) * dx;
    s += (K * ALFA * x * dx) / (x * x);
  }
  return s;
};
// Carga total: Q = α(b² − a²)/2.
export const carga1 = (a: number, b: number) => (ALFA / 2) * (b * b - a * a);
// La misma carga repartida pareja en [a, b], con la fórmula de la barra sobre su prolongación:
// E = kλL / (x₀(x₀ + L)), λ = Q/L, L = b − a, x₀ = a.
export const campoUniforme = (a: number, b: number) => {
  const L = b - a;
  const lam = carga1(a, b) / L;
  return (K * lam * L) / (a * (a + L));
};

// ── Ejercicio 2 (§4): semicírculo de radio R con λ(θ) = λ₀ cos θ, θ desde el eje y; carga total Q. ──
export const Q2 = 12e-6; // C
export const R2 = 0.6; // m
export const QP = -2e-6; // C, carga de prueba en P
export const LAMBDA0 = Q2 / (2 * R2); // C/m
// Carga total por suma directa de λ₀ cos θ R dθ en [−π/2, π/2].
export const carga2Suma = (n = 2000) => {
  let s = 0;
  const d = Math.PI / n;
  for (let i = 0; i < n; i++) s += LAMBDA0 * Math.cos(-Math.PI / 2 + (i + 0.5) * d) * R2 * d;
  return s;
};
// Campo en el punto (px, py) [m], con el centro del semicírculo en el origen, sumando los aportes de θ0 a θ1.
// Cada elemento está en R(sin θ, cos θ).
export const campo2En = (px: number, py: number, th0 = -Math.PI / 2, th1 = Math.PI / 2, n = 800): [number, number] => {
  let ex = 0;
  let ey = 0;
  const d = (th1 - th0) / n;
  for (let i = 0; i < n; i++) {
    const th = th0 + (i + 0.5) * d;
    const dq = LAMBDA0 * Math.cos(th) * R2 * d;
    const rx = px - R2 * Math.sin(th);
    const ry = py - R2 * Math.cos(th);
    const r3 = Math.pow(rx * rx + ry * ry, 1.5);
    ex += (K * dq * rx) / r3;
    ey += (K * dq * ry) / r3;
  }
  return [ex, ey];
};
// Resultado de los apuntes: E(P) = −πkλ₀/(2R) ŷ.
export const E2 = (Math.PI * K * LAMBDA0) / (2 * R2);
// Fuerza sobre q en P: F = qE, con E = −E2 ŷ.
export const F2 = QP * -E2;
