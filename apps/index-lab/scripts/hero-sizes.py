# Recompone las 5 fotos del Hero a las medidas reales del sitio, SIN texto (el título, la bajada y el botón los pone el HTML).
# Escritorio 447×300 (@2x 894×600) · celular 380×300 (@2x 760×600). Uso: python3 scripts/hero-sizes.py <carpeta_salida>
# El sujeto (personas + carro) va a la derecha, libre del texto HTML de la izquierda.
import sys, numpy as np
from PIL import Image, ImageFilter

SRC = "public/banners/vmc/"
# id, archivo, caja del sujeto en px de la fuente (x0, y0, x1, y1), borrar texto horneado (desde x, hasta x) o None, espejo,
# escala mínima respecto de «llenar el alto» (1 = llena; <1 achica la escena y estira el fondo desde su borde).
# Publica va espejada: el sujeto estaba a la izquierda, donde ahora va el texto (el emblema del carro no se lee a este tamaño).
HEROES = [
    ("01-whatsapp", "hero-whatsapp-c.jpg", (980, 140, 2000, 1080), None, False, 1.0),
    ("02-publica", "hero-publica.jpg", (820, 60, 1900, 1116), None, True, 1.0),
    ("03-negociable", "hero-negociable-a.jpg", (860, 200, 2000, 1116), None, False, 1.0),
    ("04-valoriza-hoy", "hero-valoriza-hoy.jpg", (505, 8, 1165, 470), (452, 498), False, 0.84),
    ("05-valoriza-tiempo", "hero-valoriza-tiempo.jpg", (585, 0, 1175, 600), (470, 540), False, 1.0),
]
# Zona donde cae el sujeto (fracción del lienzo). En el sitio, con el Hero ≤ 700 px de ancho (sus dos medidas), el texto va ABAJO
# a todo el ancho sobre un velo oscuro: las caras deben quedar en el tercio de arriba. Las fotos de estudio ya las tienen ahí;
# Valoriza (escena más baja) sube a la mitad de arriba y su piso se estira hacia abajo, bajo el velo.
FMT = {"desktop": ((894, 600), (0.47, 0.04, 1.0, 1.0)), "mobile": ((760, 600), (0.44, 0.06, 1.0, 1.0))}
ARRIBA = {"desktop": (0.42, 0.02, 1.0, 0.62), "mobile": (0.36, 0.02, 1.0, 0.6)}

def sin_texto(im, rango):
    # El texto horneado está sobre un degradé liso: cada fila se rehace interpolando entre su borde izquierdo y la columna «b»
    # (ambas suavizadas en vertical para no arrastrar detalles) y se funde con la foto entre «a» y «b». Grano leve para que no quede plano.
    a0, b = rango
    arr = np.asarray(im).astype(np.float32); H = arr.shape[0]
    col = lambda x: np.asarray(Image.fromarray(arr[:, x:x + 6].mean(1, keepdims=True).repeat(4, 1).clip(0, 255).astype(np.uint8))
                               .filter(ImageFilter.GaussianBlur(18))).astype(np.float32)[:, :1]
    izq, der = col(4), col(b)
    t = np.linspace(0, 1, b)[None, :, None] ** 1.3
    syn = arr.copy(); syn[:, :b] = izq * (1 - t) + der * t
    syn += np.random.default_rng(1).normal(0, 1.4, (H, arr.shape[1], 1))
    m = np.zeros(arr.shape[1], np.float32); m[:a0] = 1; m[a0:b] = np.linspace(1, 0, b - a0) ** 0.8
    out = syn * m[None, :, None] + arr * (1 - m[None, :, None])
    return Image.fromarray(out.clip(0, 255).astype(np.uint8))

def estira(img, lado, n, k=48):
    # Extiende n px arriba («t») o a la izquierda («l») estirando la franja de k px del borde (sin los 6 px de viñeta): degradé continuo.
    if n <= 0: return img
    iw, ih = img.size
    if lado == "t":
        # Arriba solo las primeras filas (por encima de cualquier objeto), suavizadas en horizontal y fundidas con la foto.
        band = img.crop((0, 1, iw, 4)).resize((iw, 1)).filter(ImageFilter.BoxBlur(iw // 5)).resize((iw, n + 24))
        nw = Image.new("RGB", (iw, ih + n)); nw.paste(img, (0, n))
        m = Image.linear_gradient("L").rotate(180).resize((iw, n + 24))  # opaco arriba, se desvanece en las 24 filas de la foto
        m = m.point(lambda v: 255 if v > 255 * 24 / (n + 24) else int(v * (n + 24) / 24))
        nw.paste(band, (0, 0), m)
    elif lado == "b":
        f = min(90, ih // 3)  # filas de la foto que se funden con el color liso
        band = img.crop((0, ih - f, iw, ih - 1)).resize((iw, 1)).filter(ImageFilter.BoxBlur(iw // 5)).resize((iw, n + f))
        nw = Image.new("RGB", (iw, ih + n)); nw.paste(img, (0, 0))
        m = Image.linear_gradient("L").resize((iw, n + f))
        m = m.point(lambda v: 255 if v > 255 * f / (n + f) else int(v * (n + f) / f))
        nw.paste(band, (0, ih - f), m)
    else:
        band, nw = img.crop((6, 0, 6 + k, ih)), Image.new("RGB", (iw + n, ih))
        nw.paste(band.resize((n + k + 6, ih)).filter(ImageFilter.GaussianBlur(8)), (0, 0)); nw.paste(img.crop((k + 6, 0, iw, ih)), (n + k + 6, 0))
    return nw

def componer(im, caja, size, zona, smin):
    W, H = size; x0, y0, x1, y1 = caja
    zx0, zy0, zx1, zy1 = zona[0] * W, zona[1] * H, zona[2] * W, zona[3] * H
    s = max(min((zx1 - zx0) / (x1 - x0), (zy1 - zy0) / (y1 - y0)), H / im.size[1] * smin)
    w, h = round(im.size[0] * s), round(im.size[1] * s)
    ox = round((zx0 + zx1) / 2 - (x0 + x1) / 2 * s)
    ox = min(ox, round(W * 0.985 - x1 * s))  # el sujeto no se sale por la derecha…
    ox = max(ox, W - w)                       # …ni queda un hueco a la derecha
    oy = max(round(zy1 - y1 * s), H - h) if h >= H else round(zy0 - y0 * s)
    img = im.resize((w, h), Image.LANCZOS).crop((max(-ox, 0), max(-oy, 0), min(w, W - ox), min(h, H - oy)))
    img = estira(estira(img, "t", max(oy, 0)), "b", H - max(oy, 0) - img.size[1])
    return estira(img, "l", max(ox, 0))

if __name__ == "__main__":
    out = sys.argv[1]
    for hid, f, caja, borrar, espejo, smin in HEROES:
        im = Image.open(SRC + f).convert("RGB")
        if espejo: im = im.transpose(Image.FLIP_LEFT_RIGHT)
        if borrar: im = sin_texto(im, borrar)
        for fmt, (size, zona) in FMT.items():
            x2 = componer(im, caja, size, ARRIBA[fmt] if borrar else zona, 0 if borrar else smin)
            assert x2.size == size, (hid, fmt, x2.size)
            x2.save(f"{out}/hero-{hid}-{fmt}@2x.jpg", quality=90, optimize=True, progressive=True)
            x2.resize((size[0] // 2, size[1] // 2), Image.LANCZOS).save(f"{out}/hero-{hid}-{fmt}.jpg", quality=90, optimize=True, progressive=True)
            print("✓", hid, fmt)
