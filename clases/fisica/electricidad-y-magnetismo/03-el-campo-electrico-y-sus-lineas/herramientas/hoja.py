"""Uso: python herramientas/hoja.py <carpeta> <salida.png> [columnas] [ancho]
Junta los PNG de una carpeta en una hoja de contacto para revisarlos de una vez."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

carpeta, salida = Path(sys.argv[1]), sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 2
ancho = int(sys.argv[4]) if len(sys.argv) > 4 else 960
fs = sorted(p for p in carpeta.glob("*.png"))
alto = ancho * 5 // 4
filas = (len(fs) + cols - 1) // cols
hoja = Image.new("RGB", (cols * ancho, filas * alto), "white")
d = ImageDraw.Draw(hoja)
for i, f in enumerate(fs):
    im = Image.open(f).convert("RGB").resize((ancho, alto))
    x, y = (i % cols) * ancho, (i // cols) * alto
    hoja.paste(im, (x, y))
    d.rectangle([x, y, x + 150, y + 22], fill="black")
    d.text((x + 6, y + 5), f.stem, fill="white")
hoja.save(salida)
print(salida, len(fs))
