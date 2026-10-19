"""Uso: python herramientas/marcas.py 4:12.5 4:fin 7:3   ->  cuadros globales separados por coma
Replica la línea de tiempo de src/linea.ts (respiro, cola, mínimos y solape) para revisar escenas sueltas.
'fin' es el último cuadro de la escena y 'mitad' su mitad."""
import json, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
voz = json.loads((RAIZ / "src" / "voz.json").read_text())
linea = (RAIZ / "src" / "linea.ts").read_text(encoding="utf-8")
minimos = [float(x) for x in __import__("re").findall(r"minimo: ([\d.]+)", linea)]
FPS, SOLAPE = 30, 12
durs = [max(m, 0.45 + v + 0.9 + (3 if i == len(voz) - 1 else 0)) for i, (m, v) in enumerate(zip(minimos, voz))]
frames = [round(d * FPS) for d in durs]
inicios, acc = [], 0
for f in frames:
    inicios.append(acc)
    acc += f - SOLAPE
salida = []
for arg in sys.argv[1:]:
    e, s = arg.split(":")
    e = int(e)
    if s == "fin":
        salida.append(inicios[e] + frames[e] - SOLAPE - 2)
    elif s == "mitad":
        salida.append(inicios[e] + frames[e] // 2)
    else:
        salida.append(inicios[e] + round(float(s) * FPS))
print(",".join(map(str, salida)))
