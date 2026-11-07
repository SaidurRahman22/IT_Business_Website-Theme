# `/public/clips` — motion clip production spec

Everything in this folder is consumed by `components/motion/MotionClip.tsx` and
`components/motion/ClipCarousel.tsx`. Nothing here is decorative: every clip has
a written description that ships as its `aria-label`, and a clip without one
does not get built.

**This folder is currently empty.** Pages are assembled against
`components/motion/ClipPlaceholder.tsx`, which renders a hatched slate naming
the missing file. Drop the real files in with the names below and the slate is
replaced automatically — no code change.

---

## 0. The one thing to get right first

**These clips play forward, normally, on enter. They are NOT scroll-scrubbed.**

Scroll-scrubbing — mapping scroll position to `video.currentTime` — looks
remarkable and costs more than it is worth. Seeking to an arbitrary frame
requires a keyframe at or before that frame, so a scrubbable clip has to be
encoded with a keyframe roughly every 10 frames (`-g 10`). That defeats
inter-frame compression almost entirely and takes a 10-second 1080p clip from
about **400–900 KB to 3–8 MB** — on a marketing page, per clip, often above the
fold.

Play-on-enter gets about **90% of the perceived effect for about 10% of the
weight**, and it degrades properly: a slow connection sees the poster, a
reduced-motion visitor sees the poster, a visitor with JavaScript off sees the
poster, and every one of them reads the same caption. Nothing in this repository
scrubs a clip. If a future brief asks for scrubbing, the answer is an SVG
stroke-dash sequence or a sprite sheet, not a 6 MB video.

Normal GOP encoding (`-g 240`, i.e. one keyframe every ~10 s at 24 fps) is
therefore correct here and is what the commands below use.

---

## 1. Creative constraints

| | |
|---|---|
| Runtime | **6–12 s.** Under 6 s reads as a glitch; over 12 s nobody waits. |
| Loop | Only for **ambient** clips. Explanatory clips must end so the control can reach its `Replay` state. |
| Audio | **None.** Every clip is muted and stripped (`-an`). Never rely on sound. |
| Motion | Must survive being watched with the first second missed. No hard cut in the first 500 ms. |
| First frame | Must stand on its own — it is the poster, and for many visitors it is the whole clip. |
| Weight | **≤ 1.5 MB** per encoded file. Treat 900 KB as the target and 1.5 MB as the hard ceiling. |

### Two crops, art-directed separately

| Variant | Resolution | Used for |
|---|---|---|
| Desktop | **1920 × 1080** (16:9) | `≥ 768px` |
| Portrait | **1080 × 1350** (4:5) | `< 768px` |

The portrait variant is a **re-crop decision, not a centre-crop**. A centre crop
of a 16:9 frame throws away the composition and usually the subject. Recompose
the portrait frame in the edit: reposition the subject, re-scale type, and
re-time if the reading order changes. Export it as its own master.

Name the portrait variant `<name>-portrait.*` and pass it explicitly:

```tsx
<MotionClip
  name="threat-model-session"
  webm="/clips/threat-model-session-portrait.webm"
  mp4="/clips/threat-model-session-portrait.mp4"
  poster="/clips/threat-model-session-portrait-poster.webp"
  aspect="4 / 5"
  description="A threat model being drawn on a whiteboard: boxes for the services appear first, then the trust boundaries are drawn between them in red."
/>
```

---

## 2. Required files per clip

For a clip named `<name>`:

```
/public/clips/<name>.webm                    VP9,  ≤ 1.5 MB
/public/clips/<name>.mp4                     H.264 High, yuv420p, ≤ 1.5 MB
/public/clips/<name>-poster.webp             frame 0, ≤ 60 KB
/public/clips/<name>-portrait.webm
/public/clips/<name>-portrait.mp4
/public/clips/<name>-portrait-poster.webp
```

`MotionClip` resolves `/clips/<name>.webm`, `/clips/<name>.mp4` and
`/clips/<name>-poster.webp` from `name` alone. Anything else is passed
explicitly.

WebM is listed first in `<source>` order, so any browser that can decode VP9
takes it; the MP4 is the Safari-and-older path. Both must exist.

---

## 3. The commands

Run these against a visually lossless master (ProRes 422, or a CRF 14 H.264).
Re-encoding a delivery file is how banding gets in.

### 3.1 WebM / VP9 — two-pass

Two-pass is worth the extra minute: at these bitrates single-pass VP9 wastes
8–12% on the first second.

```bash
# Pass 1
ffmpeg -i master.mov \
  -c:v libvpx-vp9 -b:v 0 -crf 33 -g 240 \
  -row-mt 1 -tile-columns 2 -threads 8 \
  -pix_fmt yuv420p -vf "scale=1920:1080:flags=lanczos" \
  -an -pass 1 -f null /dev/null

# Pass 2
ffmpeg -i master.mov \
  -c:v libvpx-vp9 -b:v 0 -crf 33 -g 240 \
  -row-mt 1 -tile-columns 2 -threads 8 \
  -pix_fmt yuv420p -vf "scale=1920:1080:flags=lanczos" \
  -an -pass 2 \
  "<name>.webm"
```

On Windows replace `/dev/null` with `NUL`. Delete the `ffmpeg2pass-*.log` files
afterwards; they are not assets.

CRF guide: **33** is the house default. Go to 36 for soft, low-detail footage;
never go below 30 — if 30 is not enough the shot is too busy for a 1.5 MB
budget and needs re-framing, not more bitrate.

### 3.2 MP4 / H.264 High — single pass, faststart

```bash
ffmpeg -i master.mov \
  -c:v libx264 -profile:v high -level 4.0 -preset slow -crf 23 \
  -g 240 -pix_fmt yuv420p -vf "scale=1920:1080:flags=lanczos" \
  -an -movflags +faststart \
  "<name>.mp4"
```

- `-pix_fmt yuv420p` is **not optional**. Anything else (notably yuv444p or
  yuvj420p out of a screen recorder) will not decode in Safari and produces a
  black frame with no error.
- `-movflags +faststart` moves the `moov` atom to the front so playback can
  begin before the file is complete. Without it a clip on a slow connection
  waits for the whole download. It is an MP4-container flag and has no WebM
  equivalent — VP9/WebM is already streamable.
- `-an` strips audio. A silent audio track still costs bytes and still trips
  autoplay policy in some engines.

### 3.3 Portrait re-crop

Same commands, different scale, against the **portrait master** — not against
the landscape one.

```bash
-vf "scale=1080:1350:flags=lanczos"
```

If you must derive portrait from a landscape master as a stopgap, be explicit
that it is a crop and not a composition:

```bash
-vf "crop=ih*0.8:ih:(iw-ih*0.8)/2:0,scale=1080:1350:flags=lanczos"
```

Mark any clip produced this way as provisional. It will look like a crop.

### 3.4 Poster — frame 0, WebP, ≤ 60 KB

The poster must be **frame 0 of the encoded clip**, not a nearby frame from the
master. If it is not the same frame, the hand-over from poster to video shows as
a jump at the exact moment attention is on it.

```bash
ffmpeg -i "<name>.mp4" \
  -vf "select=eq(n\,0)" -frames:v 1 \
  -c:v libwebp -quality 82 -compression_level 6 -preset picture \
  "<name>-poster.webp"
```

Check the size and tighten quality if needed:

```bash
ls -l "<name>-poster.webp"      # must be ≤ 61440 bytes
```

Drop `-quality` in steps of 6 until it fits. Below 64 the flat areas in our
dark palette start to band; at that point crop tighter or pick a less detailed
opening frame rather than pushing quality down further.

### 3.5 Verify before committing

```bash
# Codec, pixel format, duration, and that there is genuinely no audio
ffprobe -v error -show_entries stream=codec_name,pix_fmt,width,height \
        -show_entries format=duration,size -of default=noprint_wrappers=1 "<name>.mp4"

# faststart actually applied: moov must appear before mdat
ffprobe -v trace -i "<name>.mp4" 2>&1 | grep -m2 -E "type:'(moov|mdat)'"
```

Reject the file if: duration is outside 6–12 s, `pix_fmt` is not `yuv420p`, an
audio stream exists, `mdat` precedes `moov`, or either encode exceeds 1.5 MB.

---

## 4. Writing the description

`description` is a required prop on `MotionClip` and the props type rejects an
empty string at compile time. It becomes the video's `aria-label` and the stem
of all three control labels (`Play …`, `Pause …`, `Replay …`), so it has to read
correctly after each of those verbs.

Write **one complete sentence describing what a sighted viewer sees** — not what
it means, not what it is called.

- Good: *"A pull request diff scrolls past with three lines highlighted, and a
  security review comment opens against the authorisation check."*
- Bad: *"Secure code review"* — that is a title, not a description.
- Bad: *"An animation showing our process"* — describes the medium, not the
  content.

Keep it under about 180 characters. It is read aloud in full.

---

## 5. Clip register

Fill this in as clips are commissioned. Until a row has files, the page renders
`ClipPlaceholder` for it.

| `name` | Runtime | Crops | Loop | Status | Shows |
|---|---|---|---|---|---|
| _none produced yet_ | — | — | — | — | — |
