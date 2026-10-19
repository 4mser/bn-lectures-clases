"""Narración del reel «La ley de Coulomb» (serie de electrostática, al estilo del reel de B&N Lab sobre la ley de Gauss).

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
# Los símbolos van escritos como se pronuncian: «cu uno» es q₁, «ka» es k, «erre» es r, «efe» es F.
GUION = [
    # 00 Cargas en reposo
    "La electrostática estudia cargas en reposo. Su modelo más simple es la carga puntual: toda la carga en un punto. "
    "Sirve si el cuerpo es mucho más chico que las distancias.",
    # 01 La pregunta
    "Que dos cargas se atraen o se repelen, ya se sabía. La pregunta es cuánto: queremos un número, con unidades. "
    "Coulomb lo midió en mil setecientos ochenta y cinco.",
    # 02 Balanza de torsión
    "Usó una balanza de torsión. La repulsión entre dos esferas hace girar una varilla, y la fibra se retuerce hasta equilibrarla. "
    "Así, una fuerza diminuta se lee como un ángulo bien visible: efe igual a kappa theta sobre ele.",
    # 03 Producto de las cargas
    "Primer hallazgo: la fuerza es proporcional al producto de las cargas. Si duplicas una de ellas, la fuerza se duplica.",
    # 04 Inverso del cuadrado
    "Segundo: la fuerza cae con el cuadrado de la distancia. Al doble de separación, queda un cuarto. "
    "Hoy ese exponente dos está comprobado hasta unas pocas partes en diez a la dieciséis.",
    # 05 Fuerza central
    "Tercero: la fuerza apunta por la recta que une las cargas. Signos iguales se repelen, signos opuestos se atraen. "
    "Y las dos fuerzas forman un par de acción y reacción.",
    # 06 La constante
    "Juntando todo: efe igual a ka, por cu uno por cu dos, sobre erre al cuadrado. La constante ka es uno sobre cuatro pi "
    "épsilon cero: casi nueve mil millones, en unidades del sistema internacional.",
    # 07 Forma vectorial
    "Como vector, la fuerza sigue a erre uno dos, de la carga uno a la dos. Si el producto de las cargas es negativo, "
    "se invierte. Y siempre, efe dos uno es menos efe uno dos.",
    # 08 Como Newton
    "La gravitación de Newton tiene la misma forma: masa por masa, sobre erre al cuadrado. Pero hay dos diferencias. "
    "La gravedad solo atrae. Y su constante es diminuta al lado de ka.",
    # 09 Treinta y nueve órdenes
    "Comparemos el protón y el electrón del hidrógeno. Como las dos fuerzas van con uno sobre erre al cuadrado, "
    "la razón no depende de la distancia. La eléctrica es más de diez a la treinta y nueve veces la gravitatoria: "
    "treinta y nueve órdenes de magnitud.",
    # 10 Por qué gana la gravedad
    "Entonces, ¿por qué la gravedad gobierna el universo? Porque la materia es neutra: las cargas positivas y negativas "
    "se cancelan casi exactamente. La masa, en cambio, siempre suma.",
    # 11 Superposición
    "Con más cargas, rige la superposición: la fuerza entre dos cargas no cambia por la presencia de otras. "
    "Sobre la carga de prueba, la fuerza neta es la suma vectorial de cada aporte.",
    # 12 Tres cargas en línea
    "Un ejemplo: más dos microcoulomb en el origen, menos tres a veinte centímetros, y una carga de prueba a cincuenta. "
    "La segunda, más cerca, gana: la neta apunta hacia la carga negativa.",
    # 13 Equilibrio
    "La fuerza eléctrica entra al mismo balance de Newton. En equilibrio, la suma es cero, "
    "aunque ninguna fuerza lo sea. Entre cu y cuatro cu, la carga de prueba queda quieta a un tercio del camino.",
    # 14 Cierre
    "Cada número de este video se calculó en vivo. Lo que viene: el campo eléctrico y sus líneas.",
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
