"""Narración del reel «Del ámbar a la carga elemental» (historia de la carga eléctrica, al estilo del reel de B&N Lab).

Uso (desde la raíz del proyecto):
    PYTHONPATH=pylib python audio/generar_voz.py        # genera las escenas que no tienen mp3
    PYTHONPATH=pylib python audio/generar_voz.py 3 7    # regenera solo las escenas 3 y 7
Escribe public/voz/NN.mp3, src/voz.json (duración de cada escena) y src/palabras.json
(momento en que empieza cada palabra, para sincronizar las animaciones con la voz).
Ojo: el texto se envía al servicio de voz de Microsoft Edge (edge-tts).
"""
import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path

import edge_tts
import imageio_ffmpeg

VOZ = "es-CL-LorenzoNeural"
VELOCIDAD = "+8%"
RAIZ = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()

# Una entrada por escena, en el mismo orden que ESCENAS en src/Video.tsx.
# Los símbolos van escritos como se pronuncian: «cu E» es qE, «eme ge» es mg.
GUION = [
    # 00 El ámbar
    "Cuenta la tradición que, hace unos dos mil seiscientos años, Tales de Mileto frotó un trozo de ámbar, "
    "y este atrajo plumas y pajitas. En griego, ámbar se dice élektron.",
    # 01 Gilbert y Guericke
    "En mil seiscientos, William Gilbert mostró que muchas sustancias se electrizan al frotarlas. "
    "Hacia mil seiscientos sesenta, Otto von Guericke hizo girar un globo de azufre: por fin se podía electrizar a voluntad.",
    # 02 Gray
    "En mil setecientos veintinueve, Stephen Gray llevó la electrización por cientos de metros de hilo húmedo. "
    "Unos materiales la transmiten y otros no: conductores y aislantes.",
    # 03 du Fay
    "En mil setecientos treinta y tres, Charles du Fay distinguió dos clases: la vítrea y la resinosa. "
    "Las del mismo tipo se repelen; las de distinto tipo se atraen.",
    # 04 Franklin
    "Hacia mil setecientos cincuenta, Benjamin Franklin propuso un solo fluido, en exceso o en defecto: positivo y negativo. "
    "Al frotar, la carga pasa de un cuerpo al otro, y la carga total se conserva.",
    # 05 Priestley
    "En mil setecientos sesenta y siete, Joseph Priestley notó que dentro de un conductor hueco cargado no hay fuerza. "
    "Como en la gravedad de Newton, eso exige una ley de uno sobre erre al cuadrado.",
    # 06 Coulomb
    "Cavendish lo comprobó, pero no lo publicó. En mil setecientos ochenta y cinco, Coulomb midió la fuerza con una balanza de torsión. "
    "A la mitad de distancia, cuatro veces más fuerza.",
    # 07 Rutherford
    "En mil novecientos once, Ernest Rutherford lanzó partículas alfa contra una lámina de oro. "
    "Casi todas pasaban derecho, pero una de cada varios miles rebotaba. El átomo tiene un núcleo diminuto, denso y positivo.",
    # 08 La escala
    "El átomo mide unos diez a la menos diez metros; el núcleo, unos diez a la menos quince. "
    "Si el núcleo tuviera un centímetro de radio, el átomo tendría un kilómetro. La materia está casi vacía.",
    # 09 Bohr
    "Pero un electrón en órbita está acelerado: radia energía, y debería caer en espiral al núcleo. "
    "En mil novecientos trece, Niels Bohr postuló órbitas estacionarias, en las que no radia.",
    # 10 Millikan
    "Robert Millikan dejó caer gotitas de aceite entre dos placas, y ajustó el campo hasta dejar cada gota suspendida. "
    "Ahí, la fuerza eléctrica, cu E, iguala al peso, eme ge.",
    # 11 Múltiplos enteros
    "Tras miles de gotas, la carga siempre fue un múltiplo entero de una misma cantidad: la carga elemental, e. "
    "Desde dos mil diecinueve, su valor es exacto por definición.",
    # 12 Un coulomb
    "Por eso un coulomb son seis coma dos cuatro por diez a la dieciocho electrones. Un globo frotado junta quizá diez nanocoulomb. "
    "Un electrón más no se nota, y la carga parece continua.",
    # 13 Electrización
    "Para cargar un cuerpo neutro hay dos caminos. Por contacto, ambos quedan con el mismo signo. "
    "Por inducción, con una conexión a tierra que se retira primero, queda con el signo opuesto.",
    # 14 Cierre
    "Dos signos, carga cuantizada y carga que se conserva. Cada número de este video se calculó en vivo. "
    "Lo que viene: la ley de Coulomb.",
]


def duracion(mp3: Path) -> float:
    salida = subprocess.run([FF, "-i", str(mp3)], capture_output=True, text=True).stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", salida)
    return round(60 * int(m[2]) + float(m[3]), 2)


async def generar(i: int, texto: str, carpeta: Path):
    mp3 = carpeta / f"{i:02d}.mp3"
    com = edge_tts.Communicate(texto, VOZ, rate=VELOCIDAD, boundary="WordBoundary")
    marcas = []
    with open(mp3, "wb") as f:
        async for trozo in com.stream():
            if trozo["type"] == "audio":
                f.write(trozo["data"])
            elif trozo["type"] == "WordBoundary":
                # offset viene en unidades de 100 ns.
                marcas.append([trozo["text"], round(trozo["offset"] / 1e7, 2)])
    return marcas


async def main():
    carpeta = RAIZ / "public" / "voz"
    carpeta.mkdir(parents=True, exist_ok=True)
    ruta_pal = RAIZ / "src" / "palabras.json"
    palabras = json.loads(ruta_pal.read_text(encoding="utf-8")) if ruta_pal.exists() else []
    palabras += [[] for _ in range(len(GUION) - len(palabras))]
    pedidas = {int(x) for x in sys.argv[1:]}
    for i, texto in enumerate(GUION):
        mp3 = carpeta / f"{i:02d}.mp3"
        if (pedidas and i not in pedidas) or (not pedidas and mp3.exists() and palabras[i]):
            continue
        palabras[i] = await generar(i, texto, carpeta)
        print(i, len(palabras[i]), "palabras", flush=True)
    duraciones = [duracion(carpeta / f"{i:02d}.mp3") for i in range(len(GUION))]
    (RAIZ / "src" / "voz.json").write_text(json.dumps(duraciones), encoding="utf-8")
    ruta_pal.write_text(json.dumps(palabras[: len(GUION)], ensure_ascii=False), encoding="utf-8")
    print("duraciones", duraciones, "total", round(sum(duraciones), 1))


asyncio.run(main())
