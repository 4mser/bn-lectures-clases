<p align="center">
  <img src="../../../../docs/assets/06-densidades-no-uniformes.gif" width="480" alt="Un semicírculo cargado con densidad λ₀ cos θ, más brillante arriba, junto al título «Ejercicio 2: un semicírculo más cargado arriba»">
</p>

<p align="center">
  <!-- TODO: reemplazar por el enlace de YouTube de esta clase cuando esté publicada -->
  <a href="TODO-youtube-clase-6"><b>Ver la clase</b></a> &nbsp;·&nbsp;
  <a href="../README.md"><b>Electricidad y Magnetismo</b></a> &nbsp;·&nbsp;
  <a href="../apuntes/"><b>Apuntes</b></a> &nbsp;·&nbsp;
  <a href="https://bnsolutions.cl/lectures"><b>bnsolutions.cl/lectures</b></a>
</p>

**Clase 6 de 6 · Densidades no uniformes.** La segunda parte de «De lo discreto a lo continuo», ahora con densidades que cambian de un punto a otro. La clase fija la receta de siete pasos y la aplica a dos ejercicios guiados. La densidad se ve en el brillo y el grosor de la distribución.

### `// 01` De qué trata

Se suman componentes, no módulos. En la barra con λ = αx, E = kα ln(b/a); la misma carga repartida de forma pareja da otro campo. En el semicírculo con λ₀ cos θ, la simetría par cancela las horizontales y queda E = πkλ₀ / 2R.

| | |
|---|---|
| **Basada en** | Clase 2 de los apuntes, secciones 2 a 4 y 6: la receta de siete pasos y dos ejercicios guiados, una barra con λ(x) = αx y un semicírculo con λ(θ) = λ₀ cos θ. |
| **Duración** | Unos 2:40 min, a 30 cuadros por segundo |
| **Formatos** | `Clase` (4:5, 1080×1350), `ClaseYT` (16:9, 1920×1080) y `ClaseTT` (9:16, 1080×1920). Comparten escenas, voz, música y tiempos |
| **Video** | `TODO`: enlace de YouTube cuando esté publicada |
| **Lo que viene** | Termina anunciando la ley de Gauss. |

### `// 02` Escenas y su física

| # | Escena | Archivo | Qué muestra |
|---|---|---|---|
| 01 | La densidad cambia | `E00Intro.tsx` | De densidades uniformes a una λ que cambia de un punto a otro. |
| 02 | La receta | `E01Receta.tsx` | Los siete pasos: fijar P, escribir dq, armar la geometría, aplicar Coulomb, usar la simetría, integrar y revisar. |
| 03 | Componentes, no módulos | `E02Componentes.tsx` | Sumar los largos da un resultado más grande que el campo real. |
| 04 | Ejercicio 1 · El elemento | `E03BarraDq.tsx` | Barra de a a b con λ = αx: dq = αx dx. |
| 05 | Ejercicio 1 · Los aportes | `E04BarraAportes.tsx` | P en el origen, r = x: todos los aportes sobre el eje y cada uno cae como 1/x. |
| 06 | Ejercicio 1 · La integral | `E05BarraIntegral.tsx` | E = kα ln(b/a): con 10 y 30 cm y α = 4 nC/m², 39,5 N/C. |
| 07 | Ejercicio 1 · Revisar | `E06BarraRevisar.tsx` | Si b tiende a a, el campo se apaga; la carga total es 0,16 nC. |
| 08 | Ejercicio 1 · La trampa | `E07BarraUniforme.tsx` | La misma carga repartida de forma pareja da 47,9 N/C: importa cómo se reparte. |
| 09 | Ejercicio 2 · La densidad | `E08Semicirculo.tsx` | 12 µC en un semicírculo de 60 cm con λ = λ₀ cos θ: Q = 2λ₀R y λ₀ = 10 µC/m. |
| 10 | Ejercicio 2 · La simetría | `E09Simetria.tsx` | El coseno es par: las componentes horizontales se cancelan de a pares. |
| 11 | Ejercicio 2 · La integral | `E10SemiIntegral.tsx` | ∫cos²θ dθ = π/2 y E = πkλ₀/2R ≈ 235 294 N/C, hacia abajo. |
| 12 | Ejercicio 2 · La fuerza | `E11Fuerza.tsx` | F = qE sobre −2 µC: 0,471 N hacia arriba, opuesta al campo. |
| 13 | Otra herramienta | `E12OtraHerramienta.tsx` | Basta mover P para que la integral se complique. |
| 14 | Cierre | `E13Cierre.tsx` | Créditos y lo que viene: la ley de Gauss. |

Cada escena dura lo que dura su frase en la voz, más un respiro. Las animaciones se anclan a palabras del guion con `w(escena, "palabra")` (`src/linea.ts`), así que se mueven solas si la voz cambia.

### `// 03` El guion

Una frase por escena, en el orden de `src/linea.ts`. Es el texto de `audio/generar_voz.py`, escrito como se pronuncia: los símbolos van con letras («cu E» es qE).

<details>
<summary>Leer el guion completo</summary>

1. **La densidad cambia.** Hasta ahora, todas las densidades eran uniformes. Pero la carga no siempre se reparte pareja. Hoy, dos ejercicios donde lambda cambia de un punto a otro.
2. **La receta.** Siempre la misma receta, en siete pasos. Fijar P. Escribir de cu. Armar la geometría. Aplicar Coulomb. Usar la simetría, si existe. Integrar. Y revisar.
3. **Componentes, no módulos.** Una regla que no se negocia: se suman componentes, no módulos. Si sumamos los largos, el resultado sale más grande que el campo real.
4. **Ejercicio 1 · El elemento.** Primer ejercicio. Una barra va de a hasta b, con lambda igual a alfa equis: la densidad crece hacia la derecha. Cada trocito aporta de cu igual a alfa equis de equis.
5. **Ejercicio 1 · Los aportes.** P está en el origen, así que erre es igual a equis. Todos los aportes van sobre el eje: nada que cancelar. Los trozos lejanos tienen más carga, pero cada aporte cae como uno sobre equis.
6. **Ejercicio 1 · La integral.** Sumamos de a hasta b, y la integral es el logaritmo de b sobre a. Con diez y treinta centímetros, y alfa igual a cuatro nanocoulomb por metro cuadrado, el campo es treinta y nueve coma cinco newton por coulomb.
7. **Ejercicio 1 · Revisar.** Revisamos. Si b se acerca a a, la barra desaparece y el campo tiende a cero, como debe ser. La carga total es cero coma dieciséis nanocoulomb.
8. **Ejercicio 1 · La trampa.** Si repartimos esa misma carga de forma pareja, la fórmula de la barra uniforme da cuarenta y siete coma nueve. La misma carga total no basta: importa cómo se reparte.
9. **Ejercicio 2 · La densidad.** Segundo ejercicio. Doce microcoulomb en un semicírculo de sesenta centímetros, con lambda igual a lambda cero por coseno de theta: máxima arriba, nula en los extremos. La carga total es dos lambda cero erre, y lambda cero vale diez microcoulomb por metro.
10. **Ejercicio 2 · La simetría.** Como el coseno es par, los trozos en más theta y menos theta tienen la misma carga, y sus componentes horizontales se cancelan. La densidad no es uniforme, pero sí es par.
11. **Ejercicio 2 · La integral.** Sobrevive la vertical. La integral de coseno cuadrado da pi medios, y el campo en P es pi ka lambda cero sobre dos erre: unos doscientos treinta y cinco mil newton por coulomb, hacia abajo.
12. **Ejercicio 2 · La fuerza.** Con el campo listo, la fuerza sobre menos dos microcoulomb es una multiplicación: cero coma cuarenta y siete newton, hacia arriba, opuesta al campo.
13. **Otra herramienta.** Integrar sirve para cualquier distribución. Pero basta mover P y las cuentas se vuelven difíciles. Necesitamos otra herramienta.
14. **Cierre.** Cada número de este video se calculó en vivo. Lo que viene: la ley de Gauss.

</details>

### `// 04` Cómo renderizarla

Necesitas Node.js 20 o superior y Python 3. Desde la raíz del repositorio:

```bash
cd clases/fisica/electricidad-y-magnetismo/06-densidades-no-uniformes
npm ci
python3 -m venv .venv && source .venv/bin/activate
pip install -r ../../../../requirements.txt

python audio/generar_voz.py            # voz → public/voz/NN.mp3, src/voz.json y src/palabras.json
python audio/generar_musica.py 165      # música y efectos → public/musica.wav y public/sfx/
npx tsc --noEmit

node herramientas/cuadros.mjs out/cuadros $(python herramientas/marcas.py 4:mitad 4:fin) ClaseYT   # cuadros sueltos

python herramientas/render.py 600 2 Clase     # → out/Densidades-no-uniformes.mp4        (4:5)
python herramientas/render.py 600 2 ClaseYT   # → out/Densidades-no-uniformes-16x9.mp4   (16:9)
python herramientas/render.py 600 2 ClaseTT   # → out/Densidades-no-uniformes-9x16.mp4   (9:16)
```

- **La voz no viene en el repositorio.** `generar_voz.py` la vuelve a generar con edge-tts (voz `es-CL-LorenzoNeural`, a +8 %): manda el texto del guion al servicio de voz de Microsoft y guarda el mp3 de cada escena junto con el momento en que empieza cada palabra. Con `python audio/generar_voz.py 3 7` regenera solo esas escenas. Si una palabra cae en otro momento, la animación la sigue; si el guion cambia y una escena pide una palabra que la voz ya no dice, `w()` avisa con un error.
- **La música sí se genera aquí.** `generar_musica.py` la sintetiza con numpy a partir de la duración en segundos (la del video más 5) y sale igual cada vez.
- **Sin voz ni música** igual puedes revisar cuadros sueltos con `cuadros.mjs`: Remotion avisa que faltan los audios y dibuja el cuadro. `marcas.py` traduce `escena:segundo`, `escena:mitad` o `escena:fin` a números de cuadro.
- **`render.py`** recibe el tamaño del tramo en cuadros, la concurrencia y la composición. Renderiza por tramos, cada uno en su propio proceso y con reintentos, y los une sin recodificar. Reutiliza los tramos que ya existen en `out/partes*/`: para rehacer uno, borra su `vNN.mp4` (y `audio.wav` si cambió la voz o la música).

### `// 05` Notas

- Todas las cifras salen de `src/fisica.ts` (ε₀ de CODATA 2022) y se comprueban por suma directa al cargar las escenas.
- Los apuntes dan E(P) ≈ 235 619,4 N/C en el ejercicio 2, que corresponde a k = 9 × 10⁹; con k de CODATA el video muestra 235 294 N/C. La fuerza redondea igual (0,471 N).
- `barra.ts` y `semi.ts` tienen la geometría compartida de cada ejercicio, y `src/lab/densidad.ts` dibuja distribuciones con densidad variable.

### `// 06` Equipo

Esta clase se basa en los «Apuntes de Electricidad y Magnetismo» de **Javier Patiño**, que están en [`../apuntes/`](../apuntes/). Se armó desde la plantilla de la serie, que parte de «De lo discreto a lo continuo», la clase de **Benjamín Campos**.

| | |
|---|---|
| **Nicolás Moreno**<br>[@4mser](https://github.com/4mser) | Cofundador de B&N Solutions e ingeniero de software. Creó el motor de simulación de B&N Lab y desarrolla las animaciones y los videos. |
| **Benjamín Campos**<br>[@B3njjaman](https://github.com/B3njjaman) | Cofundador de B&N Solutions e ingeniero físico. Autor de la clase «De lo discreto a lo continuo». |
| **Javier Patiño** | Licenciado en Física y profesor de Electricidad y Magnetismo. Autor de los apuntes en que se basan las clases y la voz de B&N Lectures. |

---

<p align="center">
  <img src="../../../../docs/assets/footer.svg" width="100%" alt="Líneas de campo de un dipolo que fluyen entre dos cargas, con el texto cuadro = f(t, voz) y bnsolutions.cl/lectures">
</p>
