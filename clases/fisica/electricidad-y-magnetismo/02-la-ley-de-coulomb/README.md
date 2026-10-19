<p align="center">
  <img src="../../../../docs/assets/02-la-ley-de-coulomb.gif" width="480" alt="Vista superior de una balanza de torsión: la varilla gira hasta el equilibrio mientras el HUD muestra el giro y la razón de torques">
</p>

<p align="center">
  <!-- TODO: reemplazar por el enlace de YouTube de esta clase cuando esté publicada -->
  <a href="TODO-youtube-clase-2"><b>Ver la clase</b></a> &nbsp;·&nbsp;
  <a href="../README.md"><b>Electricidad y Magnetismo</b></a> &nbsp;·&nbsp;
  <a href="../apuntes/"><b>Apuntes</b></a> &nbsp;·&nbsp;
  <a href="https://bnsolutions.cl/lectures"><b>bnsolutions.cl/lectures</b></a>
</p>

**Clase 2 de 6 · La ley de Coulomb.** Cómo se pasó de «se atraen o se repelen» a un número. La clase reconstruye los tres hallazgos de Coulomb con la balanza de torsión, arma la ley con su constante, la escribe como vector y la compara con la gravitación, para cerrar con superposición y equilibrio.

### `// 01` De qué trata

F = kₑ |q₁||q₂| / r², con kₑ = 1/(4πε₀) calculada desde ε₀ de CODATA 2022. Entre el protón y el electrón del hidrógeno, la fuerza eléctrica gana por 39 órdenes de magnitud; aun así manda la gravedad, porque la materia es neutra.

| | |
|---|---|
| **Basada en** | Clase 1 de los apuntes, secciones 6, 7 y 8: el problema de la electrostática y la carga puntual, la ley de Coulomb (balanza de torsión, los tres hallazgos, enunciado y constantes, forma vectorial, comparación con la gravitación) y el principio de superposición. |
| **Duración** | Unos 2:58 min, a 30 cuadros por segundo |
| **Formatos** | `Clase` (4:5, 1080×1350), `ClaseYT` (16:9, 1920×1080) y `ClaseTT` (9:16, 1080×1920). Comparten escenas, voz, música y tiempos |
| **Video** | `TODO`: enlace de YouTube cuando esté publicada |
| **Lo que viene** | Termina anunciando el campo eléctrico y sus líneas. |

### `// 02` Escenas y su física

| # | Escena | Archivo | Qué muestra |
|---|---|---|---|
| 01 | Cargas en reposo | `E00Reposo.tsx` | Dos esferas cargadas que se achican hasta ser cargas puntuales; HUD: tamaño ÷ distancia. |
| 02 | La pregunta | `E01Pregunta.tsx` | Atracción y repulsión ya se conocían; faltaba el número. |
| 03 | Balanza de torsión | `E02Balanza.tsx` | Vista superior: la varilla gira y se amortigua hasta el equilibrio κθ = Fℓ; HUD: giro y razón de torques. |
| 04 | Producto de cargas | `E03Producto.tsx` | q₂ se duplica y la fuerza se duplica. |
| 05 | Inverso del cuadrado | `E04Cuadrado.tsx` | La separación se duplica y la fuerza queda en un cuarto; curva 1/r² con el punto en vivo. |
| 06 | Fuerza central | `E05Central.tsx` | Las cuatro combinaciones de signo y el par F₂₁ = −F₁₂. |
| 07 | La constante | `E06Constante.tsx` | F = kₑ|q₁||q₂|/r² y kₑ = 1/(4πε₀), calculada desde ε₀ (CODATA 2022). |
| 08 | Forma vectorial | `E07Vector.tsx` | r₁, r₂ y r₁₂ en ejes; q₂ gira y cambia de signo; HUD: el unitario de 1 a 2. |
| 09 | Como Newton | `E08Newton.tsx` | Masas que solo se atraen y cargas que se atraen o repelen; G y k. |
| 10 | 39 órdenes | `E09Ordenes.tsx` | Hidrógeno (r = 5,3 × 10⁻¹¹ m): Fₑ y F_g en escala logarítmica; la razón no cambia con r. |
| 11 | Por qué gana la gravedad | `E10Neutra.tsx` | Protones y electrones que se agregan: la carga neta vuelve a cero y la masa crece. |
| 12 | Superposición | `E11Superposicion.tsx` | Cinco cargas sobre q₀: aportes, suma punta con cola y fuerza neta. |
| 13 | Tres cargas en línea | `E12Linea.tsx` | Ejemplo 3 de los apuntes: +2 µC, −3 µC y q₀ = +1 µC; F₁, F₂ y la neta. |
| 14 | Equilibrio | `E13Equilibrio.tsx` | Entre q y 4q, q₀ se acomoda en d/3; ΣF = ma. |
| 15 | Cierre | `E14Cierre.tsx` | Dipolo con sus líneas, créditos y logo. |

Cada escena dura lo que dura su frase en la voz, más un respiro. Las animaciones se anclan a palabras del guion con `w(escena, "palabra")` (`src/linea.ts`), así que se mueven solas si la voz cambia.

### `// 03` El guion

Una frase por escena, en el orden de `src/linea.ts`. Es el texto de `audio/generar_voz.py`, escrito como se pronuncia: los símbolos van con letras («cu E» es qE).

<details>
<summary>Leer el guion completo</summary>

1. **Cargas en reposo.** La electrostática estudia cargas en reposo. Su modelo más simple es la carga puntual: toda la carga en un punto. Sirve si el cuerpo es mucho más chico que las distancias.
2. **La pregunta.** Que dos cargas se atraen o se repelen, ya se sabía. La pregunta es cuánto: queremos un número, con unidades. Coulomb lo midió en mil setecientos ochenta y cinco.
3. **Balanza de torsión.** Usó una balanza de torsión. La repulsión entre dos esferas hace girar una varilla, y la fibra se retuerce hasta equilibrarla. Así, una fuerza diminuta se lee como un ángulo bien visible: efe igual a kappa theta sobre ele.
4. **Producto de cargas.** Primer hallazgo: la fuerza es proporcional al producto de las cargas. Si duplicas una de ellas, la fuerza se duplica.
5. **Inverso del cuadrado.** Segundo: la fuerza cae con el cuadrado de la distancia. Al doble de separación, queda un cuarto. Hoy ese exponente dos está comprobado hasta unas pocas partes en diez a la dieciséis.
6. **Fuerza central.** Tercero: la fuerza apunta por la recta que une las cargas. Signos iguales se repelen, signos opuestos se atraen. Y las dos fuerzas forman un par de acción y reacción.
7. **La constante.** Juntando todo: efe igual a ka, por cu uno por cu dos, sobre erre al cuadrado. La constante ka es uno sobre cuatro pi épsilon cero: casi nueve mil millones, en unidades del sistema internacional.
8. **Forma vectorial.** Como vector, la fuerza sigue a erre uno dos, de la carga uno a la dos. Si el producto de las cargas es negativo, se invierte. Y siempre, efe dos uno es menos efe uno dos.
9. **Como Newton.** La gravitación de Newton tiene la misma forma: masa por masa, sobre erre al cuadrado. Pero hay dos diferencias. La gravedad solo atrae. Y su constante es diminuta al lado de ka.
10. **39 órdenes.** Comparemos el protón y el electrón del hidrógeno. Como las dos fuerzas van con uno sobre erre al cuadrado, la razón no depende de la distancia. La eléctrica es más de diez a la treinta y nueve veces la gravitatoria: treinta y nueve órdenes de magnitud.
11. **Por qué gana la gravedad.** Entonces, ¿por qué la gravedad gobierna el universo? Porque la materia es neutra: las cargas positivas y negativas se cancelan casi exactamente. La masa, en cambio, siempre suma.
12. **Superposición.** Con más cargas, rige la superposición: la fuerza entre dos cargas no cambia por la presencia de otras. Sobre la carga de prueba, la fuerza neta es la suma vectorial de cada aporte.
13. **Tres cargas en línea.** Un ejemplo: más dos microcoulomb en el origen, menos tres a veinte centímetros, y una carga de prueba a cincuenta. La segunda, más cerca, gana: la neta apunta hacia la carga negativa.
14. **Equilibrio.** La fuerza eléctrica entra al mismo balance de Newton. En equilibrio, la suma es cero, aunque ninguna fuerza lo sea. Entre cu y cuatro cu, la carga de prueba queda quieta a un tercio del camino.
15. **Cierre.** Cada número de este video se calculó en vivo. Lo que viene: el campo eléctrico y sus líneas.

</details>

### `// 04` Cómo renderizarla

Necesitas Node.js 20 o superior y Python 3. Desde la raíz del repositorio:

```bash
cd clases/fisica/electricidad-y-magnetismo/02-la-ley-de-coulomb
npm ci
python3 -m venv .venv && source .venv/bin/activate
pip install -r ../../../../requirements.txt

python audio/generar_voz.py            # voz → public/voz/NN.mp3, src/voz.json y src/palabras.json
python audio/generar_musica.py 184      # música y efectos → public/musica.wav y public/sfx/
npx tsc --noEmit

node herramientas/cuadros.mjs out/cuadros $(python herramientas/marcas.py 4:mitad 4:fin) ClaseYT   # cuadros sueltos

python herramientas/render.py 600 2 Clase     # → out/La-ley-de-Coulomb.mp4        (4:5)
python herramientas/render.py 600 2 ClaseYT   # → out/La-ley-de-Coulomb-16x9.mp4   (16:9)
python herramientas/render.py 600 2 ClaseTT   # → out/La-ley-de-Coulomb-9x16.mp4   (9:16)
```

- **La voz no viene en el repositorio.** `generar_voz.py` la vuelve a generar con edge-tts (voz `es-CL-LorenzoNeural`, a +8 %): manda el texto del guion al servicio de voz de Microsoft y guarda el mp3 de cada escena junto con el momento en que empieza cada palabra. Con `python audio/generar_voz.py 3 7` regenera solo esas escenas. Si una palabra cae en otro momento, la animación la sigue; si el guion cambia y una escena pide una palabra que la voz ya no dice, `w()` avisa con un error.
- **La música sí se genera aquí.** `generar_musica.py` la sintetiza con numpy a partir de la duración en segundos (la del video más 5) y sale igual cada vez.
- **Sin voz ni música** igual puedes revisar cuadros sueltos con `cuadros.mjs`: Remotion avisa que faltan los audios y dibuja el cuadro. `marcas.py` traduce `escena:segundo`, `escena:mitad` o `escena:fin` a números de cuadro.
- **`render.py`** recibe el tamaño del tramo en cuadros, la concurrencia y la composición. Renderiza por tramos, cada uno en su propio proceso y con reintentos, y los une sin recodificar. Reutiliza los tramos que ya existen en `out/partes*/`: para rehacer uno, borra su `vNN.mp4` (y `audio.wav` si cambió la voz o la música).

### `// 05` Notas

- Todas las cifras se calculan en el código: kₑ desde ε₀, las fuerzas del hidrógeno y su razón (2,27 × 10³⁹), las fuerzas del Ejemplo 3 (0,072 N, 0,300 N y −0,228 N con kₑ = 8,988 × 10⁹) y el punto de equilibrio d/(1 + √4). Los apuntes redondean con kₑ ≈ 9,0 × 10⁹ y dan ≈ 2 × 10³⁹ y −0,23 N.
- Las escenas de la balanza, el producto de cargas, el inverso del cuadrado, la superposición y el equilibrio usan unidades relativas: la balanza muestra la razón entre el torque de la fibra y el eléctrico, no newtons.
- Las constantes están en `src/fisica.tsx` (CODATA 2022) junto con la notación científica; las piezas de dibujo nuevas (carga por signo, fuerza, esfera, masa), en `src/lab/cargas.ts`.

### `// 06` Equipo

Esta clase se basa en los «Apuntes de Electricidad y Magnetismo» de **Javier Patiño**, que están en [`../apuntes/`](../apuntes/). Se armó desde la plantilla de la serie, que parte del reel original de **Benjamín Campos**, «De lo discreto a lo continuo».

| | |
|---|---|
| **Nicolás Moreno**<br>[@4mser](https://github.com/4mser) | Cofundador de B&N Solutions e ingeniero de software. Desarrolla el motor de animación, las simulaciones y los videos. |
| **Benjamín Campos**<br>[@B3njjaman](https://github.com/B3njjaman) | Cofundador de B&N Solutions e ingeniero físico. Creó el reel original de la serie y su motor de simulación. |
| **Javier Patiño** | Licenciado en Física y profesor de Electricidad y Magnetismo. Autor de los apuntes en que se basan las clases y la voz de B&N Lectures. |

---

<p align="center">
  <img src="../../../../docs/assets/footer.svg" width="100%" alt="Líneas de campo de un dipolo que fluyen entre dos cargas, con el texto cuadro = f(t, voz) y bnsolutions.cl/lectures">
</p>
