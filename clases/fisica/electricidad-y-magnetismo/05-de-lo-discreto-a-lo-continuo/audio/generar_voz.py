"""Narración del reel «De lo discreto a lo continuo» (campos conocidos, al estilo del reel de B&N Lab sobre la ley de Gauss).

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
# Los símbolos van escritos como se pronuncian: «de cu» es dq, «ka» es k, «ye» es la variable y.
GUION = [
    # 00 Una carga
    "Una carga puntual reparte su campo en todas direcciones. Al doble de distancia, el campo es cuatro veces más débil.",
    # 01 Superposición
    "Con varias cargas, cada una aporta su propio campo en el punto P. "
    "Y el campo total es la suma de los vectores, no de sus largos.",
    # 02 Miles de millones
    "Pero un solo nanocoulomb son más de seis mil millones de electrones. A esa escala, la carga se ve continua.",
    # 03 Densidad
    "Entonces dejamos de contar cargas y usamos una densidad: lambda en una línea, sigma en una superficie, "
    "ro en un volumen. Cada trocito aporta una carga de cu.",
    # 04 Paso al límite
    "Para pasar al límite, partimos una barra en trozos, y tratamos cada uno como una carga puntual. "
    "Con dos trozos, el campo sale setenta y cuatro por ciento más chico. Con ocho, falla por un cuatro por ciento. "
    "Con dieciséis, por tres centésimas.",
    # 05 Integral
    "Con infinitos trozos, infinitamente pequeños, la suma se vuelve una integral. "
    "La física es la misma: solo cambia la forma de sumar.",
    # 06 Arco
    "Primera demostración: un arco, con P en su centro. Los trocitos simétricos cancelan sus componentes verticales, "
    "y queda dos ka lambda seno de theta cero, sobre r. Si el arco se cierra en un anillo, el campo en el centro es cero.",
    # 07 Anillo
    "Segunda: un anillo, visto desde su eje. Las componentes perpendiculares se cancelan de a pares. "
    "El campo es cero en el centro, máximo en zeta igual a R sobre raíz de dos, y de lejos parece una carga puntual.",
    # 08 Disco
    "Tercera: un disco es una pila de anillos. Sumando anillos desde el centro hasta el borde, el campo es "
    "sigma sobre dos épsilon cero, por uno menos zeta sobre la raíz de R cuadrado más zeta cuadrado.",
    # 09 Plano
    "Cuarta: si el radio crece sin fin, el disco se vuelve un plano. El campo queda sigma sobre dos épsilon cero, "
    "y es el mismo a cualquier distancia.",
    # 10 Barra en su eje
    "Quinta: una barra, vista desde su propio eje. Todos los aportes apuntan igual, pero los trozos cercanos pesan "
    "mucho más. El campo es ka lambda ele, sobre equis cero por equis cero más ele.",
    # 11 Barra en su mediatriz
    "Sexta: la misma barra, desde su mediatriz. Se cancelan las horizontales, y queda dos ka lambda seno de beta cero, "
    "sobre ye. La misma forma que el arco.",
    # 12 Barra infinita
    "Y si la barra no tiene fin, beta cero llega a noventa grados. El campo es dos ka lambda sobre ye: "
    "cae como uno sobre ye, y no como uno sobre ye al cuadrado.",
    # 13 El patrón
    "Al doble de distancia, una carga puntual da un cuarto del campo; una línea infinita, la mitad; "
    "y un plano, lo mismo. Mientras más extendida la carga, más lento cae su campo.",
    # 14 Cierre
    "Cada número de este video se calculó en vivo. Lo que viene: la ley de Gauss, que entrega el plano "
    "y la barra infinita en tres líneas.",
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
