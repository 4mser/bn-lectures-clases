"""Narración del reel «Una carga en un campo» (movimiento de una carga en un campo uniforme, al estilo del reel de B&N Lab sobre la ley de Gauss).

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
    # 00 Campo uniforme
    "Entre dos placas paralelas, las líneas de campo son rectas, paralelas e igualmente espaciadas. "
    "Es un campo uniforme: el mismo módulo y la misma dirección en todo punto.",
    # 01 El signo decide
    "Pon una carga ahí. La fuerza es cu por E. Si la carga es positiva, empuja a favor de las líneas. "
    "Si es negativa, en contra. Las líneas nunca se invierten: lo que se invierte es la fuerza.",
    # 02 Gravedad
    "Ahora, Newton. En gravedad uniforme, eme a es igual a eme ge. La masa se cancela, "
    "y todos los cuerpos caen con la misma aceleración: nueve coma ocho metros por segundo al cuadrado.",
    # 03 Cu sobre eme
    "En un campo eléctrico, eme a es igual a cu E. La aceleración es cu sobre eme, por E, "
    "y cambia de una partícula a otra. Por eso un campo eléctrico separa partículas. La gravedad no puede.",
    # 04 Tres lanzamientos
    "Lancemos tres partículas de lado, con la misma masa y la misma velocidad. "
    "La positiva se curva con el campo, la neutra sigue recta, y la negativa se curva en contra.",
    # 05 Parábola
    "En equis, el movimiento es uniforme: avanza lo mismo en cada intervalo. "
    "En ye, es acelerado: baja uno, cuatro, nueve, dieciséis. El resultado es una parábola.",
    # 06 Tiro parabólico
    "Con un ángulo de lanzamiento, es palabra por palabra el tiro parabólico de mecánica. "
    "Solo cambia una cosa: donde estaba ge, ahora va cu E sobre eme.",
    # 07 Línea y trayectoria
    "Pero ojo: las líneas de campo son rectas, y la trayectoria es curva. La línea marca la fuerza; "
    "la trayectoria sigue a la velocidad. Solo coinciden si la carga parte del reposo.",
    # 08 Electrón
    "Ahora con números. Un electrón, en un campo modesto de mil newtons por coulomb. "
    "Su aceleración es e por E sobre su masa: uno coma ocho por diez a la catorce metros por segundo al cuadrado.",
    # 09 Contra la gravedad
    "Eso es dieciocho billones de veces la aceleración de gravedad. "
    "Por eso, con partículas elementales, la gravedad se desprecia sin más comentario.",
    # 10 Un centímetro
    "Pongámoslo en tiempo. Para recorrer un centímetro desde el reposo, el electrón tarda menos de once nanosegundos. "
    "Una piedra en caída libre tarda cuarenta y cinco milisegundos.",
    # 11 Ambos campos
    "Si actúan los dos campos, las aceleraciones se suman: a es ge, más cu sobre eme por E. "
    "En la gota de Millikan la masa es macroscópica, y la gravedad no se puede despreciar. "
    "Cuando la fuerza eléctrica la compensa, la gota queda en equilibrio.",
    # 12 Cierre
    "Cada número de este video se calculó en vivo. Queda una pregunta: si la carga está cuantizada, "
    "¿por qué podemos usar densidades continuas? Lo que viene: de lo discreto a lo continuo.",
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
