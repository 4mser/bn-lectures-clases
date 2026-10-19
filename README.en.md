<p align="center">
  <img src="docs/assets/hero.gif" width="100%" alt="Six moments from the Electricity and Magnetism series: alpha particles against a gold foil, a torsion balance, the field lines of a dipole, a charge on a parabolic path, a charged infinite plane and a semicircle with a varying density">
</p>

<p align="center">
  <a href="clases/fisica/electricidad-y-magnetismo/"><b>Electricity and Magnetism</b></a> &nbsp;·&nbsp;
  <!-- TODO: replace with the YouTube channel link once it is live -->
  <a href="TODO-canal-youtube"><b>YouTube channel</b></a> &nbsp;·&nbsp;
  <a href="https://github.com/4mser/bn-lectures"><b>B&N Lectures</b></a> &nbsp;·&nbsp;
  <a href="README.md">Leer en español</a>
</p>

The animated lessons of B&N Lectures, with all their code. Each lesson is a project that renders in 4:5, 16:9 and 9:16: a script that sets the timing, simulations that solve the physics in the frame and numbers computed from the real constants. The first series is Electricity and Magnetism, six lessons based on Javier Patiño's course notes, which are published alongside them. The lessons, their scripts and the per-lesson READMEs are in Spanish.

The rule is the same as in all of B&N Lectures: **every frame is a function of time**, and in the lessons also of the voice. Animations are anchored to the words of the script, so a lesson can be rendered in chunks, in parallel, and it comes out the same.

### `// 01` The lessons

| Degree | Course | Lessons |
|---|---|---|
| [Physics](clases/fisica/) | [Electricity and Magnetism](clases/fisica/electricidad-y-magnetismo/) | 1 · [Del ámbar a la carga elemental](clases/fisica/electricidad-y-magnetismo/01-del-ambar-a-la-carga-elemental/)<br>2 · [La ley de Coulomb](clases/fisica/electricidad-y-magnetismo/02-la-ley-de-coulomb/)<br>3 · [El campo eléctrico y sus líneas](clases/fisica/electricidad-y-magnetismo/03-el-campo-electrico-y-sus-lineas/)<br>4 · [Una carga en un campo](clases/fisica/electricidad-y-magnetismo/04-una-carga-en-un-campo/)<br>5 · [De lo discreto a lo continuo](clases/fisica/electricidad-y-magnetismo/05-de-lo-discreto-a-lo-continuo/)<br>6 · [Densidades no uniformes](clases/fisica/electricidad-y-magnetismo/06-densidades-no-uniformes/) |

### `// 02` Layout

```
clases/
  <degree>/                       README.md for the degree: its courses
    <course>/                     README.md for the course: lessons in order, material and audience
      apuntes/                    the course material the lessons follow, with its LEEME.md and license
      <NN-lesson>/                one Remotion project per lesson
        README.md                 what it covers, scenes and their physics, script and how to render it
        audio/                    generar_voz.py (the script) and generar_musica.py
        src/                      scenes, timeline, simulation engine (lab/) and chrome
        herramientas/             chunked render, single frames, contact sheets
        public/                   fonts, effects and logo; voice and music are generated here
plantilla/                        the starting point for every new lesson
docs/assets/                      GIFs and SVG for the READMEs
requirements.txt                  Python environment for voice, music and render
```

Today there is `clases/fisica/electricidad-y-magnetismo/`. Folders use lowercase and hyphens, without accents; lessons carry two digits with their place in the course order.

### `// 03` Rendering a lesson

With Node.js 20 or later and Python 3:

```bash
git clone https://github.com/4mser/bn-lectures-clases.git
cd bn-lectures-clases/clases/fisica/electricidad-y-magnetismo/03-el-campo-electrico-y-sus-lineas
npm ci
python3 -m venv .venv && source .venv/bin/activate
pip install -r ../../../../requirements.txt

python audio/generar_voz.py              # the voice is not in the repository: it is generated from the script
python audio/generar_musica.py 180       # music and effects, with the video length + 5 s
python herramientas/render.py 600 2 ClaseYT   # → out/El-campo-electrico-y-sus-lineas-16x9.mp4
```

Each lesson's README has the commands with its own values, the three formats and how to review single frames without rendering everything. Remotion is installed by `npm ci` at the pinned version (4.0.534) and has its own license: see [remotion.dev/license](https://www.remotion.dev/license).

### `// 04` Adding a degree, a course or a lesson

1. **Degree:** create `clases/<degree>/` with its `README.md` (like the one for [Physics](clases/fisica/README.md)) and add it to the table above.
2. **Course:** create `clases/<degree>/<course>/` with its `README.md`, like the one for [Electricity and Magnetism](clases/fisica/electricidad-y-magnetismo/README.md). If it follows someone's material, it goes in `apuntes/` with a `LEEME.md` stating the author and the license it is published under; that material is not under MIT.
3. **Lesson:** copy [`plantilla/`](plantilla/) to `clases/<degree>/<course>/<NN-lesson>/` and follow its README: script, timeline, scenes, `serie.ts`, voice, music and render.
4. **Docs:** every lesson gets a README in the same order as the others, a short GIF in `docs/assets/` and its row in the course README.

### `// 05` What is not in git

- **The voices.** The mp3 files are generated by each lesson's `audio/generar_voz.py` (edge-tts, voice `es-CL-LorenzoNeural`); the script is included.
- **The videos.** Each lesson's mp4 files, in the three formats, are published as files in the repository's [releases](https://github.com/4mser/bn-lectures-clases/releases).
- **What can be regenerated:** `node_modules/`, `out/`, `build/`, `tmp/` and `public/musica.wav`, which comes from `generar_musica.py`.

### `// 06` Team

**Nicolás Moreno** · [@4mser](https://github.com/4mser) · [LinkedIn](https://www.linkedin.com/in/nicolasmorenoavila)<br>
Creative and technical director of B&N Lectures. In this repository he designed and programmed:

- the series of animated Electricity and Magnetism lessons, in their three formats;
- the lessons' animation engine: kinetic typography, the HUD with numbers computed live and the sync of every animation to the word the voice is saying;
- the template for new lessons and the tools to render and review them.

**Benjamín Campos** · [@B3njjaman](https://github.com/B3njjaman)<br>
Co-founder of B&N Solutions. He made the original reel «De lo discreto a lo continuo», which is lesson 5 of the series, and the simulation engine all the lessons build on.

**Javier Patiño**<br>
Physics graduate and lecturer. Author of the Electricity and Magnetism notes and derivations the lessons are based on, and the voice of B&N Lectures.

### `// 07` License

Code and documentation are under the [MIT License](LICENSE), © 2026 B&N Solutions.

Not covered:

- **The brand.** The B&N Solutions name, the B&N mark and logo and the name «B&N Lectures» remain with B&N Solutions ([TRADEMARKS.md](TRADEMARKS.md)). If you make your own lessons from the template, swap in your own logo and chrome.
- **The course notes.** The notes and derivations in [`apuntes/`](clases/fisica/electricidad-y-magnetismo/apuntes/) are © 2026 Javier Patiño, all rights reserved, and are published with his permission for educational purposes ([LEEME.md](clases/fisica/electricidad-y-magnetismo/apuntes/LEEME.md)).
- **Third-party material.** The fonts (SIL Open Font License 1.1; KaTeX under MIT) and the npm dependencies keep their own licenses.

---

<p align="center">
  <img src="docs/assets/footer.svg" width="100%" alt="Field lines of a dipole flowing between two charges, with the text cuadro = f(t, voz) and bnsolutions.cl/lectures">
</p>
