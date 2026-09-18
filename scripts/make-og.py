"""
The share image: 1200 x 630 (1.91:1), the size Open Graph and X both use.

    python scripts/make-og.py <path to Big Shoulders latin .woff2>

The night plate from the hero, with the name on its roof in the site's own
face and the opening line under it. Written to src/app as opengraph-image.jpg
and twitter-image.jpg, which Next picks up by name. Re-run after the plates
change.
"""
import io
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..")
W, H = 1200, 630
INK = (13, 14, 12)
BONE = (240, 236, 226)
GRAY = (166, 163, 155)


def face(path, wght, size):
    f = TTFont(path)
    f.flavor = None
    axes = {a.axisTag: a for a in f["fvar"].axes} if "fvar" in f else {}
    pin = {}
    if "wght" in axes:
        pin["wght"] = wght
    if "opsz" in axes:
        pin["opsz"] = axes["opsz"].maxValue
    if pin:
        f = instancer.instantiateVariableFont(f, pin)
    buf = io.BytesIO()
    f.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


def main(woff):
    img = Image.new("RGB", (W, H), INK)

    # The sky: dark overhead, a little light held low behind the roof.
    sky = Image.new("RGB", (1, H))
    for y in range(H):
        t = min(1, y / 300)
        c = [int(INK[i] + (b - INK[i]) * t) for i, b in enumerate((26, 32, 48))]
        sky.putpixel((0, y), tuple(c))
    img.paste(sky.resize((W, H)))

    # The building, from the roof down.
    plate = Image.open(os.path.join(ROOT, "public/images/graded/hero-facade-night-wide.jpg")).convert("RGB")
    s = W / plate.width
    plate = plate.resize((W, round(plate.height * s)), Image.LANCZOS)
    roof = 262
    img.paste(plate, (0, roof - round(30 * s)))

    # The name on the roof: a faint shadow, then the face, its feet behind the parapet.
    sign = face(woff, 800, 250)
    d = ImageDraw.Draw(img)
    word = "DEVSOC"
    bb = d.textbbox((0, 0), word, font=sign)
    x = (W - (bb[2] - bb[0])) // 2 - bb[0]
    y = roof + 14 - bb[3]
    shadow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(shadow).text((x + 4, y + 8), word, font=sign, fill=150)
    img.paste(Image.new("RGB", (W, H), (0, 0, 0)), (0, 0), shadow.filter(ImageFilter.GaussianBlur(10)))
    letters = Image.new("L", (W, H), 0)
    ImageDraw.Draw(letters).text((x, y), word, font=sign, fill=255)
    # The parapet covers the feet of the letters.
    letters.paste(0, (0, roof + 2, W, H))
    img.paste(Image.new("RGB", (W, H), BONE), (0, 0), letters)

    # The foot: a fade to ink, the line, and where.
    fade = Image.new("L", (1, H))
    for yy in range(H):
        fade.putpixel((0, yy), int(255 * max(0, min(1, (yy - 430) / 150))))
    img.paste(Image.new("RGB", (W, H), INK), (0, 0), fade.resize((W, H)))
    line = face(woff, 800, 58)
    d.text((56, 540), "THE CAMPUS SLEEPS.", font=line, fill=BONE, anchor="ls")
    d.text((56, 596), "SOME ROOMS STAY LIT.", font=line, fill=(251, 248, 240), anchor="ls")
    small = face(woff, 600, 26)
    d.text((W - 56, 596), "DEVELOPERS' SOCIETY, BITS PILANI GOA", font=small, fill=GRAY, anchor="rs")

    for name in ("opengraph-image.jpg", "twitter-image.jpg"):
        img.save(os.path.join(ROOT, "src/app", name), quality=86, optimize=True, progressive=True)
    print("written")


if __name__ == "__main__":
    main(sys.argv[1])
