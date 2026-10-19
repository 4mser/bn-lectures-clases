<p align="center">
  <img src="../../../../docs/assets/04-una-carga-en-un-campo.gif" width="480" alt="Un proyectil y una carga en un campo uniforme describen la misma parábola, junto al título «Tiro parabólico, con qE/m en lugar de g»">
</p>

<p align="center">
  <!-- TODO: reemplazar por el enlace de YouTube de esta clase cuando esté publicada -->
  <a href="TODO-youtube-clase-4"><b>Ver la clase</b></a> &nbsp;·&nbsp;
  <a href="../README.md"><b>Electricidad y Magnetismo</b></a> &nbsp;·&nbsp;
  <a href="../apuntes/"><b>Apuntes</b></a> &nbsp;·&nbsp;
  <a href="https://bnsolutions.cl/lectures"><b>bnsolutions.cl/lectures</b></a>
</p>

**Clase 4 de 6 · Una carga en un campo.** Qué le pasa a una carga suelta en un campo eléctrico uniforme, comparada con la caída libre. El signo decide el sentido de la fuerza, la aceleración depende de q/m, la trayectoria es la parábola del tiro parabólico y la línea de campo no es la trayectoria. Cierra con el electrón del Ejemplo 4 frente a la gravedad.

### `// 01` De qué trata

ma = qE, así que a = (q/m)E: lo que en gravedad es g aquí es qE/m. Un electrón en un campo modesto de 1,0 × 10³ N/C acelera unas 1,8 × 10¹³ veces más que g.

| | |
|---|---|
| **Basada en** | Clase 1 de los apuntes, secciones 10.4, 11 y 12: una carga libre en un campo externo, la comparación con la gravedad y el Ejemplo 4, el resumen de fórmulas y las preguntas de cierre. |
| **Duración** | Unos 2:40 min, a 30 cuadros por segundo |
| **Formatos** | `Clase` (4:5, 1080×1350), `ClaseYT` (16:9, 1920×1080) y `ClaseTT` (9:16, 1080×1920). Comparten escenas, voz, música y tiempos |
| **Video** | `TODO`: enlace de YouTube cuando esté publicada |
| **Lo que viene** | Termina anunciando de lo discreto a lo continuo. |

### `// 02` Escenas y su física

| # | Escena | Archivo | Qué muestra |
|---|---|---|---|
| 01 | Campo uniforme | `E00Uniforme.tsx` | Placas paralelas, líneas rectas y equiespaciadas, 12 sondas con el mismo vector. |
| 02 | El signo decide | `E01Signo.tsx` | +e y −e en el mismo campo: la fuerza se invierte, las líneas no. |F| = eE. |
| 03 | Con gravedad | `E02Gravedad.tsx` | Tres masas 1 : 2 : 4 caen juntas: a = mg/m. |
| 04 | La razón q/m | `E03Razon.tsx` | Tres cargas con q/m de 1, 2 y ½ soltadas desde el reposo; aceleración y tiempo a la placa relativos. |
| 05 | Tres lanzamientos | `E04Tres.tsx` | +q, q = 0 y −q lanzadas de lado (figura 1.20 de los apuntes); desvío vertical en unidades de d. |
| 06 | La parábola | `E05Parabola.tsx` | Estroboscopio: avance 1·1·1·1 en x y caída 1·4·9·16 en y. |
| 07 | Tiro parabólico | `E06Tiro.tsx` | Un proyectil con g y una carga con qE/m describen la misma parábola a 60°. |
| 08 | Línea y trayectoria | `E07Trayectoria.tsx` | Lanzada, la carga se curva; soltada en reposo, sigue la línea. HUD: ángulo entre v y F. |
| 09 | Un electrón | `E08Electron.tsx` | Ejemplo 4: e⁻ en E = 1,0 × 10³ N/C; e/mₑ y a = eE/mₑ. |
| 10 | Frente a la gravedad | `E09Despreciable.tsx` | Barras en escala logarítmica: a/g. |
| 11 | Un centímetro | `E10Centimetro.tsx` | Electrón y piedra recorren 1 cm desde el reposo: t = √(2d/a) en ns y en ms. |
| 12 | Los dos campos | `E11Ambos.tsx` | Gota de aceite con mg y qE: a = g + (q/m)E hasta el equilibrio. |
| 13 | Cierre | `E12Cierre.tsx` | Cargas discretas que se vuelven una densidad continua; créditos. |

Cada escena dura lo que dura su frase en la voz, más un respiro. Las animaciones se anclan a palabras del guion con `w(escena, "palabra")` (`src/linea.ts`), así que se mueven solas si la voz cambia.

### `// 03` El guion

Una frase por escena, en el orden de `src/linea.ts`. Es el texto de `audio/generar_voz.py`, escrito como se pronuncia: los símbolos van con letras («cu E» es qE).

<details>
<summary>Leer el guion completo</summary>

1. **Campo uniforme.** Entre dos placas paralelas, las líneas de campo son rectas, paralelas e igualmente espaciadas. Es un campo uniforme: el mismo módulo y la misma dirección en todo punto.
2. **El signo decide.** Pon una carga ahí. La fuerza es cu por E. Si la carga es positiva, empuja a favor de las líneas. Si es negativa, en contra. Las líneas nunca se invierten: lo que se invierte es la fuerza.
3. **Con gravedad.** Ahora, Newton. En gravedad uniforme, eme a es igual a eme ge. La masa se cancela, y todos los cuerpos caen con la misma aceleración: nueve coma ocho metros por segundo al cuadrado.
4. **La razón q/m.** En un campo eléctrico, eme a es igual a cu E. La aceleración es cu sobre eme, por E, y cambia de una partícula a otra. Por eso un campo eléctrico separa partículas. La gravedad no puede.
5. **Tres lanzamientos.** Lancemos tres partículas de lado, con la misma masa y la misma velocidad. La positiva se curva con el campo, la neutra sigue recta, y la negativa se curva en contra.
6. **La parábola.** En equis, el movimiento es uniforme: avanza lo mismo en cada intervalo. En ye, es acelerado: baja uno, cuatro, nueve, dieciséis. El resultado es una parábola.
7. **Tiro parabólico.** Con un ángulo de lanzamiento, es palabra por palabra el tiro parabólico de mecánica. Solo cambia una cosa: donde estaba ge, ahora va cu E sobre eme.
8. **Línea y trayectoria.** Pero ojo: las líneas de campo son rectas, y la trayectoria es curva. La línea marca la fuerza; la trayectoria sigue a la velocidad. Solo coinciden si la carga parte del reposo.
9. **Un electrón.** Ahora con números. Un electrón, en un campo modesto de mil newtons por coulomb. Su aceleración es e por E sobre su masa: uno coma ocho por diez a la catorce metros por segundo al cuadrado.
10. **Frente a la gravedad.** Eso es dieciocho billones de veces la aceleración de gravedad. Por eso, con partículas elementales, la gravedad se desprecia sin más comentario.
11. **Un centímetro.** Pongámoslo en tiempo. Para recorrer un centímetro desde el reposo, el electrón tarda menos de once nanosegundos. Una piedra en caída libre tarda cuarenta y cinco milisegundos.
12. **Los dos campos.** Si actúan los dos campos, las aceleraciones se suman: a es ge, más cu sobre eme por E. En la gota de Millikan la masa es macroscópica, y la gravedad no se puede despreciar. Cuando la fuerza eléctrica la compensa, la gota queda en equilibrio.
13. **Cierre.** Cada número de este video se calculó en vivo. Queda una pregunta: si la carga está cuantizada, ¿por qué podemos usar densidades continuas? Lo que viene: de lo discreto a lo continuo.

</details>

### `// 04` Cómo renderizarla

Necesitas Node.js 20 o superior y Python 3. Desde la raíz del repositorio:

```bash
cd clases/fisica/electricidad-y-magnetismo/04-una-carga-en-un-campo
npm ci
python3 -m venv .venv && source .venv/bin/activate
pip install -r ../../../../requirements.txt

python audio/generar_voz.py            # voz → public/voz/NN.mp3, src/voz.json y src/palabras.json
python audio/generar_musica.py 165      # música y efectos → public/musica.wav y public/sfx/
npx tsc --noEmit

node herramientas/cuadros.mjs out/cuadros $(python herramientas/marcas.py 4:mitad 4:fin) ClaseYT   # cuadros sueltos

python herramientas/render.py 600 2 Clase     # → out/Una-carga-en-un-campo.mp4        (4:5)
python herramientas/render.py 600 2 ClaseYT   # → out/Una-carga-en-un-campo-16x9.mp4   (16:9)
python herramientas/render.py 600 2 ClaseTT   # → out/Una-carga-en-un-campo-9x16.mp4   (9:16)
```

- **La voz no viene en el repositorio.** `generar_voz.py` la vuelve a generar con edge-tts (voz `es-CL-LorenzoNeural`, a +8 %): manda el texto del guion al servicio de voz de Microsoft y guarda el mp3 de cada escena junto con el momento en que empieza cada palabra. Con `python audio/generar_voz.py 3 7` regenera solo esas escenas. Si una palabra cae en otro momento, la animación la sigue; si el guion cambia y una escena pide una palabra que la voz ya no dice, `w()` avisa con un error.
- **La música sí se genera aquí.** `generar_musica.py` la sintetiza con numpy a partir de la duración en segundos (la del video más 5) y sale igual cada vez.
- **Sin voz ni música** igual puedes revisar cuadros sueltos con `cuadros.mjs`: Remotion avisa que faltan los audios y dibuja el cuadro. `marcas.py` traduce `escena:segundo`, `escena:mitad` o `escena:fin` a números de cuadro.
- **`render.py`** recibe el tamaño del tramo en cuadros, la concurrencia y la composición. Renderiza por tramos, cada uno en su propio proceso y con reintentos, y los une sin recodificar. Reutiliza los tramos que ya existen en `out/partes*/`: para rehacer uno, borra su `vNN.mp4` (y `audio.wav` si cambió la voz o la música).

### `// 05` Notas

- Constantes en `src/lab/campo.ts`: e = 1,602176634 × 10⁻¹⁹ C y mₑ = 9,1093837139 × 10⁻³¹ kg (CODATA 2022), con g = 9,8 m/s² y E = 1,0 × 10³ N/C, los valores de los apuntes.
- La distancia de 1 cm de la escena «Un centímetro» es una elección del video para ilustrar el Ejemplo 4; no está en los apuntes.
- Las simulaciones usan píxeles y segundos de animación (cámara lenta); las cifras del HUD salen de las fórmulas con las constantes reales o son razones adimensionales.

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
