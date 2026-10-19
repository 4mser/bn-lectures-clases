"""Narración del reel «Densidades no uniformes» (Clase 2, §2 a §4 y §6, al estilo del reel de B&N Lab sobre la ley de Gauss).

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
    # 00 Intro
    "Hasta ahora, todas las densidades eran uniformes. Pero la carga no siempre se reparte pareja. "
    "Hoy, dos ejercicios donde lambda cambia de un punto a otro.",
    # 01 La receta
    "Siempre la misma receta, en siete pasos. Fijar P. Escribir de cu. Armar la geometría. Aplicar Coulomb. "
    "Usar la simetría, si existe. Integrar. Y revisar.",
    # 02 Componentes, no módulos
    "Una regla que no se negocia: se suman componentes, no módulos. Si sumamos los largos, "
    "el resultado sale más grande que el campo real.",
    # 03 Ejercicio 1: dq
    "Primer ejercicio. Una barra va de a hasta b, con lambda igual a alfa equis: la densidad crece hacia la derecha. "
    "Cada trocito aporta de cu igual a alfa equis de equis.",
    # 04 Ejercicio 1: aportes
    "P está en el origen, así que erre es igual a equis. Todos los aportes van sobre el eje: nada que cancelar. "
    "Los trozos lejanos tienen más carga, pero cada aporte cae como uno sobre equis.",
    # 05 Ejercicio 1: integral
    "Sumamos de a hasta b, y la integral es el logaritmo de b sobre a. Con diez y treinta centímetros, "
    "y alfa igual a cuatro nanocoulomb por metro cuadrado, el campo es treinta y nueve coma cinco newton por coulomb.",
    # 06 Ejercicio 1: revisar
    "Revisamos. Si b se acerca a a, la barra desaparece y el campo tiende a cero, como debe ser. "
    "La carga total es cero coma dieciséis nanocoulomb.",
    # 07 La fórmula uniforme no sirve
    "Si repartimos esa misma carga de forma pareja, la fórmula de la barra uniforme da cuarenta y siete coma nueve. "
    "La misma carga total no basta: importa cómo se reparte.",
    # 08 Ejercicio 2: lambda cero
    "Segundo ejercicio. Doce microcoulomb en un semicírculo de sesenta centímetros, con lambda igual a "
    "lambda cero por coseno de theta: máxima arriba, nula en los extremos. "
    "La carga total es dos lambda cero erre, y lambda cero vale diez microcoulomb por metro.",
    # 09 Ejercicio 2: simetría
    "Como el coseno es par, los trozos en más theta y menos theta tienen la misma carga, "
    "y sus componentes horizontales se cancelan. La densidad no es uniforme, pero sí es par.",
    # 10 Ejercicio 2: integral
    "Sobrevive la vertical. La integral de coseno cuadrado da pi medios, y el campo en P es pi ka lambda cero "
    "sobre dos erre: unos doscientos treinta y cinco mil newton por coulomb, hacia abajo.",
    # 11 Ejercicio 2: fuerza
    "Con el campo listo, la fuerza sobre menos dos microcoulomb es una multiplicación: "
    "cero coma cuarenta y siete newton, hacia arriba, opuesta al campo.",
    # 12 Otra herramienta
    "Integrar sirve para cualquier distribución. Pero basta mover P y las cuentas se vuelven difíciles. "
    "Necesitamos otra herramienta.",
    # 13 Cierre
    "Cada número de este video se calculó en vivo. Lo que viene: la ley de Gauss.",
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
