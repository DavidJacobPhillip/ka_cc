#!/usr/bin/env python3
"""
Rebuild the nine large ingredient illustrations from "KCC Website Aromatics.svg".

    python3 scripts/build-ingredient-art.py            # write assets/
    python3 scripts/build-ingredient-art.py --dry-run  # just report

The master is a sheet of nine section mock-ups, one per spice, each holding the
heading, the spice name, the benefit lines, the big drawing, the row of nine
button icons and the FDA disclaimer. Only the big drawing is wanted here, so
everything else is dropped:

  * <text>, <ellipse> (the button rings) and <rect> (the artboard bounds)
  * the nine nested groups named after the button icons - note the artboard
    itself is named after a spice too, so only descendants are checked
  * any path carrying an explicit fill: the drawings are the unfilled paths
    that default to black, while every button-icon path is terracotta

Each ancestor matrix is baked into the point data so the emitted file carries
no transform of its own, and the viewBox is the drawing's own bounds - the
artboard rect is 2-3x the drawing, and keeping it would letterbox every
illustration differently.

The value of this sheet is that Santosh drew all nine at a matched scale, so
line weight reads the same from one spice to the next. That only survives if
they are *not* each cropped to their own ink and then stretched to fill the
panel, so the viewBox is padded out to a shared aspect ratio and a shared
units-per-item scale instead. See pad_to_common().
"""
import math
import re
import sys
import xml.etree.ElementTree as ET

SRC = "KCC Website Aromatics.svg"
NS = "{http://www.w3.org/2000/svg}"
INK = "#754B2A"
# The drawings are ~1700 units wide and show at roughly 600px, so one unit is
# about a third of a pixel; 1dp is a tenth of that and saves a fifth of the file.
PREC = 1

# Artboard id -> output asset. The ids are Affinity layer names.
SPICES = {
    "Cardamom": "ingredient-art-cardamom.svg",
    "Cinnamon": "ingredient-art-cinnamon.svg",
    "Cloves": "ingredient-art-cloves.svg",
    "Black Pepper": "ingredient-art-pepper.svg",
    "Carom Seeds": "ingredient-art-carom.svg",
    "Star Anise": "ingredient-art-star-anise.svg",
    "Ginger": "ingredient-art-ginger.svg",
    "Black Tea": "ingredient-art-tea.svg",
    "Coffee": "ingredient-art-coffee.svg",
}

# The nested groups that make up the button row, by the name Affinity gave them.
BUTTONS = {
    "Cardamom", "Black Pepper", "Cloves", "Cinnamon", "Carom Seeds (Ajwain)",
    "Ginger", "Coffee Beans", "Star Anise", "Black Tea",
}


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


def name_of(el):
    return el.get("{http://www.serif.com/}id") or el.get("id")


def walk(el, m, out):
    """Collect (d, matrix) for every drawing path under el."""
    for child in el:
        tag = child.tag
        if tag in (NS + "text", NS + "ellipse", NS + "rect"):
            continue
        cm = mat_mul(m, parse_transform(child.get("transform")))
        if tag == NS + "g":
            if name_of(child) in BUTTONS:
                continue
            walk(child, cm, out)
        elif tag == NS + "path":
            # Every button-icon path is explicitly filled; the drawing's are not.
            if "fill:" in (child.get("style") or "") or child.get("fill"):
                continue
            d = child.get("d")
            if d:
                out.append((d, cm))


def bezier_bbox(p0, p1, p2, p3):
    """Exact bounds of a cubic: endpoints plus any in-range derivative roots."""
    lo = [min(p0[i], p3[i]) for i in (0, 1)]
    hi = [max(p0[i], p3[i]) for i in (0, 1)]
    for i in (0, 1):
        a = -p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]
        b = 2 * (p0[i] - 2 * p1[i] + p2[i])
        c = p1[i] - p0[i]
        roots = []
        if abs(a) < 1e-12:
            if abs(b) > 1e-12:
                roots.append(-c / b)
        else:
            disc = b * b - 4 * a * c
            if disc >= 0:
                r = math.sqrt(disc)
                roots += [(-b + r) / (2 * a), (-b - r) / (2 * a)]
        for t in roots:
            if 0 < t < 1:
                u = 1 - t
                v = (u ** 3 * p0[i] + 3 * u * u * t * p1[i]
                     + 3 * u * t * t * p2[i] + t ** 3 * p3[i])
                lo[i] = min(lo[i], v)
                hi[i] = max(hi[i], v)
    return lo, hi


def fmt(v):
    s = f"{round(v, PREC):.{PREC}f}".rstrip("0").rstrip(".")
    if s in ("", "-0", "0"):
        return "0"
    if s.startswith("0."):
        s = s[1:]
    elif s.startswith("-0."):
        s = "-" + s[2:]
    return s


def join(nums):
    out = ""
    for n in nums:
        s = fmt(n)
        if out and not s.startswith("-"):
            out += " "
        out += s
    return out


def transform_path(d, m, box):
    """Absolute M/L/C/Z through m -> compact relative data, growing box."""
    tokens = re.findall(r"([A-Za-z])|(-?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)", d)
    flat = [t[0] if t[0] else float(t[1]) for t in tokens]
    for t in flat:
        if isinstance(t, str) and t not in "MLCZ":
            raise SystemExit(f"unsupported path command {t!r} - extend transform_path")
    out, i = [], 0
    cur = start = None
    while i < len(flat):
        cmd = flat[i]
        i += 1
        if cmd == "Z":
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
                box(pts[0], pts[0])
            elif cmd == "C":
                lo, hi = bezier_bbox(cur, pts[0], pts[1], pts[2])
                box(lo, hi)
                rel = []
                for px, py in pts:
                    rel += [px - cur[0], py - cur[1]]
                out.append("c" + join(rel))
                cur = pts[2]
            else:
                box(pts[0], pts[0])
                out.append("l" + join([pts[0][0] - cur[0], pts[0][1] - cur[1]]))
                cur = pts[0]
            first = False
    return "".join(out)


def extract(root):
    """artboard name -> (list of path data, (x0, y0, x1, y1))."""
    # Direct children of <svg> only. Every artboard also *contains* a group
    # named after a spice - the button icon - and a document-order search finds
    # Ginger's nested "Cardamom" button long before the Cardamom artboard.
    found = {}
    for el in root:
        n = name_of(el)
        if el.tag == NS + "g" and n in SPICES:
            found[n] = el
    missing = set(SPICES) - set(found)
    if missing:
        raise SystemExit(f"artboards not found in {SRC}: {sorted(missing)}")

    result = {}
    for name, el in found.items():
        raw = []
        walk(el, parse_transform(el.get("transform")), raw)
        bounds = [math.inf, math.inf, -math.inf, -math.inf]

        def box(lo, hi, b=bounds):
            b[0] = min(b[0], lo[0]); b[1] = min(b[1], lo[1])
            b[2] = max(b[2], hi[0]); b[3] = max(b[3], hi[1])

        ds = [transform_path(d, m, box) for d, m in raw]
        result[name] = (ds, tuple(bounds))
    return result


def common_box(result):
    """
    One viewBox *size* for all nine, not just one shape.

    Santosh drew the nine at a matched scale so the line weight reads the same
    from spice to spice. Cropping each to its own ink and letting CSS fit it to
    the panel would throw that away - the smallest drawing would be magnified
    19% more than the largest. So every file gets the same box, big enough for
    the widest and the tallest, centred on that drawing's own ink. Same box and
    same panel means the same scale on screen.
    """
    w = max(b[2] - b[0] for _, b in result.values())
    h = max(b[3] - b[1] for _, b in result.values())
    pad = 0.02 * max(w, h)
    w += 2 * pad
    h += 2 * pad
    out = {}
    for name, (ds, b) in result.items():
        cx, cy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
        out[name] = (ds, (cx - w / 2, cy - h / 2, w, h))
    return out, w / h


def main():
    dry = "--dry-run" in sys.argv
    root = ET.parse(SRC).getroot()
    padded, ratio = common_box(extract(root))
    print(f"shared box, aspect ratio {ratio:.4f}")
    for name in SPICES:
        ds, (x, y, w, h) = padded[name]
        body = "".join(f'<path d="{d}"/>' for d in ds)
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" fill="' + INK + '" '
            'style="fill-rule:evenodd;clip-rule:evenodd" '
            f'viewBox="{fmt(x)} {fmt(y)} {fmt(w)} {fmt(h)}">{body}</svg>'
        )
        path = "assets/" + SPICES[name]
        print(f"{name:<13} {len(ds):>5} paths  {len(svg) / 1024:>7.1f} KB  "
              f"{fmt(w)}x{fmt(h)}  -> {path}")
        if not dry:
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(svg)


if __name__ == "__main__":
    main()
