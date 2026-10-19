"""Narración del reel «El campo eléctrico» (líneas de campo, al estilo del reel de B&N Lab sobre la ley de Gauss).

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
# Los símbolos van escritos como se pronuncian: «ka» es k, «dos q» es 2q.
GUION = [
    # 00 Acción a distancia
    "En mil seiscientos ochenta y siete, Newton publicó la gravitación universal. "
    "Pero a él mismo le parecía absurdo que un cuerpo actúe sobre otro a través del vacío. "
    "La ley de Coulomb hereda el mismo problema.",
    # 01 Faraday
    "Faraday, hijo de un herrero y casi sin formación matemática, imaginó el espacio lleno de líneas de fuerza. "
    "Las veía con limaduras de hierro. Para él, nada actúa a distancia: el espacio transmite la acción.",
    # 02 Maxwell
    "Maxwell tradujo esas líneas a ecuaciones, y predijo que la luz es una onda electromagnética. "
    "Y los cambios del campo viajan a velocidad finita: si el Sol desapareciera, "
    "la Tierra seguiría orbitando ocho minutos más.",
    # 03 Definición
    "El campo eléctrico es la fuerza sobre una carga de prueba, dividida por esa carga. "
    "Si duplicas la carga de prueba, la fuerza se duplica, pero el campo no cambia. "
    "Se mide en newton por coulomb.",
    # 04 Convención
    "Por convención, el campo se dibuja para una carga de prueba positiva. "
    "Si pones ahí una carga negativa, se invierte la fuerza, no el campo.",
    # 05 Carga puntual
    "Una carga puntual crea un campo ka Q sobre r cuadrado. "
    "Apunta hacia afuera si la carga es positiva, y hacia adentro si es negativa.",
    # 06 Superposición
    "Con varias cargas, cada una aporta su propio campo en el punto P. "
    "El campo neto es la suma de los vectores, no de las magnitudes.",
    # 07 Tangente
    "Faraday pensaba el campo con líneas de fuerza. En cada punto, el vector campo es tangente a la línea. "
    "La línea entrega la dirección; su densidad, la intensidad.",
    # 08 Reglas
    "Las líneas nacen en las cargas positivas, mueren en las negativas, y nunca se cruzan. "
    "De una carga dos q salen el doble de líneas que de menos q: "
    "la mitad termina en ella, y el resto se va al infinito.",
    # 09 Densidad
    "Donde las líneas están más juntas, el campo es más intenso. "
    "Y si son paralelas e igualmente espaciadas, el campo es uniforme: el mismo en todo punto.",
    # 10 Cuatro combinaciones
    "Con dos cargas de igual magnitud, el signo decide. Con el mismo signo, las líneas se repelen, "
    "y en el punto medio el campo es cero. Con signos opuestos, todas las líneas van de una a la otra, "
    "y no hay punto de campo nulo.",
    # 11 Dónde se anula
    "Ahora cambiemos el valor de una carga. Si crece, el punto nulo se acerca a la más chica. "
    "Si se achica, se aleja. Si cambia de signo, el punto nulo sale del segmento, por el lado de la carga más chica. "
    "Con signos opuestos e iguales, desaparece. Y si crece más, reaparece al otro lado. "
    "Siempre se cumple: r uno sobre r dos, igual a la raíz de q uno sobre q dos.",
    # 12 Igualar no basta
    "Ojo: igualar magnitudes no basta. En el punto medio entre más Q y menos Q, los dos campos miden lo mismo, "
    "pero apuntan en el mismo sentido. Ahí el campo no se anula: se suma.",
    # 13 Cierre
    "Cada número de este video se calculó en vivo. Lo que viene: una carga suelta dentro de un campo.",
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
