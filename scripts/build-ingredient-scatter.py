#!/usr/bin/env python3
"""
Build assets/ingredient-scatter.svg from the "KCC All.svg" master.

    python3 scripts/build-ingredient-scatter.py [tolerance] [outfile]

Run this from the theme root whenever the master drawing changes. The master
is gitignored (4.3MB); only the derivative it produces is committed.

Why this exists at all - the master is an Affinity/Serif export and is not
servable as-is:

  * Every one of its ~5,900 paths sits under a stack of nested matrices, with
    coordinates in the tens of thousands. Baking each path's full ancestor
    transform into its point data and rounding in the final user space is most
    of the 4.3MB -> 567KB.
  * The contours are expanded outlines (every "line" is a closed filled shape),
    carrying far more bezier detail than a 9%-opacity watermark can show.
    They're flattened to polylines and simplified with Ramer-Douglas-Peucker at
    a tolerance scaled to each shape's own size - a flat tolerance gets set by
    the big cinnamon-stick contours and turns the 3-unit fennel seeds into
    visible octagons. Checked against the master rendered side by side: at
    display scale the two are indistinguishable.
  * The section's script needs one node per icon to move, so the 135 direct
    children of the master's clip group are preserved as
    <g class="kcc-scatter__item">, each tagged with data-cx/cy/r - the centre
    and collision radius of its own ink, so the page doesn't have to call
    getBBox() 135 times on load.

Output is emitted in a 2560x1440 space (4x the master's viewBox) so 1-decimal
rounding stays well under a tenth of a source unit.
"""
import re, math, sys, gzip, xml.etree.ElementTree as ET

SRC = "KCC All.svg"
NS = "{http://www.w3.org/2000/svg}"
TOL = float(sys.argv[1]) if len(sys.argv) > 1 else 0.22  # the shipped setting
OUT = sys.argv[2] if len(sys.argv) > 2 else "assets/ingredient-scatter.svg"
SCALE = 4.0  # emit in a 2560x1440 space so 1dp rounding is ~0.025 source units

def mat_mul(a, b):
    a0,a1,a2,a3,a4,a5 = a; b0,b1,b2,b3,b4,b5 = b
    return (a0*b0+a2*b1, a1*b0+a3*b1, a0*b2+a2*b3, a1*b2+a3*b3,
            a0*b4+a2*b5+a4, a1*b4+a3*b5+a5)

def parse_transform(s):
    m = (1.0,0,0,1.0,0,0)
    for name, args in re.findall(r"(matrix|translate|scale|rotate)\s*\(([^)]*)\)", s or ""):
        v = [float(x) for x in re.split(r"[,\s]+", args.strip()) if x]
        if name == "matrix": t = tuple(v)
        elif name == "translate": t = (1,0,0,1, v[0], v[1] if len(v)>1 else 0)
        elif name == "scale":
            sx = v[0]; sy = v[1] if len(v)>1 else sx; t = (sx,0,0,sy,0,0)
        else:
            a = math.radians(v[0]); c,s_ = math.cos(a), math.sin(a)
            t = (c,s_,-s_,c,0,0)
            if len(v)==3: t = mat_mul((1,0,0,1,v[1],v[2]), mat_mul(t,(1,0,0,1,-v[1],-v[2])))
        m = mat_mul(m, t)
    return m

def apply(m,x,y): return (m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5])

def tokenize(d):
    out = []
    for cmd, num in re.findall(r"([MLCZmlcz])|([-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)", d):
        out.append(cmd if cmd else float(num))
    return out

def bezier_pts(p0, p1, p2, p3, tol):
    """Adaptive-ish flattening: segment count from the control polygon length."""
    L = (math.dist(p0,p1) + math.dist(p1,p2) + math.dist(p2,p3))
    n = max(2, min(24, int(math.sqrt(L / max(tol, 1e-6)) * 0.9)))
    pts = []
    for i in range(1, n+1):
        t = i/n; u = 1-t
        x = u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0]
        y = u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]
        pts.append((x,y))
    return pts

def rdp(pts, tol):
    if len(pts) < 3: return pts
    keep = [False]*len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts)-1)]
    while stack:
        a, b = stack.pop()
        if b <= a+1: continue
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx-ax, by-ay
        den = math.hypot(dx, dy)
        best, bi = -1.0, -1
        for i in range(a+1, b):
            px, py = pts[i]
            dist = (abs(dy*px - dx*py + bx*ay - by*ax) / den) if den > 1e-12 else math.hypot(px-ax, py-ay)
            if dist > best: best, bi = dist, i
        if best > tol:
            keep[bi] = True
            stack.append((a, bi)); stack.append((bi, b))
    return [p for p, k in zip(pts, keep) if k]

def subpaths(d, m):
    """Absolute M/L/C/Z -> list of point lists in final user space."""
    flat = tokenize(d)
    subs, cur, start, pos = [], [], None, None
    i = 0
    while i < len(flat):
        cmd = flat[i]; i += 1
        if cmd in ("Z","z"):
            if cur: subs.append(cur); cur = []
            pos = start
            continue
        n = {"M":2, "L":2, "C":6}[cmd]
        first = True
        while i < len(flat) and not isinstance(flat[i], str):
            v = flat[i:i+n]; i += n
            p = [apply(m, v[k], v[k+1]) for k in range(0, n, 2)]
            if cmd == "M" and first:
                if cur: subs.append(cur)
                cur = [p[0]]; start = p[0]; pos = p[0]
            elif cmd == "C":
                cur += bezier_pts(pos, p[0], p[1], p[2], TOL); pos = p[2]
            else:
                cur.append(p[0]); pos = p[0]
            first = False
    if cur: subs.append(cur)
    return subs

root = ET.parse(SRC).getroot()

def find_icon_parent(node, m):
    for child in node:
        if child.tag.replace(NS,"") != "g": continue
        cm = mat_mul(m, parse_transform(child.get("transform")))
        if child.get("clip-path"): return child, cm
        f = find_icon_parent(child, cm)
        if f: return f
    return None

holder, base = find_icon_parent(root, (1.0,0,0,1.0,0,0))
icons = [c for c in holder if c.tag.replace(NS,"") == "g"]

def collect(node, m, acc):
    for child in node:
        tag = child.tag.replace(NS,"")
        cm = mat_mul(m, parse_transform(child.get("transform")))
        if tag == "path":
            if "fill:none" in (child.get("style") or ""): continue
            acc.append((child.get("d"), cm))
        elif tag == "g":
            collect(child, cm, acc)

def fmt(v):
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0","") else s

groups, npts, nsub = [], 0, 0
for icon in icons:
    acc = []
    collect(icon, mat_mul(base, parse_transform(icon.get("transform"))), acc)
    xs, ys, ds = [], [], []
    for d, m in acc:
        chunks = []
        for sub in subpaths(d, m):
            sub = [(x*SCALE, y*SCALE) for x, y in sub]
            # Tolerance scaled to each shape's own size. A flat tolerance is
            # set by the big cinnamon-stick outlines and turns the 3-unit
            # fennel seeds into visible octagons; this keeps small ink crisp
            # and spends the savings on the long smooth contours instead.
            sxs = [p[0] for p in sub]; sys_ = [p[1] for p in sub]
            diag = math.hypot(max(sxs)-min(sxs), max(sys_)-min(sys_))
            sub = rdp(sub, max(TOL*SCALE, min(0.5*SCALE, diag*0.02)))
            if len(sub) < 3: continue
            nsub += 1; npts += len(sub)
            for x, y in sub: xs.append(x); ys.append(y)
            # relative polyline: short deltas compress far better than absolutes
            out = [f"M{fmt(sub[0][0])} {fmt(sub[0][1])}"]
            px, py = sub[0]
            prev = None
            for x, y in sub[1:]:
                dx, dy = x-px, y-py
                out.append(("l" if prev != "l" else " ") + f"{fmt(dx)} {fmt(dy)}")
                px, py = px+round(dx,1), py+round(dy,1)
                prev = "l"
            chunks.append("".join(out) + "z")
        if chunks: ds.append("".join(chunks))
    if not ds: continue
    x0,x1,y0,y1 = min(xs),max(xs),min(ys),max(ys)
    groups.append(((x0+x1)/2, (y0+y1)/2, 0.42*math.hypot(x1-x0, y1-y0), ds))

parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2560 1440" '
         'preserveAspectRatio="xMidYMid slice" fill="#754B2A" '
         'style="fill-rule:evenodd;clip-rule:evenodd">']
for cx, cy, r, ds in groups:
    parts.append(f'<g class="kcc-scatter__item" data-cx="{cx:.0f}" data-cy="{cy:.0f}" data-r="{r:.0f}">'
                 + "".join(f'<path d="{d}"/>' for d in ds) + "</g>")
parts.append("</svg>")
svg = "".join(parts)
print(f"tol={TOL}  groups={len(groups)}  subpaths={nsub}  points={npts}  "
      f"raw={len(svg)/1024:.0f}KB  gzip={len(gzip.compress(svg.encode()))/1024:.0f}KB")
if OUT: open(OUT, "w").write(svg)
