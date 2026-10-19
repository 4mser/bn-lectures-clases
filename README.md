<p align="center">
  <img src="docs/assets/hero.gif" width="100%" alt="Seis momentos de la serie de Electricidad y Magnetismo: partículas alfa contra una lámina de oro, una balanza de torsión, las líneas de un dipolo, una carga en un tiro parabólico, un plano infinito cargado y un semicírculo con densidad variable">
</p>

<p align="center">
  <a href="clases/fisica/electricidad-y-magnetismo/"><b>Electricidad y Magnetismo</b></a> &nbsp;·&nbsp;
  <!-- TODO: reemplazar por el enlace del canal de YouTube cuando esté publicado -->
  <a href="TODO-canal-youtube"><b>Canal de YouTube</b></a> &nbsp;·&nbsp;
  <a href="https://github.com/4mser/bn-lectures"><b>B&N Lectures</b></a> &nbsp;·&nbsp;
  <a href="README.en.md">Read in English</a>
</p>

Las clases animadas de B&N Lectures, con todo su código. Cada clase es un proyecto que se renderiza en 4:5, 16:9 y 9:16: un guion que manda los tiempos, simulaciones que resuelven la física en el cuadro y cifras calculadas a partir de las constantes reales. La primera serie es Electricidad y Magnetismo, seis clases basadas en los apuntes de Javier Patiño, que se publican junto a ellas.

La regla es la misma de todo B&N Lectures: **cada cuadro es una función del tiempo**, y en las clases también de la voz. Las animaciones se anclan a las palabras del guion, así que una clase se puede renderizar por tramos, en paralelo, y sale igual.

### `// 01` Las clases

| Carrera | Ramo | Clases |
|---|---|---|
| [Física](clases/fisica/) | [Electricidad y Magnetismo](clases/fisica/electricidad-y-magnetismo/) | 1 · [Del ámbar a la carga elemental](clases/fisica/electricidad-y-magnetismo/01-del-ambar-a-la-carga-elemental/)<br>2 · [La ley de Coulomb](clases/fisica/electricidad-y-magnetismo/02-la-ley-de-coulomb/)<br>3 · [El campo eléctrico y sus líneas](clases/fisica/electricidad-y-magnetismo/03-el-campo-electrico-y-sus-lineas/)<br>4 · [Una carga en un campo](clases/fisica/electricidad-y-magnetismo/04-una-carga-en-un-campo/)<br>5 · [De lo discreto a lo continuo](clases/fisica/electricidad-y-magnetismo/05-de-lo-discreto-a-lo-continuo/)<br>6 · [Densidades no uniformes](clases/fisica/electricidad-y-magnetismo/06-densidades-no-uniformes/) |

### `// 02` Estructura

```
clases/
  <carrera>/                      README.md de la carrera: sus ramos
    <ramo>/                       README.md del ramo: clases en orden, material y a quién va dirigido
      apuntes/                    material del curso en que se basan las clases, con su LEEME.md y su licencia
      <NN-clase>/                 un proyecto Remotion por clase
        README.md                 de qué trata, escenas y su física, guion y cómo renderizarla
        audio/                    generar_voz.py (el guion) y generar_musica.py
        src/                      escenas, línea de tiempo, motor de simulación (lab/) y cromo
        herramientas/             render por tramos, cuadros sueltos, hojas de contacto
        public/                   fuentes, efectos y logo; aquí se generan la voz y la música
plantilla/                        el punto de partida de cada clase nueva
docs/assets/                      GIF y SVG de los README
requirements.txt                  entorno de Python para voz, música y render
```

Hoy existe `clases/fisica/electricidad-y-magnetismo/`. Las carpetas usan minúsculas y guiones, sin tildes; las clases llevan dos dígitos con su lugar en el orden del ramo.

### `// 03` Renderizar una clase

Con Node.js 20 o superior y Python 3:

```bash
git clone https://github.com/4mser/bn-lectures-clases.git
cd bn-lectures-clases/clases/fisica/electricidad-y-magnetismo/03-el-campo-electrico-y-sus-lineas
npm ci
python3 -m venv .venv && source .venv/bin/activate
pip install -r ../../../../requirements.txt

python audio/generar_voz.py              # la voz no viene en el repositorio: se genera desde el guion
python audio/generar_musica.py 180       # música y efectos, con la duración del video + 5 s
python herramientas/render.py 600 2 ClaseYT   # → out/El-campo-electrico-y-sus-lineas-16x9.mp4
```

El README de cada clase trae los comandos con sus valores, los tres formatos y cómo revisar cuadros sueltos sin renderizar todo. Remotion se instala con `npm ci` en la versión fijada (4.0.534) y tiene su propia licencia: revisa [remotion.dev/license](https://www.remotion.dev/license).

### `// 04` Sumar una carrera, un ramo o una clase

1. **Carrera:** crea `clases/<carrera>/` con su `README.md` (como el de [Física](clases/fisica/README.md)) y súmala a la tabla de arriba.
2. **Ramo:** crea `clases/<carrera>/<ramo>/` con su `README.md`, como el de [Electricidad y Magnetismo](clases/fisica/electricidad-y-magnetismo/README.md). Si se basa en material de alguien, va en `apuntes/` con un `LEEME.md` que diga quién es el autor y con qué licencia se publica; ese material no queda bajo MIT.
3. **Clase:** copia la [`plantilla/`](plantilla/) a `clases/<carrera>/<ramo>/<NN-clase>/` y sigue su README: guion, línea de tiempo, escenas, `serie.ts`, voz, música y render.
4. **Documentación:** cada clase lleva su README con el mismo orden que las demás, un GIF corto en `docs/assets/` y su fila en el README del ramo.

### `// 05` Lo que no está en git

- **Las voces.** Los mp3 se generan con `audio/generar_voz.py` de cada clase (edge-tts, voz `es-CL-LorenzoNeural`); el guion sí está.
- **Los videos.** Los mp4 de cada clase, en sus tres formatos, se publican como archivos de los [releases](https://github.com/4mser/bn-lectures-clases/releases) del repositorio.
- **Lo regenerable:** `node_modules/`, `out/`, `build/`, `tmp/` y `public/musica.wav`, que sale de `generar_musica.py`.

### `// 06` Equipo

| | |
|---|---|
| **Nicolás Moreno**<br>[@4mser](https://github.com/4mser) | Cofundador de B&N Solutions e ingeniero de software. Creó el motor de simulación de B&N Lab y desarrolla las animaciones y los videos. |
| **Benjamín Campos**<br>[@B3njjaman](https://github.com/B3njjaman) | Cofundador de B&N Solutions e ingeniero físico. Autor de la clase «De lo discreto a lo continuo». |
| **Javier Patiño** | Licenciado en Física y profesor de Electricidad y Magnetismo. Autor de los apuntes en que se basan las clases y la voz de B&N Lectures. |

### `// 07` Licencia

El código y la documentación están bajo la [licencia MIT](LICENSE), © 2026 B&N Solutions.

Quedan fuera:

- **La marca.** El nombre B&N Solutions, la marca y el logo B&N y el nombre «B&N Lectures» siguen siendo de B&N Solutions ([TRADEMARKS.md](TRADEMARKS.md)). Si haces clases propias con la plantilla, cambia el logo y el cromo por los tuyos.
- **Los apuntes.** Los apuntes y demostraciones de [`apuntes/`](clases/fisica/electricidad-y-magnetismo/apuntes/) son © 2026 Javier Patiño, con todos los derechos reservados, y se publican con su autorización con fines educativos ([LEEME.md](clases/fisica/electricidad-y-magnetismo/apuntes/LEEME.md)).
- **Lo de terceros.** Las fuentes (SIL Open Font License 1.1; KaTeX bajo MIT) y las dependencias de npm mantienen sus licencias.

---

<p align="center">
  <img src="docs/assets/footer.svg" width="100%" alt="Líneas de campo de un dipolo que fluyen entre dos cargas, con el texto cuadro = f(t, voz) y bnsolutions.cl/lectures">
</p>
