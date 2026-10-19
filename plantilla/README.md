<p align="center">
  <img src="../docs/assets/05-de-lo-discreto-a-lo-continuo.gif" width="480" alt="Un plano infinito cargado con su campo uniforme, del reel «De lo discreto a lo continuo», del que parte la plantilla">
</p>

<p align="center">
  <a href="../README.md"><b>Todas las clases</b></a> &nbsp;·&nbsp;
  <a href="../clases/fisica/electricidad-y-magnetismo/"><b>Electricidad y Magnetismo</b></a> &nbsp;·&nbsp;
  <a href="https://bnsolutions.cl/lectures"><b>bnsolutions.cl/lectures</b></a>
</p>

La plantilla es el punto de partida de cada clase nueva. Es un proyecto [Remotion](https://www.remotion.dev) completo, que hoy contiene la clase «De lo discreto a lo continuo» como ejemplo: quince escenas, su guion, el motor de simulación, el cromo, las fuentes y las herramientas de render. Las seis clases de Electricidad y Magnetismo salieron de aquí.

### `// 01` Qué trae

| Ruta | Qué hay | ¿Se cambia en una clase nueva? |
|---|---|---|
| `src/serie.ts` | Título, tema, crédito del cierre y nombre del archivo de salida | Sí, siempre |
| `audio/generar_voz.py` | El guion, una frase por escena, y la generación de la voz con edge-tts | Sí: es el guion |
| `src/linea.ts` | La línea de tiempo: `INFO` (nombre, ceja y duración mínima de cada escena) y `w(escena, "palabra")` | Sí: una entrada por escena |
| `src/escenas/ENN*.tsx` | Una escena por archivo, con su lista de efectos `sfxNN` | Sí: son las escenas |
| `src/Video.tsx` | Arma las escenas en orden (`ESCENAS` y `SFX`) y mezcla voz, música y efectos | Solo las listas de escenas |
| `src/lab/` | Motor de simulación en canvas (`motor.tsx`), trazos con brillo y líneas de campo (`luz.ts`) y proyección 3D (`proyeccion.ts`) | Se suman piezas propias, como `campo.ts` o `densidad.ts` en otras clases |
| `src/comun.tsx`, `src/Marco.tsx`, `src/formula.tsx`, `src/theme.ts` | Título palabra por palabra, cabeza con ceja, HUD de lecturas, fórmulas con KaTeX, cromo, paleta y los tres formatos | No |
| `audio/generar_musica.py` | Música y efectos sintetizados con numpy, a partir de la duración | No |
| `herramientas/` | `marcas.py`, `cuadros.mjs`, `hoja.py`, `parte.mjs` y `render.py` | No |

### `// 02` Crear una clase nueva

1. **Copia la plantilla** a su lugar, con el número que le toca en el orden del ramo:

   ```bash
   cp -R plantilla clases/<carrera>/<ramo>/<NN-clase>
   cd clases/<carrera>/<ramo>/<NN-clase>
   rm -f README.md
   ```

2. **Escribe el guion** en `GUION` de `audio/generar_voz.py`: una frase por escena, escrita como se pronuncia («cu E» para qE, «uno sobre erre al cuadrado» para 1/r²).
3. **Arma la línea de tiempo** en `INFO` de `src/linea.ts`, con una entrada por frase y en el mismo orden.
4. **Escribe las escenas** en `src/escenas/`. Cada una recibe el tiempo con `useT()`, ancla sus animaciones a palabras del guion con `w(E, "palabra")` y exporta su lista de efectos. Regístralas en `ESCENAS` y `SFX` de `src/Video.tsx`.
5. **Cambia `src/serie.ts`**: título, tema, crédito (por ejemplo, los apuntes en que se basa) y nombre del archivo de salida.
6. **Genera la voz y la música**, revisa y renderiza:

   ```bash
   npm ci
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r ../../../../requirements.txt
   python audio/generar_voz.py
   python audio/generar_musica.py <segundos del video + 5>
   npx tsc --noEmit
   node herramientas/cuadros.mjs out/cuadros $(python herramientas/marcas.py 3:mitad 3:fin) Clase
   python herramientas/render.py 600 2 Clase
   python herramientas/render.py 600 2 ClaseYT
   python herramientas/render.py 600 2 ClaseTT
   ```

7. **Documenta la clase.** Escribe su `README.md` con el mismo orden que las demás (de qué trata, escenas y su física, guion, cómo renderizarla, notas y equipo), saca un GIF corto para `docs/assets/` y suma la clase al README del ramo.

### `// 03` Reglas que conviene mantener

- **Cada cuadro es una función del tiempo.** Una escena no guarda estado entre cuadros: todo se calcula desde `t`. Así cualquier cuadro se puede renderizar solo, en cualquier orden y en paralelo.
- **Las cifras se calculan, no se escriben.** Si el HUD muestra 899 N/C, sale de `k q / r²` con las constantes de CODATA. Cuando el video y los apuntes redondean distinto, anótalo en las notas del README de la clase.
- **La voz manda los tiempos.** Si cambia el guion, vuelve a generar la voz: `w()` lanza un error si una escena pide una palabra que la voz ya no dice.
- **Tres formatos, una sola escena.** Cada escena se dibuja en coordenadas de 1080×1350. En 16:9 y 9:16, `Escena` (`src/comun.tsx`) reparte la cabeza, las fórmulas y el HUD en una columna de texto y reubica la simulación; en vertical los cuadros salen igual que en el reel.
- **Las fuentes de títulos solo traen el alfabeto latino.** Las letras griegas y los símbolos (λ, σ, ∞, √) van con KaTeX.

### `// 04` Equipo

| | |
|---|---|
| **Nicolás Moreno**<br>[@4mser](https://github.com/4mser) | Cofundador de B&N Solutions e ingeniero de software. Creó el motor de simulación de B&N Lab y desarrolla las animaciones y los videos. |
| **Benjamín Campos**<br>[@B3njjaman](https://github.com/B3njjaman) | Cofundador de B&N Solutions e ingeniero físico. Creó el reel original de la serie, «De lo discreto a lo continuo». |
| **Javier Patiño** | Licenciado en Física y profesor de Electricidad y Magnetismo. Autor de los apuntes en que se basan las clases y la voz de B&N Lectures. |

---

<p align="center">
  <img src="../docs/assets/footer.svg" width="100%" alt="Líneas de campo de un dipolo que fluyen entre dos cargas, con el texto cuadro = f(t, voz) y bnsolutions.cl/lectures">
</p>
