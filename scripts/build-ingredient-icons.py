#!/usr/bin/env python3
"""
Extract one ingredient button icon from "KCC Ingredient Buttons.svg".

    python3 scripts/build-ingredient-icons.py <Layer-Id> [handle]

Prints the <symbol> markup to paste into snippets/ingredient-icon-sprite.liquid.
The master lives in KCC Website/ (outside this repo), so this exists to make
the extraction repeatable rather than hand-transcribed.

What it does:
  * Bakes every ancestor matrix - the #Buttons matrix plus the layer's own
    nested transforms - into the point data, so the emitted symbol carries no
    transform of its own. A wrapper <g transform> that has to agree with the
    viewBox is exactly how a transform got applied twice here once before.
  * Derives the viewBox from the layer's own ring ellipse rather than hardcoding
    it, so the icon lands in the same 50x50 circle the artist drew it in and
    stays in proportion with the other eight.
  * Drops that ring: the button's CSS border draws it, and keeping both would
    double the stroke.
  * Leaves the fill off every path so they inherit the symbol's currentColor,
    which is what lets the active button switch to the dark ink.
"""
import math
import re
import sys
import xml.etree.ElementTree as ET

SRC = "../../KCC Ingredient Buttons.svg"
NS = "{http://www.w3.org/2000/svg}"


def mat_mul(a, b):
    a0, a1, a2, a3, a4, a5 = a
    b0, b1, b2, b3, b4, b5 = b
    return (a0 * b0 + a2 * b1, a1 * b0 + a3 * b1,
            a0 * b2 + a2 * b3, a1 * b2 + a3 * b3,
            a0 * b4 + a2 * b5 + a4, a1 * b4 + a3 * b5 + a5)


def parse_transform(s):
    m = (1.0, 0, 0, 1.0, 0, 0)
    for name, args in re.findall(r"(matrix|translate|scale|rotate)\s*\(([^)]*)\)", s or ""):
        v = [float(x) for x in re.split(r"[,\s]+", args.strip()) if x]
        if name == "matrix":
            t = tuple(v)
        elif name == "translate":
            t = (1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0)
        elif name == "scale":
            sx = v[0]
            sy = v[1] if len(v) > 1 else sx
            t = (sx, 0, 0, sy, 0, 0)
        else:
            a = math.radians(v[0])
            c, s_ = math.cos(a), math.sin(a)
            t = (c, s_, -s_, c, 0, 0)
            if len(v) == 3:
                t = mat_mul((1, 0, 0, 1, v[1], v[2]), mat_mul(t, (1, 0, 0, 1, -v[1], -v[2])))
        m = mat_mul(m, t)
    return m


def apply(m, x, y):
    return (m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5])


def fmt(v):
    """Shortest form that still round-trips at 2dp: .5 not 0.50, 3 not 3.00."""
    s = f"{round(v, 2):.2f}".rstrip("0").rstrip(".")
    if s in ("", "-0", "0"):
        return "0"
    if s.startswith("0."):
        s = s[1:]
    elif s.startswith("-0."):
        s = "-" + s[2:]
    return s


def join(nums):
    """Space-separate, but drop the space before a minus sign."""
    out = ""
    for n in nums:
        s = fmt(n)
        if out and not s.startswith("-"):
            out += " "
        out += s
    return out


def transform_path(d, m):
    """Absolute M/L/C/Z through matrix m -> compact relative path data."""
    tokens = re.findall(r"([MLCZmlcz])|(-?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)", d)
    flat = [t[0] if t[0] else float(t[1]) for t in tokens]
    out, i = [], 0
    cur = start = None
    while i < len(flat):
        cmd = flat[i]
        i += 1
        if cmd in ("Z", "z"):
            out.append("z")
            cur = start
            continue
        n = {"M": 2, "L": 2, "C": 6}[cmd]
        first = True
        while i < len(flat) and not isinstance(flat[i], str):
            vals = flat[i:i + n]
            i += n
            pts = [apply(m, vals[k], vals[k + 1]) for k in range(0, n, 2)]
            if cmd == "M" and first:
                out.append("M" + join([pts[0][0], pts[0][1]]))
                cur = start = pts[0]
            elif cmd == "C":
                rel = []
                for px, py in pts:
                    rel += [px - cur[0], py - cur[1]]
                out.append("c" + join(rel))
                cur = pts[2]
            else:
                out.append("l" + join([pts[0][0] - cur[0], pts[0][1] - cur[1]]))
                cur = pts[0]
            first = False
    # "z" needs no separator; a letter already separates the rest.
    return "".join(out)


def find_layer(node, wanted):
    for child in node:
        if child.get("id") == wanted:
            return child
        found = find_layer(child, wanted)
        if found is not None:
            return found
    return None


def collect(node, m, paths, rings):
    for child in node:
        tag = child.tag.replace(NS, "")
        cm = mat_mul(m, parse_transform(child.get("transform")))
        style = child.get("style") or ""
        if tag == "path":
            if "fill:none" not in style:
                paths.append((child.get("d"), cm))
        elif tag == "ellipse":
            rings.append((child, cm))
        elif tag == "g":
            collect(child, cm, paths, rings)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    layer_id = sys.argv[1]
    handle = sys.argv[2] if len(sys.argv) > 2 else layer_id.lower()

    root = ET.parse(SRC).getroot()
    buttons = find_layer(root, "Buttons")
    layer = find_layer(buttons, layer_id)
    if layer is None:
        sys.exit(f"no layer {layer_id!r} under #Buttons")

    base = mat_mul(parse_transform(buttons.get("transform")),
                   parse_transform(layer.get("transform")))
    paths, rings = [], []
    collect(layer, base, paths, rings)
    if not rings:
        sys.exit(f"{layer_id} has no ring ellipse to frame it by")

    ring, rm = rings[0]
    cx, cy = apply(rm, float(ring.get("cx")), float(ring.get("cy")))
    rx = abs(rm[0]) * float(ring.get("rx"))
    ry = abs(rm[3]) * float(ring.get("ry"))
    vb = f"{cx - rx:.2f} {cy - ry:.2f} {2 * rx:.2f} {2 * ry:.2f}"

    body = "".join(f'<path d="{transform_path(d, m)}"/>' for d, m in paths)
    print(
        f'<symbol id="kcc-ing-{{{{ uid }}}}-{handle}" viewBox="{vb}" fill="currentColor"'
        ' style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;'
        f'stroke-linejoin:round;stroke-miterlimit:1.5">{body}</symbol>'
    )
    print(f"\n<!-- {layer_id}: {len(paths)} paths, ring r={rx:.2f}x{ry:.2f} -->", file=sys.stderr)


if __name__ == "__main__":
    main()
