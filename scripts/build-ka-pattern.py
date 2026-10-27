#!/usr/bin/env python3
"""
Turn "KCC Ka Pattern.png" into the alpha mask the why-ka backdrop uses.

    python3 scripts/build-ka-pattern.py [width]

The master is cream letterforms on solid black - two colours and nothing else.
Baking that in as an image would fix both the ink and the ground, so instead
the letterforms become an alpha channel over flat white: CSS then paints them
with mask-image and whatever background-color the section's scheme gives, and
the same file works on a dark band or a cream one.

It is also most of why the file is small. 5.4MB of RGBA black-and-cream comes
out at 329KB as one colour plus alpha, and the alpha is what carries the
antialiasing, so the edges survive the trip.
"""
import sys
from PIL import Image

SRC = "KCC Ka Pattern.png"
OUT = "assets/ka-pattern.png"
WIDTH = int(sys.argv[1]) if len(sys.argv) > 1 else 1400
# The alpha is quantised before it is written. Full 256-level antialiasing is
# 863KB; sixteen levels is 329KB and the backdrop shows at roughly a tenth
# opacity, where a step is half a percent of a percent of lightness.
ALPHA_LEVELS = 16

im = Image.open(SRC).convert("RGB")
w, h = im.size
im = im.resize((WIDTH, round(h * WIDTH / w)), Image.LANCZOS)

# Luminance is the alpha: cream letterform opaque, black ground clear.
alpha = im.convert("L")

# Stretched to the full range first. The master's cream reads as luminance 238,
# not 255, so a letterform would come out 93% opaque and the colour CSS paints
# it with would land a step lighter than the one that was asked for - the
# backdrop colour is a setting now, so it has to mean what it says.
#
# Against the plateau rather than the extrema: a handful of pixels in the
# master already sit at 255, which makes a plain min/max stretch do nothing at
# all. The plateau is the brightest level that covers a real share of the
# image, which is the body of the letterforms.
hist = alpha.histogram()
total = sum(hist)
plateau = max(v for v, count in enumerate(hist) if count >= total * 0.005)
if plateau < 255:
    scale = 255.0 / plateau
    alpha = alpha.point(lambda v: min(255, round(v * scale)))

step = 255 // (ALPHA_LEVELS - 1)
alpha = alpha.point(lambda v: min(255, (v + step // 2) // step * step))
mask = Image.new("RGBA", im.size, (255, 255, 255, 0))
mask.putalpha(alpha)
mask.save(OUT, optimize=True)

print(f"{SRC} {w}x{h} -> {OUT} {mask.size[0]}x{mask.size[1]}")
