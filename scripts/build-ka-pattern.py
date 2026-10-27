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
step = 255 // (ALPHA_LEVELS - 1)
alpha = alpha.point(lambda v: min(255, (v + step // 2) // step * step))
mask = Image.new("RGBA", im.size, (255, 255, 255, 0))
mask.putalpha(alpha)
mask.save(OUT, optimize=True)

print(f"{SRC} {w}x{h} -> {OUT} {mask.size[0]}x{mask.size[1]}")
