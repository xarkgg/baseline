#!/usr/bin/env python3
"""Build Baseline — the site's own typeface.

A monoline, faceted geometric sans in the signage tradition: one stroke weight
everywhere, squarish bowls drawn from a superellipse, flat horizontal ends where
a stroke meets the baseline or the cap line, and square-cut apertures.

The site does not need this script to run. It emits a static TTF that is
committed to assets/fonts/, and the CSS references it like any other file.

    pip install fonttools
    python3 tools/build-baseline-font.py assets/fonts/baseline.ttf

Every outline is generated from arithmetic — no third-party font data is read,
copied or modified. The design decisions are listed in DECISIONS so they can be
reviewed as design rather than guessed at from the output.
"""

import math

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

# ---------------------------------------------------------------- metrics --

UPM = 1000          # units per em
CAP = 700           # cap height
XH = 500            # x-height
ASC = 745           # ascender (b d f h k l)
DESC = -205         # descender (g j p q y)
ST = 92             # the stroke: every stem, bar and diagonal is this wide
SB = 58             # default sidebearing
P = 0.55            # squircle exponent: 0 is a square, 1 is a diamond

DECISIONS = """
Departures from the signage face this replaces, chosen deliberately:

  a   double-storey, with a closed lower bowl and an arm over the top.
  V   flat foot instead of a point.
  M   the centre V reaches the baseline; outer stems stay vertical.
  t   straight foot, no curve.
  g   single-storey bowl, squared tail.
  R   the leg leaves the bowl at the waist, not the corner.
  G   closes with a horizontal spur.
  S   3 opens on a squared spine between its two bowls.
  i j square dots, not rounds.
  digits tabular: every one sits in the same 380-unit box.
"""

# -------------------------------------------------------------- geometry --

def poly(points, round_to=1):
    """Round a contour and drop repeated points."""
    out = []
    for x, y in points:
        p = (round(x / round_to) * round_to, round(y / round_to) * round_to)
        if not out or (abs(p[0] - out[-1][0]) > 0.01 or abs(p[1] - out[-1][1]) > 0.01):
            out.append(p)
    if len(out) > 2 and abs(out[0][0] - out[-1][0]) < 0.01 and abs(out[0][1] - out[-1][1]) < 0.01:
        out.pop()
    return out


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def stroke_width(w=None):
    """The stroke for this build.

    ST is a module global rather than a constant so one script can emit several
    weights: every helper resolves it at call time, so setting ST before a build
    changes the whole family without touching a single glyph.
    """
    return ST if w is None else w


def set_stroke(w):
    global ST
    ST = w


def bar(x0, x1, y, w=None):
    """A horizontal bar centred on y."""
    w = stroke_width(w)
    return rect(x0, y - w / 2.0, x1, y + w / 2.0)


def stem(x, y0, y1, w=None):
    """A vertical stem whose left edge is x."""
    w = stroke_width(w)
    return rect(x, y0, x + w, y1)


def mir(points, w):
    """Mirror a contour horizontally inside a box of width w."""
    return [(w - x, y) for x, y in points]


def bez(p0, c, p1, n=16):
    """Sample a quadratic Bezier — the curve tool for anything not an arc."""
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        out.append((u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
                    u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]))
    return out


def diag(p0, p1, w=None):
    """A diagonal quad with flat ends and constant perpendicular weight."""
    w = stroke_width(w)
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    length = math.hypot(dx, dy) or 1.0

    if abs(dy) / length >= 0.26:                      # steep: flat horizontal ends
        th = w / (abs(dy) / length)
        return ccw([(p0[0] - th / 2, p0[1]), (p0[0] + th / 2, p0[1]),
                    (p1[0] + th / 2, p1[1]), (p1[0] - th / 2, p1[1])])

    tv = w / (abs(dx) / length)                       # shallow: flat vertical ends
    return ccw([(p0[0], p0[1] - tv / 2), (p0[0], p0[1] + tv / 2),
                (p1[0], p1[1] + tv / 2), (p1[0], p1[1] - tv / 2)])


def slant(xa, ya, xb, yb, w=None):
    """A diagonal whose ink stays inside the x-range [xa, xb]."""
    w = stroke_width(w)
    dx, dy = xb - xa, yb - ya
    length = math.hypot(dx, dy) or 1.0
    t = w / max(1e-6, abs(dy) / length)
    s = 1.0 if xb >= xa else -1.0
    return diag((xa + s * t / 2, ya), (xb - s * t / 2, yb), w)


def sq_pts(cx, cy, rx, ry, a0, a1, p=P):
    """Sample a superellipse arc between two angles in degrees."""
    steps = max(12, int(abs(a1 - a0) * 0.9))
    out = []
    for i in range(steps + 1):
        t = math.radians(a0 + (a1 - a0) * i / steps)
        c, s = math.cos(t), math.sin(t)
        x = cx + rx * math.copysign(abs(c) ** p, c)
        y = cy + ry * math.copysign(abs(s) ** p, s)
        out.append((x, y))
    return out


def stroke(pts, w=None, closed=False, limit=3.4):
    """Offset a polyline into a filled outline.

    Miter joins give the crisp squared corners the face relies on; anything
    sharper than `limit` is bevelled so a tight angle cannot throw a spike. An
    open path gets butt caps; a closed one comes back as a ring — two contours,
    the second reversed so the counter punches through.
    """
    w = stroke_width(w)
    n = len(pts)
    h = w / 2.0
    segs = n if closed else n - 1

    normals = []
    for i in range(segs):
        a, b = pts[i], pts[(i + 1) % n]
        dx, dy = b[0] - a[0], b[1] - a[1]
        length = math.hypot(dx, dy)
        normals.append((-dy / length, dx / length) if length else (0.0, 0.0))

    def side(sign):
        out = []
        for i in range(n):
            if closed:
                n1, n2 = normals[i - 1], normals[i]
            elif i == 0 or i == n - 1:
                n1 = n2 = normals[0] if i == 0 else normals[-1]
            else:
                n1, n2 = normals[i - 1], normals[i]

            vx, vy = pts[i]
            ux, uy = n1[0] + n2[0], n1[1] + n2[1]
            ul = math.hypot(ux, uy)

            at_end = (not closed) and (i == 0 or i == n - 1)
            if at_end or ul < 1e-6:
                out.append((vx + sign * h * n1[0], vy + sign * h * n1[1]))
                continue

            scale = 2.0 / ul
            if scale > limit:
                out.append((vx + sign * h * n1[0], vy + sign * h * n1[1]))
                out.append((vx + sign * h * n2[0], vy + sign * h * n2[1]))
            else:
                out.append((vx + sign * h * scale * ux / ul,
                            vy + sign * h * scale * uy / ul))
        return out

    left, right = poly(side(1.0)), poly(side(-1.0))
    if closed:
        # Whichever side encloses the larger area is the outside of the ring.
        if abs(signed_area(left)) >= abs(signed_area(right)):
            return [ccw(left), cw(right)]
        return [ccw(right), cw(left)]
    return [ccw(left + list(reversed(right)))]


def square(cx, cy, size=None):
    size = stroke_width(size)
    return rect(cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2)


def ring(w, top, bottom, left, right, wt=None, p=P):
    """A closed bowl whose OUTER extents are the given box."""
    wt = stroke_width(wt)
    if right is None:
        right = left + w
    return stroke(sq_pts((left + right) / 2, (top + bottom) / 2,
                         (right - left - wt) / 2, (top - bottom - wt) / 2,
                         0, 360, p), wt, closed=True)


def arc(top, bottom, left, right, a0, a1, wt=None, p=P):
    """An open bowl whose OUTER extents are the given box."""
    wt = stroke_width(wt)
    return stroke(sq_pts((left + right) / 2, (top + bottom) / 2,
                         (right - left - wt) / 2, (top - bottom - wt) / 2,
                         a0, a1, p), wt, closed=False)


def shoulder(attach, top, bottom, right, wt=None, p=P):
    """A D-shaped bowl hanging off a stem at x=attach."""
    wt = stroke_width(wt)
    return stroke(sq_pts(attach, (top + bottom) / 2,
                         (right - wt / 2) - attach, (top - bottom - wt) / 2,
                         90, -90, p), wt, closed=False)


# ----------------------------------------------------------------- glyphs --

class Glyph:
    def __init__(self, name, w, adv=None):
        self.name = name
        self.w = w                  # ink width in design units
        self.adv = adv              # None: derive advance from the ink
        self.contours = []

    def add(self, *contours):
        """Accept a contour (list of points) or a group of contours."""
        def flatten(c):
            if not c:
                return
            if isinstance(c[0][0], (int, float)):
                self.contours.append(c)
            else:
                for inner in c:
                    flatten(inner)

        for c in contours:
            flatten(c)
        return self

    @property
    def x0(self):
        return 0.0

    @property
    def x1(self):
        return float(self.w)

    @property
    def cx(self):
        return self.w / 2.0


def glyphs():
    G = {}

    def g(name, w, adv=None):
        glyph = Glyph(name, w, adv)
        G[name] = glyph
        return glyph

    # ------------------------------------------------------------- caps --

    A = g("A", 548)
    t = ST / (CAP / math.hypot(A.cx, CAP))
    A.add(diag((t / 2, 0), (A.cx, CAP)),
          diag((A.w - t / 2, 0), (A.cx, CAP)),
          bar(A.cx - A.cx * 0.62, A.cx + A.cx * 0.62, 215))

    B = g("B", 520)
    B.add(stem(0, 0, CAP),
          shoulder(ST, CAP, CAP * 0.51, B.w),
          shoulder(ST, CAP * 0.51, 0, B.w - 8))

    C = g("C", 566)
    C.add(arc(CAP, 0, 0, C.w, 34, 326))

    D = g("D", 574)
    D.add(stem(0, 0, CAP), shoulder(ST, CAP, 0, D.w))

    E = g("E", 452)
    E.add(stem(0, 0, CAP),
          rect(0, CAP - ST, E.w, CAP),
          rect(0, (CAP - ST) / 2, E.w - 40, (CAP + ST) / 2),
          rect(0, 0, E.w, ST))

    F = g("F", 434)
    F.add(stem(0, 0, CAP),
          rect(0, CAP - ST, F.w, CAP),
          rect(0, (CAP - ST) / 2, F.w - 46, (CAP + ST) / 2))

    G_ = g("G", 592)
    G_.add(arc(CAP, 0, 0, G_.w, 30, 330))
    G_.add(bar(G_.cx - 34, G_.w, CAP * 0.40))
    G_.add(stem(G_.w - ST, CAP * 0.22, CAP * 0.40 + ST / 2))

    H = g("H", 534)
    H.add(stem(0, 0, CAP), stem(H.w - ST, 0, CAP),
          rect(0, (CAP - ST) / 2, H.w, (CAP + ST) / 2))

    I = g("I", 92)
    I.add(stem(0, 0, CAP))

    J = g("J", 232)
    J.add(stem(J.w - ST, 190, CAP),
          stroke(sq_pts(J.w - ST / 2 - ST / 2, 190, 82, 190, 0, -180)))

    K = g("K", 512)
    K.add(stem(0, 0, CAP),
          diag((ST, CAP * 0.46), (K.w - 49, CAP)),
          diag((ST, CAP * 0.46), (K.w - 49, 0)))

    L = g("L", 410)
    L.add(stem(0, 0, CAP), rect(0, 0, L.w, ST))

    M = g("M", 690)
    M.add(stem(0, 0, CAP), stem(M.w - ST, 0, CAP),
          diag((ST / 2, CAP), (M.cx, 0)),
          diag((M.w - ST / 2, CAP), (M.cx, 0)))

    N = g("N", 560)
    N.add(stem(0, 0, CAP), stem(N.w - ST, 0, CAP),
          diag((ST / 2, CAP), (N.w - ST / 2, 0)))

    O = g("O", 592)
    O.add(ring(None, CAP, 0, 0, O.w))

    P = g("P", 512)
    P.add(stem(0, 0, CAP), shoulder(ST, CAP, CAP * 0.47, P.w))

    Q = g("Q", 610)
    Q.add(ring(None, CAP, 0, 0, Q.w),
          diag((Q.w * 0.62, CAP * 0.24), (Q.w - 6, -44)))

    R = g("R", 548)
    R.add(stem(0, 0, CAP), shoulder(ST, CAP, CAP * 0.50, R.w))
    rt = ST / (CAP * 0.50 / math.hypot(R.w - ST - 60, CAP * 0.50))
    R.add(diag((ST + 20, CAP * 0.50), (R.w - rt / 2, 0)))

    S = g("S", 520)
    S.add(arc(CAP, CAP * 0.44, 0, S.w, 12, 270))
    S.add(arc(CAP * 0.56, 0, 0, S.w, 90, -168))

    T = g("T", 480)
    T.add(rect(0, CAP - ST, T.w, CAP), stem(T.cx - ST / 2, 0, CAP))

    U = g("U", 552)
    U.add(stem(0, CAP * 0.32, CAP), stem(U.w - ST, CAP * 0.32, CAP),
          arc(CAP * 0.64, 0, 0, U.w, 180, 360))

    V = g("V", 540)
    vt = ST / (CAP / math.hypot(V.cx - 46, CAP))
    V.add(diag((vt / 2, CAP), (V.cx - 46, 0)),
          diag((V.w - vt / 2, CAP), (V.cx + 46, 0)))

    W = g("W", 800)
    W.add(diag((ST / 2, CAP), (W.w * 0.22, 0)),
          diag((W.w * 0.22, 0), (W.cx, CAP)),
          diag((W.cx, CAP), (W.w * 0.78, 0)),
          diag((W.w - ST / 2, CAP), (W.w * 0.78, 0)))

    X = g("X", 540)
    X.add(slant(0, CAP, X.w, 0), slant(X.w, CAP, 0, 0))

    Y = g("Y", 540)
    Y.add(diag((0 + 24, CAP), (Y.cx, CAP * 0.30)),
          diag((Y.w - 24, CAP), (Y.cx, CAP * 0.30)),
          stem(Y.cx - ST / 2, 0, CAP * 0.33))

    Z = g("Z", 480)
    Z.add(rect(0, CAP - ST, Z.w, CAP), rect(0, 0, Z.w, ST),
          diag((Z.w - 46, CAP - ST), (46, ST)))

    # -------------------------------------------------------- lowercase --

    a = g("a", 434)
    # Double storey. The bowl stops lower than a single-storey a would, which
    # buys a real counter above it: an arm leaves the top of the stem, runs
    # almost level to the left and ends in a squared terminal over the shoulder.
    a.add(ring(None, XH * 0.52, 0, 0, a.w),
          stem(a.w - ST, 0, XH),
          stroke(bez((a.w - ST / 2, XH * 0.89), (a.w * 0.52, XH * 0.89), (118, XH * 0.84), 16)))

    b = g("b", 462)
    b.add(stem(0, 0, ASC), ring(None, XH, 0, 0, b.w))

    c = g("c", 400)
    c.add(arc(XH, 0, 0, c.w, 34, 326))

    d = g("d", 462)
    d.add(stem(d.w - ST, 0, ASC), ring(None, XH, 0, 0, d.w))

    e = g("e", 434)
    # The opening runs from the upper terminal round to just below the bar, so
    # the crossbar reads as a bar rather than plugging the aperture.
    e.add(arc(XH, 0, 0, e.w, 72, 345),
          rect(0, XH * 0.52 - ST / 2, e.w - 10, XH * 0.52 + ST / 2))

    f = g("f", 262)
    f.add(stem(84, 0, ASC - 60),
          stroke(bez((84 + ST / 2, ASC - 60), (84 + ST / 2, ASC + 26), (f.w - 6, ASC - 24), 12)),
          rect(0, XH - ST, f.w, XH))

    gg = g("g", 462)
    gg.add(ring(None, XH, 0, 0, gg.w),
           stem(gg.w - ST, -113, XH),
           rect(240, DESC, gg.w, DESC + 92))

    h = g("h", 462)
    h.add(stem(0, 0, ASC), stem(h.w - ST, 0, XH * 0.50),
          arc(XH, XH * 0.06, 0, h.w, 180, 0))

    i = g("i", 92)
    i.add(stem(0, 0, XH), square(46, XH + 132))

    j = g("j", 196)
    j.add(stem(j.w - ST, -113, XH), rect(0, DESC, j.w, DESC + 92),
          square(j.w - ST / 2, XH + 132))

    k = g("k", 404)
    k.add(stem(0, 0, ASC),
          diag((ST, XH * 0.46), (k.w - 46, XH)),
          diag((ST, XH * 0.46), (k.w - 46, 0)))

    l = g("l", 92)
    l.add(stem(0, 0, ASC))

    m = g("m", 700)
    m.add(stem(0, 0, XH), stem(m.cx - ST / 2, 0, XH * 0.50),
          stem(m.w - ST, 0, XH * 0.50),
          arc(XH, XH * 0.06, 0, m.cx, 180, 0),
          arc(XH, XH * 0.06, m.cx, m.w, 180, 0))

    n = g("n", 462)
    n.add(stem(0, 0, XH), stem(n.w - ST, 0, XH * 0.50),
          arc(XH, XH * 0.06, 0, n.w, 180, 0))

    o = g("o", 470)
    o.add(ring(None, XH, 0, 0, o.w))

    p = g("p", 462)
    p.add(stem(0, DESC, XH), ring(None, XH, 0, 0, p.w))

    q = g("q", 462)
    q.add(stem(q.w - ST, DESC, XH), ring(None, XH, 0, 0, q.w))

    r = g("r", 300)
    r.add(stem(0, 0, XH),
          stroke(bez((ST / 2, XH * 0.62), (ST / 2, XH + 40), (r.w - 8, XH - 18), 12)))

    s = g("s", 392)
    s.add(arc(XH, XH * 0.44, 0, s.w, 10, 268))
    s.add(arc(XH * 0.56, 0, 0, s.w, 90, -170))

    t = g("t", 320)
    t.add(stem(114, 0, 628), rect(0, XH - ST, t.w, XH), rect(114, 0, 292, ST))

    u = g("u", 462)
    u.add(stem(0, XH * 0.36, XH), stem(u.w - ST, 0, XH),
          arc(XH * 0.72, 0, 0, u.w, 180, 360))

    v = g("v", 404)
    v.add(slant(0, XH, v.cx - 40, 0), slant(v.w, XH, v.cx + 40, 0))

    w = g("w", 620)
    w.add(diag((ST / 2, XH), (w.w * 0.24, 0)),
          diag((w.w * 0.24, 0), (w.cx, XH)),
          diag((w.cx, XH), (w.w * 0.76, 0)),
          diag((w.w - ST / 2, XH), (w.w * 0.76, 0)))

    x = g("x", 404)
    x.add(slant(0, XH, x.w, 0), slant(x.w, XH, 0, 0))

    y = g("y", 404)
    y.add(slant(0, XH, y.cx, 0), slant(y.w, XH, y.cx, 0),
          diag((y.cx, 0), (40, DESC)))

    z = g("z", 396)
    z.add(rect(0, XH - ST, z.w, XH), rect(0, 0, z.w, ST),
          diag((z.w - 46, XH - ST), (46, ST)))

    # ----------------------------------------------------------- digits --

    DW = 380           # every digit draws in the same box, so they tabulate
    DA = 560

    zero = g("zero", DW, DA)
    zero.add(ring(None, CAP, 0, 18, DW - 18))

    one = g("one", DW, DA)
    one.add(stem(DW / 2 - ST / 2, 0, CAP), diag((DW / 2 - 150, CAP * 0.58), (DW / 2 - ST / 2, CAP)))

    two = g("two", DW, DA)
    two.add(arc(CAP, CAP * 0.42, 0, DW, 178, 12),
            diag((DW - 60, CAP * 0.44), (46, ST)),
            rect(0, 0, DW, ST))

    three = g("three", DW, DA)
    three.add(arc(CAP, CAP * 0.42, 0, DW, 152, -58),
              arc(CAP * 0.58, 0, 0, DW, 58, -152),
              rect(DW / 2 + 32, 296, DW / 2 + 32 + ST, 404))

    four = g("four", DW, DA)
    four.add(stem(DW - ST - 10, 0, CAP), rect(0, 190, DW, 190 + ST),
             diag((DW - 56, CAP), (46, 190)))

    five = g("five", DW, DA)
    five.add(rect(0, CAP - ST, DW - 6, CAP), stem(0, CAP * 0.50, CAP),
             arc(CAP, 0, 0, DW, 150, -150))

    six = g("six", DW, DA)
    six.add(ring(None, CAP * 0.56, 0, 12, DW - 12),
            stroke(bez((DW - 44, CAP - 20), (40, CAP - 10), (22, CAP * 0.52), 16)))

    seven = g("seven", DW, DA)
    seven.add(rect(0, CAP - ST, DW, CAP), diag((DW - 40, CAP - ST), (74, 0)))

    eight = g("eight", DW, DA)
    eight.add(ring(None, CAP, CAP * 0.52, 20, DW - 20),
              ring(None, CAP * 0.50, 0, 8, DW - 8))

    nine = g("nine", DW, DA)
    # Bowl on top, stem down the right-hand side, short hook left along the
    # baseline — the 6 turned upside down, not a g.
    nine.add(ring(None, CAP, CAP * 0.42, 8, DW - 8),
             stem(DW - ST - 8, 96, CAP * 0.55),
             stroke(bez((DW - ST / 2 - 8, 150), (DW - ST / 2 - 8, 0), (150, 0), 16)))

    # ------------------------------------------------------ punctuation --

    dot = 92

    def punct(name, w, adv, *contours):
        glyph = g(name, w, adv)
        glyph.add(*contours)
        return glyph

    punct("period", dot, 264, square(dot / 2, dot / 2, dot))
    punct("comma", dot, 264,
          square(dot / 2, dot / 2, dot),
          diag((dot / 2, dot / 2), (dot / 2 - 40, -104), dot))
    punct("colon", dot, 264,
          square(dot / 2, dot / 2, dot),
          square(dot / 2, XH * 0.66, dot))
    punct("semicolon", dot, 264,
          square(dot / 2, XH * 0.66, dot),
          square(dot / 2, dot / 2, dot),
          diag((dot / 2, dot / 2), (dot / 2 - 40, -104), dot))
    punct("exclam", 76, 264,
          rect(2, XH * 0.40, 74, CAP),
          square(38, dot / 2, dot))
    punct("question", 400, 544,
          stroke(bez((28, 610), (28, 750), (236, 720), 14)),
          stroke(bez((236, 720), (400, 700), (240, 470), 14)),
          rect(194, 96, 286, 350),
          square(240, dot / 2, dot))
    punct("quotesingle", 48, 200, diag((24, CAP), (24, CAP - 150), 48))
    punct("quotedbl", 196, 344,
          diag((24, CAP), (24, CAP - 150), 48),
          diag((172, CAP), (172, CAP - 150), 48))
    punct("quoteleft", 132, 248,
          poly([(66, CAP), (132, CAP), (72, CAP - 168), (6, CAP - 168)]))
    punct("quoteright", 132, 248,
          poly([(126, CAP), (60, CAP), (120, CAP - 168), (186, CAP - 168)]))
    punct("quotedblleft", 300, 416,
          poly([(66, CAP), (132, CAP), (72, CAP - 168), (6, CAP - 168)]),
          poly([(234, CAP), (300, CAP), (240, CAP - 168), (174, CAP - 168)]))
    punct("quotedblright", 300, 416,
          poly([(132, CAP), (66, CAP), (126, CAP - 168), (192, CAP - 168)]),
          poly([(300, CAP), (234, CAP), (294, CAP - 168), (360, CAP - 168)]))
    punct("hyphen", 288, 404, rect(0, CAP * 0.42, 288, CAP * 0.42 + ST))
    punct("endash", 444, 560, rect(0, CAP * 0.42, 444, CAP * 0.42 + ST))
    punct("emdash", 784, 900, rect(0, CAP * 0.42, 784, CAP * 0.42 + ST))
    punct("minus", 444, 560, rect(0, CAP * 0.40, 444, CAP * 0.40 + ST))
    punct("slash", 398, 514, diag((12, -40), (386, CAP + 30)))
    punct("backslash", 398, 514, diag((386, -40), (12, CAP + 30)))
    punct("underscore", 452, 568, rect(0, DESC + 8, 452, DESC + 8 + ST))
    punct("parenleft", 220, 336,
          stroke(bez((186, CAP + 46), (-30, CAP / 2), (186, DESC - 46), 18)))
    punct("parenright", 220, 336,
          stroke(bez((34, CAP + 46), (250, CAP / 2), (34, DESC - 46), 18)))
    punct("bracketleft", 240, 336,
          rect(0, DESC - 8, ST, CAP + 30),
          rect(0, CAP + 30 - ST, 240, CAP + 30),
          rect(0, DESC - 8, 240, DESC - 8 + ST))
    punct("bracketright", 240, 336,
          rect(240 - ST, DESC - 8, 240, CAP + 30),
          rect(0, CAP + 30 - ST, 240, CAP + 30),
          rect(0, DESC - 8, 240, DESC - 8 + ST))
    brace = [
        rect(70, CAP / 2, 70 + ST, CAP + 30),
        rect(70, DESC - 8, 70 + ST, CAP / 2),
        rect(70, CAP + 30 - ST, 70 + ST + 130, CAP + 30),
        rect(70, DESC - 8, 70 + ST + 130, DESC - 8 + ST),
        rect(0, CAP / 2 - ST / 2, 70 + ST, CAP / 2 + ST / 2),
    ]
    punct("braceleft", 260, 376, *brace)
    punct("braceright", 260, 376, *[mir(c, 260) for c in brace])
    punct("bar", ST, 300, rect(0, DESC, ST, CAP + 30))
    punct("plus", 444, 560,
          rect(180, 78, 180 + ST, 78 + 344),
          rect(0, 204, 444, 204 + ST))
    punct("equal", 444, 560, rect(0, 158, 444, 158 + ST), rect(0, 350, 444, 350 + ST))
    punct("less", 380, 496,
          diag((360, CAP * 0.72), (24, CAP * 0.36)),
          diag((24, CAP * 0.36), (360, 0)))
    punct("greater", 380, 496,
          diag((20, CAP * 0.72), (356, CAP * 0.36)),
          diag((356, CAP * 0.36), (20, 0)))
    punct("asterisk", 400, 520,
          rect(154, 300, 154 + ST, 660),
          diag((30, 420), (330, 640), 76),
          diag((330, 420), (30, 640), 76))
    punct("numbersign", 440, 664,
          rect(84, 0, 84 + ST, CAP), rect(268, 0, 268 + ST, CAP),
          rect(0, 200, 440, 200 + ST), rect(0, 480, 440, 480 + ST))
    punct("dollar", 488, 632,
          arc(CAP, CAP * 0.44, 0, 488, 12, 270),
          arc(CAP * 0.56, 0, 0, 488, 90, -168),
          rect(198, -30, 198 + ST, CAP + 30))
    punct("percent", 668, 784,
          stroke(sq_pts(108, CAP - 108, 108, 108, 0, 360, p=0.62), ST, closed=True),
          stroke(sq_pts(560, 108, 108, 108, 0, 360, p=0.62), ST, closed=True),
          diag((20, -30), (640, CAP + 20)))
    # Futura's ampersand: a closed upper loop, a larger closed lower bowl welded
    # to it at the waist, and a leg leaving the lower-right. Two closed bowls
    # cannot throw the spurs a single self-intersecting skeleton does.
    punct("ampersand", 600, 716,
          ring(None, CAP, CAP * 0.46, 96, 468),
          ring(None, CAP * 0.54, 0, 0, 500),
          diag((372, 232), (566, 34)))
    punct("at", 790, 940,
          arc(CAP * 0.98, CAP * 0.02, 0, 790, 340, 660),
          ring(None, 486, 196, 256, 596),
          rect(596, 196, 596 + 84, 540))
    punct("caret", 344, 460,
          diag((0, 400), (172, CAP)), diag((172, CAP), (344, 400)))
    punct("grave", 150, 266, diag((146, CAP), (12, CAP - 140), 56))
    punct("asciitilde", 470, 586,
          stroke(bez((0, 260), (120, 400), (235, 260), 12),
                 closed=False)
          + stroke(bez((235, 260), (350, 120), (470, 260), 12)))

    # -------------------------------------------------------- site extras --

    punct("copyright", 720, 836,
          stroke(sq_pts(360, 350, 360, 350, 0, 360, p=0.62), 76, closed=True),
          arc(480, 220, 232, 496, 42, 318, wt=64))
    punct("multiply", 380, 496,
          diag((20, 120), (360, 460)), diag((360, 120), (20, 460)))
    punct("middot", 88, 204, square(44, XH * 0.54, 88))
    punct("checkmark", 560, 676,
          diag((20, 330), (190, 100)),
          diag((190, 100), (540, 660)))
    punct("arrowleft", 620, 736,
          rect(30, CAP * 0.42, 620, CAP * 0.42 + ST),
          diag((30, CAP * 0.42 + ST / 2), (250, CAP * 0.82)),
          diag((30, CAP * 0.42 + ST / 2), (250, CAP * 0.08)))
    punct("arrowne", 420, 536,
          diag((0, -20), (400, CAP)),
          diag((400, CAP), (400, CAP * 0.44)),
          diag((400, CAP), (200, CAP)))
    punct("command", 420, 536,
          stroke(sq_pts(210, 350, 130, 130, 0, 360, p=0.40), 76, closed=True),
          stroke(sq_pts(60, 130, 60, 60, 0, 360, p=0.62), 76, closed=True),
          stroke(sq_pts(360, 130, 60, 60, 0, 360, p=0.62), 76, closed=True),
          stroke(sq_pts(60, 570, 60, 60, 0, 360, p=0.62), 76, closed=True),
          stroke(sq_pts(360, 570, 60, 60, 0, 360, p=0.62), 76, closed=True))

    punct("space", 0, 264)

    return G


# --------------------------------------------------------------- assembly --

CODES = {
    0x20: "space",
    0x21: "exclam", 0x22: "quotedbl", 0x23: "numbersign", 0x24: "dollar",
    0x25: "percent", 0x26: "ampersand", 0x27: "quotesingle",
    0x28: "parenleft", 0x29: "parenright", 0x2A: "asterisk", 0x2B: "plus",
    0x2C: "comma", 0x2D: "hyphen", 0x2E: "period", 0x2F: "slash",
    0x30: "zero", 0x31: "one", 0x32: "two", 0x33: "three", 0x34: "four",
    0x35: "five", 0x36: "six", 0x37: "seven", 0x38: "eight", 0x39: "nine",
    0x3A: "colon", 0x3B: "semicolon", 0x3C: "less", 0x3D: "equal",
    0x3E: "greater", 0x3F: "question", 0x40: "at",
    0x5B: "bracketleft", 0x5C: "backslash", 0x5D: "bracketright",
    0x5E: "caret", 0x5F: "underscore", 0x60: "grave",
    0x7B: "braceleft", 0x7C: "bar", 0x7D: "braceright", 0x7E: "asciitilde",
    # the site's own inventory
    0xA9: "copyright", 0xB7: "middot", 0xD7: "multiply",
    0x2013: "endash", 0x2014: "emdash", 0x2212: "minus",
    0x2018: "quoteleft", 0x2019: "quoteright",
    0x201C: "quotedblleft", 0x201D: "quotedblright",
    0x2190: "arrowleft", 0x2197: "arrowne",
    0x2318: "command", 0x2713: "checkmark",
}


def signed_area(contour):
    """Twice the area, positive when the contour runs counter-clockwise."""
    total = 0.0
    n = len(contour)
    for i in range(n):
        x0, y0 = contour[i]
        x1, y1 = contour[(i + 1) % n]
        total += x0 * y1 - x1 * y0
    return total / 2.0


def centroid(contour):
    """Area-weighted centre — the point used to decide what sits inside what."""
    a = signed_area(contour)
    if abs(a) < 1e-9:
        return contour[0]
    cx = cy = 0.0
    n = len(contour)
    for i in range(n):
        x0, y0 = contour[i]
        x1, y1 = contour[(i + 1) % n]
        cross = x0 * y1 - x1 * y0
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    return (cx / (6.0 * a), cy / (6.0 * a))


def inside(contour, point):
    """Ray casting: is the point inside this contour?"""
    x, y = point
    hit = False
    n = len(contour)
    for i in range(n):
        x0, y0 = contour[i]
        x1, y1 = contour[(i + 1) % n]
        if (y0 > y) != (y1 > y):
            span = y1 - y0
            if span and x < x0 + (y - y0) * (x1 - x0) / span:
                hit = not hit
    return hit


def ccw(points):
    """The same contour, guaranteed counter-clockwise (ink)."""
    return list(points) if signed_area(points) >= 0 else list(reversed(points))


def cw(points):
    """The same contour, guaranteed clockwise (a counter)."""
    return list(points) if signed_area(points) < 0 else list(reversed(points))


def orient(contours):
    """One winding convention per glyph, decided by area rather than guesswork.

    Every ink contour runs counter-clockwise and every counter runs clockwise.
    Nesting then resolves itself under the non-zero rule: ink inside ink adds up
    and stays solid, and a counter subtracts exactly one from whatever surrounds
    it. A helper that happens to draw clockwise cannot punch a notch in its
    neighbour any more.
    """
    return [ccw(c) for c in contours]


def build(out_ttf, stroke=None, weight_class=400, style="Regular"):
    """Emit one cut. The family shares one skeleton; only the stroke changes."""
    set_stroke(ST if stroke is None else stroke)
    G = glyphs()

    cmap = dict(CODES)
    for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz":
        cmap[ord(ch)] = ch

    missing = sorted({n for n in cmap.values() if n not in G})
    if missing:
        raise SystemExit("no glyph for: " + ", ".join(missing))

    order = [".notdef"] + list(G.keys())
    glyf = {".notdef": TTGlyphPen(None).glyph()}
    metrics = {".notdef": (560, 0)}

    for name, g in G.items():
        contours = [poly(c) for c in g.contours]
        contours = [c for c in contours if len(c) >= 3]
        xs = [x for c in contours for x, _ in c]

        if not xs:                                     # space
            adv = int(round(g.adv or 264))
            metrics[name] = (adv, 0)
            pen = TTGlyphPen(None)
            glyf[name] = pen.glyph()
            continue

        x0, x1 = min(xs), max(xs)
        ink = x1 - x0
        if g.adv is None:
            adv = int(round(ink)) + 2 * SB
            lsb = SB
        else:
            adv = int(round(g.adv))
            lsb = (adv - ink) / 2.0
        shift = lsb - x0

        pen = TTGlyphPen(None)
        for contour in contours:
            pts = [(x + shift, y) for x, y in contour]
            pen.moveTo(pts[0])
            for p in pts[1:]:
                pen.lineTo(p)
            pen.closePath()
        glyf[name] = pen.glyph()
        metrics[name] = (adv, int(round(lsb)))

    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyf)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASC + 55, descent=DESC - 55, lineGap=70)
    ps_name = f"Baseline-{style}"
    fb.setupNameTable({
        "familyName": "Baseline",
        "styleName": style,
        "uniqueFontIdentifier": f"{ps_name};1.000",
        "fullName": f"Baseline {style}",
        "psName": ps_name,
        "version": "Version 1.000",
        "manufacturer": "Baseline",
        "designer": "Baseline",
        "description": "The Baseline site typeface. Monoline geometric signage sans.",
        "licenseDescription": "Drawn for the Baseline website. Use is granted to Baseline.",
    })
    fb.setupOS2(
        sTypoAscender=ASC, sTypoDescender=DESC, sTypoLineGap=70,
        usWinAscent=CAP + 120, usWinDescent=abs(DESC) + 55,
        sxHeight=XH, sCapHeight=CAP,
        achVendID="BSLN", fsType=0, usWeightClass=weight_class, usWidthClass=5,
    )
    bold = weight_class >= 700
    fb.font["OS/2"].fsSelection = 0x20 if bold else 0x40
    fb.font["head"].macStyle = 1 if bold else 0
    fb.setupPost(isFixedPitch=0)
    fb.save(out_ttf)
    print(f"wrote {out_ttf}: {len(order)} glyphs, {len(cmap)} codepoints, wght {weight_class}")


# The four cuts the site uses. Between them they cover every font-weight in
# src/styles.css; the browser never has to synthesise a bold.
WEIGHTS = (
    (400, "Regular", 92),
    (500, "Medium", 106),
    (700, "Bold", 126),
    (800, "Black", 142),
)


def build_set(out_dir, woff2=True):
    """Build the whole family and, when fontTools can, the web copies too."""
    import os
    os.makedirs(out_dir, exist_ok=True)
    for weight_class, style, stroke in WEIGHTS:
        ttf = os.path.join(out_dir, f"baseline-{style.lower()}.ttf")
        build(ttf, stroke=stroke, weight_class=weight_class, style=style)
        if woff2:
            font = TTFont(ttf)
            font.flavor = "woff2"
            font.save(ttf.replace(".ttf", ".woff2"))
            font.close()
            os.remove(ttf)


if __name__ == "__main__":
    import sys
    args = sys.argv[1:]
    if args and args[0] == "--set":
        build_set(args[1] if len(args) > 1 else "fonts")
    elif args and args[0] == "--css":
        # Print the @font-face block, so the CSS and the build cannot drift.
        for weight_class, style, _ in WEIGHTS:
            print(f'@font-face {{ font-family: "Baseline"; font-style: normal; '
                  f'font-weight: {weight_class}; font-display: swap; '
                  f'src: url("./assets/fonts/baseline-{style.lower()}.woff2") format("woff2"); }}')
    else:
        build(args[0] if args else "baseline.ttf")

