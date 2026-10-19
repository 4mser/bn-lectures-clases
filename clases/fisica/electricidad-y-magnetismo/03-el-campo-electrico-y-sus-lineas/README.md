<p align="center">
  <img src="../../../../docs/assets/03-el-campo-electrico-y-sus-lineas.gif" width="480" alt="Líneas de campo de un dipolo +2q y −q: nacen en la carga positiva y mueren en la negativa, junto al título «Nacen en las positivas, mueren en las negativas»">
</p>

<p align="center">
  <!-- TODO: reemplazar por el enlace de YouTube de esta clase cuando esté publicada -->
  <a href="TODO-youtube-clase-3"><b>Ver la clase</b></a> &nbsp;·&nbsp;
  <a href="../README.md"><b>Electricidad y Magnetismo</b></a> &nbsp;·&nbsp;
  <a href="../apuntes/"><b>Apuntes</b></a> &nbsp;·&nbsp;
  <a href="https://bnsolutions.cl/lectures"><b>bnsolutions.cl/lectures</b></a>
</p>

**Clase 3 de 6 · El campo eléctrico y sus líneas.** De la incomodidad de Newton con la acción a distancia a las líneas de fuerza de Faraday. La clase define el campo como fuerza por unidad de carga, lo dibuja para una carga y para varias, y usa las líneas para responder dónde se anula.

### `// 01` De qué trata

E = F/q₀ no depende de la carga de prueba. Las líneas son tangentes al campo, nacen en las cargas positivas, mueren en las negativas y nunca se cruzan; su densidad marca la intensidad. Con dos cargas, el punto nulo cumple r₁/r₂ = √(|q₁|/|q₂|).

| | |
|---|---|
| **Basada en** | Clase 1 de los apuntes, secciones 9 y 10 a 10.3: el problema de la acción a distancia (Newton, Faraday, Maxwell), la definición de campo, la carga puntual y la superposición, las líneas de fuerza y dónde se anula el campo. |
| **Duración** | Unos 2:55 min, a 30 cuadros por segundo |
| **Formatos** | `Clase` (4:5, 1080×1350), `ClaseYT` (16:9, 1920×1080) y `ClaseTT` (9:16, 1080×1920). Comparten escenas, voz, música y tiempos |
| **Video** | `TODO`: enlace de YouTube cuando esté publicada |
| **Lo que viene** | Termina anunciando una carga suelta dentro de un campo. |

### `// 02` Escenas y su física

| # | Escena | Archivo | Qué muestra |
|---|---|---|---|
| 01 | Acción a distancia | `E00Distancia.tsx` | Newton y la gravitación: un cuerpo que actúa sobre otro a través del vacío. Línea de tiempo 1687 · 1831 · 1865. |
| 02 | Faraday | `E01Faraday.tsx` | Limaduras alrededor de un imán (modelo de dos polos): el espacio transmite la acción. |
| 03 | Maxwell | `E02Maxwell.tsx` | Los cambios del campo viajan a velocidad finita: Δt = 1 UA / c = 8,3 min. |
| 04 | Qué es el campo | `E03Definicion.tsx` | 1 nC a 10 cm da 899 N/C; con 1 y 2 pC de prueba la fuerza es 0,90 y 1,80 nN y el campo no cambia. |
| 05 | Carga de prueba | `E04Convencion.tsx` | Una carga negativa invierte la fuerza, no el campo. |
| 06 | Carga puntual | `E05Puntual.tsx` | E = kₑQ/r² r̂: hacia afuera si Q es positiva, hacia adentro si es negativa. |
| 07 | Superposición | `E06Superposicion.tsx` | El campo neto en P es la suma de los vectores, no de las magnitudes. |
| 08 | Líneas de fuerza | `E07Tangente.tsx` | En cada punto, el campo es tangente a la línea; la densidad de líneas da la intensidad. |
| 09 | Nacen y mueren | `E08Reglas.tsx` | Las 24 líneas de +2q se trazan en una caja enorme y se cuentan: 12 terminan en −q y 12 se van al infinito. |
| 10 | Densidad de líneas | `E09Densidad.tsx` | Más juntas, más intenso; paralelas e igualmente espaciadas, uniforme. |
| 11 | Cuatro combinaciones | `E10Cuatro.tsx` | Mismo signo: un punto donde el campo se anula. Signos opuestos: no hay punto nulo. |
| 12 | Dónde se anula | `E11Nulo.tsx` | q₂ cambia de valor y de signo; en cada cuadro se recalculan las líneas, la gráfica de Eₓ sobre el eje y el cero de Eₓ, y se comparan r₁/r₂ con √(|q₁|/|q₂|). |
| 13 | Igualar no basta | `E12Igualar.tsx` | En el punto medio entre +Q y −Q, 3 595 N/C de cada carga se suman: 7 190 N/C. |
| 14 | Cierre | `E13Cierre.tsx` | Créditos y lo que viene. |

Cada escena dura lo que dura su frase en la voz, más un respiro. Las animaciones se anclan a palabras del guion con `w(escena, "palabra")` (`src/linea.ts`), así que se mueven solas si la voz cambia.

### `// 03` El guion

Una frase por escena, en el orden de `src/linea.ts`. Es el texto de `audio/generar_voz.py`, escrito como se pronuncia: los símbolos van con letras («cu E» es qE).

<details>
<summary>Leer el guion completo</summary>

1. **Acción a distancia.** En mil seiscientos ochenta y siete, Newton publicó la gravitación universal. Pero a él mismo le parecía absurdo que un cuerpo actúe sobre otro a través del vacío. La ley de Coulomb hereda el mismo problema.
2. **Faraday.** Faraday, hijo de un herrero y casi sin formación matemática, imaginó el espacio lleno de líneas de fuerza. Las veía con limaduras de hierro. Para él, nada actúa a distancia: el espacio transmite la acción.
3. **Maxwell.** Maxwell tradujo esas líneas a ecuaciones, y predijo que la luz es una onda electromagnética. Y los cambios del campo viajan a velocidad finita: si el Sol desapareciera, la Tierra seguiría orbitando ocho minutos más.
4. **Qué es el campo.** El campo eléctrico es la fuerza sobre una carga de prueba, dividida por esa carga. Si duplicas la carga de prueba, la fuerza se duplica, pero el campo no cambia. Se mide en newton por coulomb.
5. **Carga de prueba.** Por convención, el campo se dibuja para una carga de prueba positiva. Si pones ahí una carga negativa, se invierte la fuerza, no el campo.
6. **Carga puntual.** Una carga puntual crea un campo ka Q sobre r cuadrado. Apunta hacia afuera si la carga es positiva, y hacia adentro si es negativa.
7. **Superposición.** Con varias cargas, cada una aporta su propio campo en el punto P. El campo neto es la suma de los vectores, no de las magnitudes.
8. **Líneas de fuerza.** Faraday pensaba el campo con líneas de fuerza. En cada punto, el vector campo es tangente a la línea. La línea entrega la dirección; su densidad, la intensidad.
9. **Nacen y mueren.** Las líneas nacen en las cargas positivas, mueren en las negativas, y nunca se cruzan. De una carga dos q salen el doble de líneas que de menos q: la mitad termina en ella, y el resto se va al infinito.
10. **Densidad de líneas.** Donde las líneas están más juntas, el campo es más intenso. Y si son paralelas e igualmente espaciadas, el campo es uniforme: el mismo en todo punto.
11. **Cuatro combinaciones.** Con dos cargas de igual magnitud, el signo decide. Con el mismo signo, las líneas se repelen, y en el punto medio el campo es cero. Con signos opuestos, todas las líneas van de una a la otra, y no hay punto de campo nulo.
12. **Dónde se anula.** Ahora cambiemos el valor de una carga. Si crece, el punto nulo se acerca a la más chica. Si se achica, se aleja. Si cambia de signo, el punto nulo sale del segmento, por el lado de la carga más chica. Con signos opuestos e iguales, desaparece. Y si crece más, reaparece al otro lado. Siempre se cumple: r uno sobre r dos, igual a la raíz de q uno sobre q dos.
13. **Igualar no basta.** Ojo: igualar magnitudes no basta. En el punto medio entre más Q y menos Q, los dos campos miden lo mismo, pero apuntan en el mismo sentido. Ahí el campo no se anula: se suma.
14. **Cierre.** Cada número de este video se calculó en vivo. Lo que viene: una carga suelta dentro de un campo.

</details>

### `// 04` Cómo renderizarla

Necesitas Node.js 20 o superior y Python 3. Desde la raíz del repositorio:

```bash
cd clases/fisica/electricidad-y-magnetismo/03-el-campo-electrico-y-sus-lineas
npm ci
python3 -m venv .venv && source .venv/bin/activate
pip install -r ../../../../requirements.txt

python audio/generar_voz.py            # voz → public/voz/NN.mp3, src/voz.json y src/palabras.json
python audio/generar_musica.py 180      # música y efectos → public/musica.wav y public/sfx/
npx tsc --noEmit

node herramientas/cuadros.mjs out/cuadros $(python herramientas/marcas.py 4:mitad 4:fin) ClaseYT   # cuadros sueltos

python herramientas/render.py 600 2 Clase     # → out/El-campo-electrico-y-sus-lineas.mp4        (4:5)
python herramientas/render.py 600 2 ClaseYT   # → out/El-campo-electrico-y-sus-lineas-16x9.mp4   (16:9)
python herramientas/render.py 600 2 ClaseTT   # → out/El-campo-electrico-y-sus-lineas-9x16.mp4   (9:16)
```

- **La voz no viene en el repositorio.** `generar_voz.py` la vuelve a generar con edge-tts (voz `es-CL-LorenzoNeural`, a +8 %): manda el texto del guion al servicio de voz de Microsoft y guarda el mp3 de cada escena junto con el momento en que empieza cada palabra. Con `python audio/generar_voz.py 3 7` regenera solo esas escenas. Si una palabra cae en otro momento, la animación la sigue; si el guion cambia y una escena pide una palabra que la voz ya no dice, `w()` avisa con un error.
- **La música sí se genera aquí.** `generar_musica.py` la sintetiza con numpy a partir de la duración en segundos (la del video más 5) y sale igual cada vez.
- **Sin voz ni música** igual puedes revisar cuadros sueltos con `cuadros.mjs`: Remotion avisa que faltan los audios y dibuja el cuadro. `marcas.py` traduce `escena:segundo`, `escena:mitad` o `escena:fin` a números de cuadro.
- **`render.py`** recibe el tamaño del tramo en cuadros, la concurrencia y la composición. Renderiza por tramos, cada uno en su propio proceso y con reintentos, y los une sin recodificar. Reutiliza los tramos que ya existen en `out/partes*/`: para rehacer uno, borra su `vNN.mp4` (y `audio.wav` si cambió la voz o la música).

### `// 05` Notas

- `src/lab/campo.ts` es nuevo en esta clase: ε₀ de CODATA 2022, kₑ = 1/(4πε₀), c y la unidad astronómica exactas; `lineas()` traza n·|q| líneas por carga sin duplicarlas, `flechasCampo()` dibuja la grilla de flechas y `cerosEje()` busca los ceros de Eₓ por bisección.
- La escena de Faraday dibuja las limaduras con el modelo de dos polos (campo de dipolo) para ilustrar lo que él veía; no es el campo magnético real de una barra.
- En la escena de Maxwell la rotación de la Tierra en su órbita está exagerada para que se vea; los 8,3 minutos sí son reales.
- `Linea.tsx` es la línea de tiempo Newton (1687), Faraday (1831) y Maxwell (1865) de las tres primeras escenas.

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
