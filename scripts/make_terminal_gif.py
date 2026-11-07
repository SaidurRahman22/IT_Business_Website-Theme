"""Build a looping 'system upgrade in progress' console GIF.

Flat UI colours on purpose: a handful of solid tones quantise to a tiny
palette, so this lands at a fraction of the size of a photographic loop
while reading instantly as software work.

Usage: python -I make_terminal_gif.py <out.gif> [width]
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
W = int(sys.argv[2]) if len(sys.argv) > 2 else 640
H = int(round(W * 9 / 16))

BG      = (11, 17, 32)
CHROME  = (18, 27, 46)
BORDER  = (31, 43, 68)
TXT     = (203, 213, 225)
DIM     = (100, 116, 139)
AMBER   = (245, 158, 11)
GREEN   = (34, 197, 94)
CYAN    = (56, 189, 248)
WHITE   = (248, 250, 252)

S = W / 640.0          # scale everything from a 640px design

def mono(px, bold=False):
    names = ["consolab.ttf", "CascadiaMono-Bold.ttf"] if bold else \
            ["consola.ttf", "CascadiaMono.ttf", "cour.ttf"]
    for n in names:
        try:
            return ImageFont.truetype("C:/Windows/Fonts/" + n, int(px))
        except Exception:
            continue
    return ImageFont.load_default()

F   = mono(15 * S)
FB  = mono(15 * S, bold=True)
FS  = mono(11 * S)

# (indent, text, colour, bold) — "@@" marks where the progress bar is drawn.
# The "ok" column is held at character 31 so it aligns in a monospace face.
SCRIPT = [
    (0, "$ envenox-ops maintenance --begin", WHITE, True),
    (0, "", TXT, False),
    (1, "drain traffic                  ok", TXT, False),
    (1, "snapshot databases             ok", TXT, False),
    (1, "install dependencies           ok", TXT, False),
    (1, "migrate schema  v4.2 -> v5.0   ok", TXT, False),
    (1, "run test suite   412 passed    ok", TXT, False),
    (1, "rebuild services", TXT, False),
    (0, "@@", TXT, False),
    (0, "", TXT, False),
    (0, "  deploying  ...  please wait", AMBER, True),
]

PAD = int(26 * S)
TOP = int(46 * S)
LH  = int(26 * S)


def base_frame():
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    # window chrome
    d.rectangle([0, 0, W, TOP - int(12 * S)], fill=CHROME)
    d.line([0, TOP - int(12 * S), W, TOP - int(12 * S)], fill=BORDER, width=1)
    cy = (TOP - int(12 * S)) // 2
    for i, c in enumerate([(239, 68, 68), (245, 158, 11), (34, 197, 94)]):
        cx = int(20 * S) + i * int(17 * S)
        r = int(5 * S)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)
    t = "envenox — system upgrade"
    bb = d.textbbox((0, 0), t, font=FS)
    d.text(((W - (bb[2] - bb[0])) / 2, cy - (bb[3] - bb[1]) / 2 - int(1 * S)),
           t, font=FS, fill=DIM)
    return im, d


def draw_bar(d, x, y, pct):
    bw, bh = int(290 * S), int(9 * S)
    d.rectangle([x, y, x + bw, y + bh], fill=(24, 34, 56))
    fill_w = int(bw * pct)
    if fill_w > 0:
        d.rectangle([x, y, x + fill_w, y + bh], fill=AMBER)
    d.text((x + bw + int(14 * S), y - int(4 * S)),
           f"{int(pct * 100):3d}%", font=FS, fill=AMBER if pct < 1 else GREEN)


# total characters to type
total_chars = sum(len(t) for _, t, _, _ in SCRIPT if t != "@@")

frames, durations = [], []
CPF = 3                                   # characters revealed per frame
steps = total_chars // CPF + 1

for s in range(steps + 14):               # +14 = hold frames at the end
    typed = min(total_chars, s * CPF)
    im, d = base_frame()
    y = TOP
    used = 0
    done_typing = typed >= total_chars

    for indent, text, col, bold in SCRIPT:
        if text == "@@":
            # bar tracks how far the typing has got
            pct = min(1.0, max(0.0, (typed - used * 0.0) / max(total_chars, 1)))
            if done_typing:
                pct = min(1.0, (s - steps) / 8.0 + 0.55) if s >= steps else 1.0
                pct = max(pct, 0.55)
            draw_bar(d, PAD + int(18 * S), y + int(5 * S), pct)
            y += LH
            continue

        show = text
        if used + len(text) > typed:
            show = text[: max(0, typed - used)]
        used += len(text)

        if show:
            x = PAD + indent * int(18 * S)
            if indent and show.strip():
                d.text((x - int(14 * S), y), ">", font=F, fill=CYAN)
            # trailing "ok" renders green
            if show.endswith("ok") and indent:
                head = show[:-2]
                d.text((x, y), head, font=FB if bold else F, fill=col)
                hb = d.textbbox((0, 0), head, font=FB if bold else F)
                d.text((x + (hb[2] - hb[0]), y), "ok", font=FB, fill=GREEN)
            else:
                d.text((x, y), show, font=FB if bold else F, fill=col)
        y += LH
        if used >= typed and not done_typing:
            # cursor sits at the end of the partially typed line
            if show is not None:
                x2 = PAD + indent * int(18 * S)
                bb = d.textbbox((0, 0), show, font=FB if bold else F)
                if s % 2 == 0:
                    d.rectangle([x2 + (bb[2] - bb[0]) + int(2 * S), y - LH + int(2 * S),
                                 x2 + (bb[2] - bb[0]) + int(10 * S), y - int(6 * S)],
                                fill=AMBER)
            break

    frames.append(im)
    durations.append(420 if s >= steps + 10 else 70)

q = [f.quantize(colors=64, method=Image.MEDIANCUT, dither=Image.NONE) for f in frames]
q[0].save(OUT, save_all=True, append_images=q[1:], duration=durations,
          loop=0, optimize=True, disposal=2)

from PIL import ImageSequence
dec = len(list(ImageSequence.Iterator(Image.open(OUT))))
print(f"wrote {OUT}")
print(f"  size    : {W}x{H}")
print(f"  frames  : {len(q)} written / {dec} decoded")
print(f"  bytes   : {os.path.getsize(OUT):,}")
print(f"  seconds : {sum(durations)/1000:.1f}")
