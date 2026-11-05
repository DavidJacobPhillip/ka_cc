#!/usr/bin/env python3
"""
Build assets/south-asia-map.svg from the Wikimedia source map.

Source: "India states and union territories map.svg" by Filpro, CC BY-SA 3.0
        https://commons.wikimedia.org/wiki/File:India_states_and_union_territories_map.svg

The derivative is share-alike, so assets/south-asia-map.svg ships under CC BY-SA
3.0 as well and the credit sits in the section that uses it. Nothing else in the
theme is affected by that licence.

What this keeps and what it throws away is the whole point:

  kept     the 37 state and union-territory outlines, each with its own id, so
           the page can fill one language's regions
  dropped   every internal national border, the Kashmir control lines and the
           disputed-area shading. The section never asserts where a national
           border runs - it lights Indian states and says the rest in words.
  dropped   96 text labels, the legend, the coordinate grid and the scale bar

Coordinates are rounded to whole units. The viewBox is 1638 wide and the map
renders at about 500px, so one unit is under a fifth of a pixel.

  python3 scripts/build-south-asia-map.py <path to the downloaded source.svg>
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "south-asia-map.svg"


def group_body(svg, name):
    m = re.search(r'<g[^>]*id="%s"[^>]*>' % re.escape(name), svg)
    if not m:
        return ""
    i, depth = m.end(), 1
    while depth and i < len(svg):
        n = re.search(r"<g\b|</g>", svg[i:])
        if not n:
            break
        depth += 1 if n.group(0) == "<g" else -1
        i += n.end()
    return svg[m.end(): i - 4]


def paths(frag):
    out = []
    for m in re.finditer(r"<path\b[^>]*?>", frag):
        tag = m.group(0)
        pid = re.search(r'id="([^"]+)"', tag)
        d = re.search(r'\sd="([^"]+)"', tag)
        if pid and d:
            out.append((pid.group(1), d.group(1)))
    return out


def shrink(d):
    """Round every coordinate to one decimal and collapse the whitespace.

    Deliberately conservative. A first version rounded to whole units and
    stripped the spaces around command letters as well; that produced a map of
    scattered blobs, because SVG path data lets a minus sign stand in for a
    separator and rewriting the numbers without re-deriving the separators runs
    two coordinates together. Only the numbers are touched here, each one in
    place, and every separator the source wrote is left exactly as it was.
    """
    return re.sub(r"-?\d+\.\d+",
                  lambda m: ("%.1f" % float(m.group(0))).rstrip("0").rstrip("."),
                  d)


def main(src):
    svg = Path(src).read_text(encoding="utf8", errors="replace")
    view = re.search(r'viewBox="([^"]+)"', svg).group(1)

    regions = (
        paths(group_body(svg, "states_1_"))
        + paths(group_body(svg, "union_territory"))
        + paths(group_body(svg, "disp_states"))
    )
    # The source's "foreign" and "water" shapes are not neighbouring countries -
    # they are a crude backdrop that reads as a beige rectangle behind the
    # subcontinent. Dropped: the page puts the map on its own ground, and the
    # countries beyond India are named in words rather than drawn.
    base = []

    seen, out = set(), []
    for pid, d in regions:
        key = re.sub(r"_2_$", "", pid).lower()
        if key in seen:
            continue
        seen.add(key)
        out.append((key, shrink(d)))

    body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<!-- Derived from 'India states and union territories map.svg' by Filpro,",
        "     CC BY-SA 3.0, via Wikimedia Commons. This derivative is CC BY-SA 3.0.",
        "     Rebuild with scripts/build-south-asia-map.py. -->",
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" '
        'preserveAspectRatio="xMidYMid meet" role="img">' % view,
    ]
    for pid, d in base:
        body.append('<path class="kcc-map__%s" d="%s"/>' % (pid, d))
    body.append('<g class="kcc-map__regions">')
    for pid, d in out:
        body.append('<path id="kcc-map-%s" class="kcc-map__region" d="%s"/>' % (pid, d))
    body.append("</g>")
    body.append("</svg>")

    OUT.write_text("\n".join(body) + "\n", encoding="utf8")
    print("wrote %s  (%d regions, %.0f KB)" % (OUT.relative_to(ROOT), len(out), OUT.stat().st_size / 1024))
    print("ids:", " ".join(sorted(i for i, _ in out)))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
