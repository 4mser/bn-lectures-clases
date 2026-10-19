<p align="center">
  <img src="../../../../docs/assets/01-del-ambar-a-la-carga-elemental.gif" width="480" alt="Partículas alfa lanzadas contra una lámina de oro; una de ellas rebota, junto al título «Una de cada varios miles rebota: hay un núcleo»">
</p>

<p align="center">
  <!-- TODO: reemplazar por el enlace de YouTube de esta clase cuando esté publicada -->
  <a href="TODO-youtube-clase-1"><b>Ver la clase</b></a> &nbsp;·&nbsp;
  <a href="../README.md"><b>Electricidad y Magnetismo</b></a> &nbsp;·&nbsp;
  <a href="../apuntes/"><b>Apuntes</b></a> &nbsp;·&nbsp;
  <a href="https://bnsolutions.cl/lectures"><b>bnsolutions.cl/lectures</b></a>
</p>

**Clase 1 de 6 · Del ámbar a la carga elemental.** La historia de la carga eléctrica, de Tales a Millikan, contada con una simulación por escena. Parte con un trozo de ámbar que atrae plumas, pasa por los dos tipos de electricidad, la ley del inverso del cuadrado y el núcleo atómico, y termina en la gota de aceite que mostró que la carga viene en múltiplos enteros de e.

### `// 01` De qué trata

La carga tiene dos signos, se conserva y está cuantizada. Cada experimento histórico aparece funcionando: la balanza gira según θ = θ₀ (d₀/d)², las alfas se integran contra los núcleos con repulsión 1/r² y las gotas de Millikan se frenan hasta que qE iguala a mg.

| | |
|---|---|
| **Basada en** | Clase 1 de los apuntes, secciones 4 y 5: la historia que comienza con un trozo de ámbar y la carga eléctrica en la estructura de la materia (Rutherford, Bohr, Millikan, qué tan grande es un coulomb, signo, cuantización y conservación, electrización). |
| **Duración** | Unos 2:58 min, a 30 cuadros por segundo |
| **Formatos** | `Clase` (4:5, 1080×1350), `ClaseYT` (16:9, 1920×1080) y `ClaseTT` (9:16, 1080×1920). Comparten escenas, voz, música y tiempos |
| **Video** | `TODO`: enlace de YouTube cuando esté publicada |
| **Lo que viene** | Termina anunciando la ley de Coulomb. |

### `// 02` Escenas y su física

| # | Escena | Archivo | Qué muestra |
|---|---|---|---|
| 01 | Cuenta la tradición | `E00Ambar.tsx` | Ámbar frotado que atrae plumas y pajitas; los «2 600 años» se calculan desde ~600 a. C. |
| 02 | Gilbert y Guericke | `E01Guericke.tsx` | Muchas sustancias se electrizan; el globo de azufre de Guericke se carga al girar. |
| 03 | Conductores y aisladores | `E02Gray.tsx` | Un hilo conductor y uno aislante; el HUD cuenta las cargas que llegan al otro extremo. |
| 04 | Dos clases de carga | `E03DuFay.tsx` | Péndulos vítrea–vítrea y vítrea–resinosa: iguales se repelen, distintas se atraen. |
| 05 | Conservación | `E04Franklin.tsx` | Vidrio y paño intercambian cargas negativas; el HUD suma la carga de cada cuerpo y el total, que no cambia. |
| 06 | La ley 1/r² | `E05Priestley.tsx` | Cáscara esférica de 1 600 cargas; la fuerza sobre una carga de prueba se suma en vivo: 1 afuera, 0 adentro. |
| 07 | Balanza de torsión | `E06Coulomb.tsx` | A la mitad de distancia, cuatro veces la fuerza: θ = θ₀ (d₀/d)². |
| 08 | El núcleo | `E07Rutherford.tsx` | Partículas alfa integradas con repulsión 1/r² contra los núcleos de una lámina; el ángulo de rebote se calcula. |
| 09 | La escala | `E08Escala.tsx` | Zoom logarítmico de 10⁻¹⁰ a 10⁻¹⁵ m con barra de escala en vivo: núcleo de 1 cm, átomo de 1 km. |
| 10 | Bohr | `E09Bohr.tsx` | El electrón clásico radia y cae en espiral; luego, órbitas estacionarias. |
| 11 | Millikan | `E10Millikan.tsx` | Gotas entre placas: qE/mg sube hasta 1 y la velocidad límite llega a 0. |
| 12 | Múltiplos de e | `E11Multiplos.tsx` | Cargas medidas que se apilan en n·e, con e exacta (SI 2019). |
| 13 | Un coulomb | `E12Coulomb.tsx` | Regla logarítmica con 1/e, 10 nC/e y 1 nC/e calculados. |
| 14 | Electrización | `E13Electrizacion.tsx` | Contacto e inducción con tierra; el HUD cuenta la carga neta del cuerpo B. |
| 15 | Cierre | `E14Cierre.tsx` | Un par + y − con sus líneas de campo y los créditos. |

Cada escena dura lo que dura su frase en la voz, más un respiro. Las animaciones se anclan a palabras del guion con `w(escena, "palabra")` (`src/linea.ts`), así que se mueven solas si la voz cambia.

### `// 03` El guion

Una frase por escena, en el orden de `src/linea.ts`. Es el texto de `audio/generar_voz.py`, escrito como se pronuncia: los símbolos van con letras («cu E» es qE).

<details>
<summary>Leer el guion completo</summary>

1. **Cuenta la tradición.** Cuenta la tradición que, hace unos dos mil seiscientos años, Tales de Mileto frotó un trozo de ámbar, y este atrajo plumas y pajitas. En griego, ámbar se dice élektron.
2. **Gilbert y Guericke.** En mil seiscientos, William Gilbert mostró que muchas sustancias se electrizan al frotarlas. Hacia mil seiscientos sesenta, Otto von Guericke hizo girar un globo de azufre: por fin se podía electrizar a voluntad.
3. **Conductores y aisladores.** En mil setecientos veintinueve, Stephen Gray llevó la electrización por cientos de metros de hilo húmedo. Unos materiales la transmiten y otros no: conductores y aislantes.
4. **Dos clases de carga.** En mil setecientos treinta y tres, Charles du Fay distinguió dos clases: la vítrea y la resinosa. Las del mismo tipo se repelen; las de distinto tipo se atraen.
5. **Conservación.** Hacia mil setecientos cincuenta, Benjamin Franklin propuso un solo fluido, en exceso o en defecto: positivo y negativo. Al frotar, la carga pasa de un cuerpo al otro, y la carga total se conserva.
6. **La ley 1/r².** En mil setecientos sesenta y siete, Joseph Priestley notó que dentro de un conductor hueco cargado no hay fuerza. Como en la gravedad de Newton, eso exige una ley de uno sobre erre al cuadrado.
7. **Balanza de torsión.** Cavendish lo comprobó, pero no lo publicó. En mil setecientos ochenta y cinco, Coulomb midió la fuerza con una balanza de torsión. A la mitad de distancia, cuatro veces más fuerza.
8. **El núcleo.** En mil novecientos once, Ernest Rutherford lanzó partículas alfa contra una lámina de oro. Casi todas pasaban derecho, pero una de cada varios miles rebotaba. El átomo tiene un núcleo diminuto, denso y positivo.
9. **La escala.** El átomo mide unos diez a la menos diez metros; el núcleo, unos diez a la menos quince. Si el núcleo tuviera un centímetro de radio, el átomo tendría un kilómetro. La materia está casi vacía.
10. **Bohr.** Pero un electrón en órbita está acelerado: radia energía, y debería caer en espiral al núcleo. En mil novecientos trece, Niels Bohr postuló órbitas estacionarias, en las que no radia.
11. **Millikan.** Robert Millikan dejó caer gotitas de aceite entre dos placas, y ajustó el campo hasta dejar cada gota suspendida. Ahí, la fuerza eléctrica, cu E, iguala al peso, eme ge.
12. **Múltiplos de e.** Tras miles de gotas, la carga siempre fue un múltiplo entero de una misma cantidad: la carga elemental, e. Desde dos mil diecinueve, su valor es exacto por definición.
13. **Un coulomb.** Por eso un coulomb son seis coma dos cuatro por diez a la dieciocho electrones. Un globo frotado junta quizá diez nanocoulomb. Un electrón más no se nota, y la carga parece continua.
14. **Electrización.** Para cargar un cuerpo neutro hay dos caminos. Por contacto, ambos quedan con el mismo signo. Por inducción, con una conexión a tierra que se retira primero, queda con el signo opuesto.
15. **Cierre.** Dos signos, carga cuantizada y carga que se conserva. Cada número de este video se calculó en vivo. Lo que viene: la ley de Coulomb.

</details>

### `// 04` Cómo renderizarla

Necesitas Node.js 20 o superior y Python 3. Desde la raíz del repositorio:

```bash
cd clases/fisica/electricidad-y-magnetismo/01-del-ambar-a-la-carga-elemental
npm ci
python3 -m venv .venv && source .venv/bin/activate
pip install -r ../../../../requirements.txt

python audio/generar_voz.py            # voz → public/voz/NN.mp3, src/voz.json y src/palabras.json
python audio/generar_musica.py 184      # música y efectos → public/musica.wav y public/sfx/
npx tsc --noEmit

node herramientas/cuadros.mjs out/cuadros $(python herramientas/marcas.py 4:mitad 4:fin) ClaseYT   # cuadros sueltos

python herramientas/render.py 600 2 Clase     # → out/Del-ambar-a-la-carga-elemental.mp4        (4:5)
python herramientas/render.py 600 2 ClaseYT   # → out/Del-ambar-a-la-carga-elemental-16x9.mp4   (16:9)
python herramientas/render.py 600 2 ClaseTT   # → out/Del-ambar-a-la-carga-elemental-9x16.mp4   (9:16)
```

- **La voz no viene en el repositorio.** `generar_voz.py` la vuelve a generar con edge-tts (voz `es-CL-LorenzoNeural`, a +8 %): manda el texto del guion al servicio de voz de Microsoft y guarda el mp3 de cada escena junto con el momento en que empieza cada palabra. Con `python audio/generar_voz.py 3 7` regenera solo esas escenas. Si una palabra cae en otro momento, la animación la sigue; si el guion cambia y una escena pide una palabra que la voz ya no dice, `w()` avisa con un error.
- **La música sí se genera aquí.** `generar_musica.py` la sintetiza con numpy a partir de la duración en segundos (la del video más 5) y sale igual cada vez.
- **Sin voz ni música** igual puedes revisar cuadros sueltos con `cuadros.mjs`: Remotion avisa que faltan los audios y dibuja el cuadro. `marcas.py` traduce `escena:segundo`, `escena:mitad` o `escena:fin` a números de cuadro.
- **`render.py`** recibe el tamaño del tramo en cuadros, la concurrencia y la composición. Renderiza por tramos, cada uno en su propio proceso y con reintentos, y los une sin recodificar. Reutiliza los tramos que ya existen en `out/partes*/`: para rehacer uno, borra su `vNN.mp4` (y `audio.wav` si cambió la voz o la música).

### `// 05` Notas

- Los apuntes dicen que, con el núcleo del tamaño de una pelota de fútbol, el primer electrón estaría a unos 2 km. Con la razón 10⁵ de los mismos apuntes eso no cuadra (una pelota de unos 11 cm de radio daría unos 11 km), así que el video usa la comparación que sale directa de la razón: núcleo de 1 cm, átomo de 1 km.
- Las cantidades de cada simulación (cargas que pasan, gotas medidas, partículas lanzadas) son de la simulación, no datos históricos. Las cifras físicas (e, 1/e, razón de radios, 1/r²) salen de constantes en el código.
- `src/lab/historia.ts` agrega lo propio de esta clase: carga con signo, hitos de la línea de tiempo, potencias de diez y la constante e.

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
