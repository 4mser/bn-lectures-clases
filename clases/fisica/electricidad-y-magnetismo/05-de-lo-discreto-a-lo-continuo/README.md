<p align="center">
  <img src="../../../../docs/assets/05-de-lo-discreto-a-lo-continuo.gif" width="480" alt="Un plano infinito cargado con su campo uniforme, junto al título «Plano infinito: el campo no decae» y la fórmula σ/2ε₀">
</p>

<p align="center">
  <!-- TODO: reemplazar por el enlace de YouTube de esta clase cuando esté publicada -->
  <a href="TODO-youtube-clase-5"><b>Ver la clase</b></a> &nbsp;·&nbsp;
  <a href="../README.md"><b>Electricidad y Magnetismo</b></a> &nbsp;·&nbsp;
  <a href="../apuntes/"><b>Apuntes</b></a> &nbsp;·&nbsp;
  <a href="https://bnsolutions.cl/lectures"><b>bnsolutions.cl/lectures</b></a>
</p>

**Clase 5 de 6 · De lo discreto a lo continuo.** El paso de cargas que se cuentan a densidades que se integran. La clase parte de una carga puntual y de la superposición, muestra por qué un nanocoulomb ya se comporta como algo continuo y convierte la suma en integral. Después recorre las seis demostraciones de campos conocidos y cierra con el patrón que las une.

### `// 01` De qué trata

Al doble de distancia, una carga puntual da un cuarto del campo, una línea infinita la mitad y un plano lo mismo: mientras más extendida la carga, más lento cae su campo. Cada resultado se comprueba en el cuadro, con la suma de Riemann que converge a la integral.

| | |
|---|---|
| **Basada en** | «Demostraciones de campos conocidos» de Javier Patiño: el procedimiento de siete pasos y las seis demostraciones (arco, anillo, disco, plano infinito, barra en su eje, barra en su mediatriz), más la barra infinita. |
| **Duración** | Unos 2:48 min, a 30 cuadros por segundo |
| **Formatos** | `Clase` (4:5, 1080×1350), `ClaseYT` (16:9, 1920×1080) y `ClaseTT` (9:16, 1080×1920). Comparten escenas, voz, música y tiempos |
| **Video** | `TODO`: enlace de YouTube cuando esté publicada |
| **Lo que viene** | Termina anunciando la ley de Gauss. |

### `// 02` Escenas y su física

| # | Escena | Archivo | Qué muestra |
|---|---|---|---|
| 01 | Una carga | `E00UnaCarga.tsx` | Campo radial de una carga puntual: al doble de distancia, un cuarto. |
| 02 | Superposición | `E01Superposicion.tsx` | Varias cargas en P: se suman los vectores, no sus largos. |
| 03 | Miles de millones | `E02Millones.tsx` | 1 nC son más de seis mil millones de electrones: a esa escala la carga se ve continua. |
| 04 | Densidad | `E03Densidad.tsx` | λ en una línea, σ en una superficie, ρ en un volumen; cada trocito aporta dq. |
| 05 | El paso al límite | `E04Riemann.tsx` | La barra partida en trozos, cada uno como carga puntual: con 2 el campo sale 74 % más chico, con 8 falla por un 4 % y con 16 por tres centésimas. |
| 06 | La integral | `E05Integral.tsx` | Con infinitos trozos, la suma se vuelve E = ∫ k dq / r² r̂. |
| 07 | Arco | `E06Arco.tsx` | Las componentes verticales se cancelan: E = 2kλ sin θ₀ / r; si el arco se cierra en anillo, E = 0 en el centro. |
| 08 | Anillo | `E07Anillo.tsx` | Sobre el eje, E = kQz / (z² + R²)^(3/2): cero en el centro, máximo en z = R/√2 y de lejos, una carga puntual. |
| 09 | Disco | `E08Disco.tsx` | Una pila de anillos: E = (σ/2ε₀)(1 − z/√(z² + R²)). |
| 10 | Plano infinito | `E09Plano.tsx` | Si R crece sin fin, E = σ/2ε₀, el mismo a cualquier distancia. |
| 11 | Barra en su eje | `E10BarraEje.tsx` | Nada que cancelar y los trozos cercanos pesan más: E = kλL / (x₀(x₀ + L)). |
| 12 | Barra en su mediatriz | `E11Mediatriz.tsx` | Se cancelan las horizontales: E = 2kλ sin β₀ / y, la misma forma que el arco. |
| 13 | Barra infinita | `E12BarraInfinita.tsx` | β₀ llega a 90°: E = 2kλ/y, que cae como 1/y. |
| 14 | El patrón | `E13Patron.tsx` | Puntual, línea y plano al doble de distancia: ×0,25, ×0,50 y ×1,00. |
| 15 | Cierre | `E14Cierre.tsx` | Créditos y lo que viene: la ley de Gauss. |

Cada escena dura lo que dura su frase en la voz, más un respiro. Las animaciones se anclan a palabras del guion con `w(escena, "palabra")` (`src/linea.ts`), así que se mueven solas si la voz cambia.

### `// 03` El guion

Una frase por escena, en el orden de `src/linea.ts`. Es el texto de `audio/generar_voz.py`, escrito como se pronuncia: los símbolos van con letras («cu E» es qE).

<details>
<summary>Leer el guion completo</summary>

1. **Una carga.** Una carga puntual reparte su campo en todas direcciones. Al doble de distancia, el campo es cuatro veces más débil.
2. **Superposición.** Con varias cargas, cada una aporta su propio campo en el punto P. Y el campo total es la suma de los vectores, no de sus largos.
3. **Miles de millones.** Pero un solo nanocoulomb son más de seis mil millones de electrones. A esa escala, la carga se ve continua.
4. **Densidad.** Entonces dejamos de contar cargas y usamos una densidad: lambda en una línea, sigma en una superficie, ro en un volumen. Cada trocito aporta una carga de cu.
5. **El paso al límite.** Para pasar al límite, partimos una barra en trozos, y tratamos cada uno como una carga puntual. Con dos trozos, el campo sale setenta y cuatro por ciento más chico. Con ocho, falla por un cuatro por ciento. Con dieciséis, por tres centésimas.
6. **La integral.** Con infinitos trozos, infinitamente pequeños, la suma se vuelve una integral. La física es la misma: solo cambia la forma de sumar.
7. **Arco.** Primera demostración: un arco, con P en su centro. Los trocitos simétricos cancelan sus componentes verticales, y queda dos ka lambda seno de theta cero, sobre r. Si el arco se cierra en un anillo, el campo en el centro es cero.
8. **Anillo.** Segunda: un anillo, visto desde su eje. Las componentes perpendiculares se cancelan de a pares. El campo es cero en el centro, máximo en zeta igual a R sobre raíz de dos, y de lejos parece una carga puntual.
9. **Disco.** Tercera: un disco es una pila de anillos. Sumando anillos desde el centro hasta el borde, el campo es sigma sobre dos épsilon cero, por uno menos zeta sobre la raíz de R cuadrado más zeta cuadrado.
10. **Plano infinito.** Cuarta: si el radio crece sin fin, el disco se vuelve un plano. El campo queda sigma sobre dos épsilon cero, y es el mismo a cualquier distancia.
11. **Barra en su eje.** Quinta: una barra, vista desde su propio eje. Todos los aportes apuntan igual, pero los trozos cercanos pesan mucho más. El campo es ka lambda ele, sobre equis cero por equis cero más ele.
12. **Barra en su mediatriz.** Sexta: la misma barra, desde su mediatriz. Se cancelan las horizontales, y queda dos ka lambda seno de beta cero, sobre ye. La misma forma que el arco.
13. **Barra infinita.** Y si la barra no tiene fin, beta cero llega a noventa grados. El campo es dos ka lambda sobre ye: cae como uno sobre ye, y no como uno sobre ye al cuadrado.
14. **El patrón.** Al doble de distancia, una carga puntual da un cuarto del campo; una línea infinita, la mitad; y un plano, lo mismo. Mientras más extendida la carga, más lento cae su campo.
15. **Cierre.** Cada número de este video se calculó en vivo. Lo que viene: la ley de Gauss, que entrega el plano y la barra infinita en tres líneas.

</details>

### `// 04` Cómo renderizarla

Necesitas Node.js 20 o superior y Python 3. Desde la raíz del repositorio:

```bash
cd clases/fisica/electricidad-y-magnetismo/05-de-lo-discreto-a-lo-continuo
npm ci
python3 -m venv .venv && source .venv/bin/activate
pip install -r ../../../../requirements.txt

python audio/generar_voz.py            # voz → public/voz/NN.mp3, src/voz.json y src/palabras.json
python audio/generar_musica.py 172      # música y efectos → public/musica.wav y public/sfx/
npx tsc --noEmit

node herramientas/cuadros.mjs out/cuadros $(python herramientas/marcas.py 4:mitad 4:fin) ClaseYT   # cuadros sueltos

python herramientas/render.py 600 2 Clase     # → out/De-lo-discreto-a-lo-continuo.mp4        (4:5)
python herramientas/render.py 600 2 ClaseYT   # → out/De-lo-discreto-a-lo-continuo-16x9.mp4   (16:9)
python herramientas/render.py 600 2 ClaseTT   # → out/De-lo-discreto-a-lo-continuo-9x16.mp4   (9:16)
```

- **La voz no viene en el repositorio.** `generar_voz.py` la vuelve a generar con edge-tts (voz `es-CL-LorenzoNeural`, a +8 %): manda el texto del guion al servicio de voz de Microsoft y guarda el mp3 de cada escena junto con el momento en que empieza cada palabra. Con `python audio/generar_voz.py 3 7` regenera solo esas escenas. Si una palabra cae en otro momento, la animación la sigue; si el guion cambia y una escena pide una palabra que la voz ya no dice, `w()` avisa con un error.
- **La música sí se genera aquí.** `generar_musica.py` la sintetiza con numpy a partir de la duración en segundos (la del video más 5) y sale igual cada vez.
- **Sin voz ni música** igual puedes revisar cuadros sueltos con `cuadros.mjs`: Remotion avisa que faltan los audios y dibuja el cuadro. `marcas.py` traduce `escena:segundo`, `escena:mitad` o `escena:fin` a números de cuadro.
- **`render.py`** recibe el tamaño del tramo en cuadros, la concurrencia y la composición. Renderiza por tramos, cada uno en su propio proceso y con reintentos, y los une sin recodificar. Reutiliza los tramos que ya existen en `out/partes*/`: para rehacer uno, borra su `vNN.mp4` (y `audio.wav` si cambió la voz o la música).

### `// 05` Notas

- Es la clase original de la serie: Benjamín Campos la hizo como el reel «De lo discreto a lo continuo», y su motor de simulación (`src/lab/`) es la base de todas las demás. La versión de este repositorio incluye los formatos 16:9 y 9:16.
- Cada escena se dibuja en coordenadas de 1080×1350. En 16:9 se pone a la derecha con la transformación `YT` de `src/theme.ts`, y `Escena` (en `src/comun.tsx`) manda la cabeza, las fórmulas y el HUD a una columna de texto a la izquierda. En vertical los cuadros salen idénticos al reel original.
- Las fuentes de títulos solo traen el alfabeto latino: las letras griegas y los símbolos (λ, σ, ∞, √) van con KaTeX.

### `// 06` Equipo

Esta clase es el reel original de **Benjamín Campos**, que dio origen a la serie y a su motor de simulación. Se basa en «Demostraciones de campos conocidos», de **Javier Patiño**, que está en [`../apuntes/`](../apuntes/).

**Nicolás Moreno** · [@4mser](https://github.com/4mser) · [LinkedIn](https://www.linkedin.com/in/nicolasmorenoavila)<br>
Dirección creativa y técnica de B&N Lectures. En la serie diseñó y programó:

- la serie de clases animadas de Electricidad y Magnetismo, en sus tres formatos;
- el motor de animación de las clases: la tipografía cinética, el HUD con cifras calculadas en vivo y la sincronía de cada animación con la palabra que dice la voz;
- la plantilla para crear clases nuevas y las herramientas para renderizarlas y revisarlas.

**Benjamín Campos** · [@B3njjaman](https://github.com/B3njjaman)<br>
Cofundador de B&N Solutions. Creó el reel original «De lo discreto a lo continuo» y el motor de simulación en el que se apoya la serie (`src/lab/`).

**Javier Patiño**<br>
Licenciado en Física y profesor. Autor de los apuntes y demostraciones de Electricidad y Magnetismo en los que se basan las clases, y la voz de B&N Lectures.

---

<p align="center">
  <img src="../../../../docs/assets/footer.svg" width="100%" alt="Líneas de campo de un dipolo que fluyen entre dos cargas, con el texto cuadro = f(t, voz) y bnsolutions.cl/lectures">
</p>
