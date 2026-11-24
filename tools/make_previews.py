#!/usr/bin/env python3
"""Make the short autoplay clips used by the gallery and task cards.

For every assets/videos/<domain>/<CODE>/demo.mp4 this writes preview.mp4 next to it:
the head-camera view only (caption strip cropped off), 10 s in real time starting
30 % into the demonstration, 480x320, 12.5 fps, no audio.

Usage: python3 tools/make_previews.py [--ffmpeg /path/to/ffmpeg] [--force]
"""
import argparse, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument('--ffmpeg', default='ffmpeg')
ap.add_argument('--force', action='store_true')
args = ap.parse_args()
ffprobe = str(Path(args.ffmpeg).with_name('ffprobe')) if '/' in args.ffmpeg else 'ffprobe'

demos = sorted(p for p in (ROOT / 'assets/videos').glob('*/*/demo.mp4'))
for demo in demos:
    out = demo.with_name('preview.mp4')
    if out.exists() and not args.force:
        continue
    dur = float(subprocess.check_output([ffprobe, '-v', 'error', '-show_entries', 'format=duration',
                                         '-of', 'csv=p=0', str(demo)]).decode().strip())
    length = min(10.0, dur)
    start = max(0.0, min(0.30 * dur, dur - length))
    subprocess.run([args.ffmpeg, '-v', 'error', '-y', '-ss', f'{start:.2f}', '-t', f'{length:.2f}', '-i', str(demo),
                    '-vf', 'crop=640:427:0:40,scale=480:320,fps=12.5', '-an', '-c:v', 'libx264', '-preset', 'slow',
                    '-crf', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(out)], check=True)
    print(f'{out.relative_to(ROOT)}  {start:.1f}s+{length:.1f}s  {out.stat().st_size // 1024} KB')
print(len(demos), 'demos')
