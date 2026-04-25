"""
Genere les icones PWA pour Tamba Politique.
Necessite: pip install Pillow
"""
from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'frontend', 'public', 'icons')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fond vert arrondi
    padding = size // 10
    radius = size // 5
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=radius,
        fill=(22, 163, 74, 255)
    )

    # Texte "TP"
    font_size = size // 3
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

    text = "TP"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) // 2
    y = (size - text_h) // 2 - bbox[1]
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

    path = os.path.join(OUTPUT_DIR, f'icon-{size}x{size}.png')
    img.save(path, 'PNG')
    print(f'Cree: {path}')

for size in SIZES:
    create_icon(size)

print('Toutes les icones ont ete generees !')
