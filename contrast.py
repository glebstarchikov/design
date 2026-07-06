#!/usr/bin/env python3
"""Contrast-floor check for the design system (design.md, hard rule 1).

Every text token must reach 4.5:1 on both `bg` and `elevated`.
When creating a client theme, replace the palettes below with the
theme's values and run: python3 contrast.py
Exits non-zero on any failure.
"""

import sys

LIGHT = {
    "bg": "#fcfcfb",
    "elevated": "#ffffff",
    "fg": "#17161a",
    "secondary": "#605f6a",
    "faint": "#6f6e79",
    "accent": "#4b46f5",
    "success": "#1a7a4d",
    "warning": "#96660a",
    "danger": "#c02f2f",
}

DARK = {
    "bg": "#131215",
    "elevated": "#1c1b1f",
    "fg": "#ececea",
    "secondary": "#a7a6b0",
    "faint": "#908f99",
    "accent": "#8a86ff",
    "success": "#53b483",
    "warning": "#d4a72c",
    "danger": "#ef7066",
}

TEXT_TOKENS = ["fg", "secondary", "faint", "accent", "success", "warning", "danger"]
FLOOR = 4.5


def luminance(hex_color: str) -> float:
    hex_color = hex_color.lstrip("#")
    channels = [int(hex_color[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def ratio(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def check(name: str, palette: dict) -> bool:
    ok = True
    for token in TEXT_TOKENS:
        for surface in ("bg", "elevated"):
            r = ratio(palette[token], palette[surface])
            passed = r >= FLOOR
            ok &= passed
            status = "PASS" if passed else "FAIL"
            print(f"{status}  {name} {token:9s} on {surface:8s} {r:5.2f}:1")
    return ok


if __name__ == "__main__":
    all_ok = check("light", LIGHT) & check("dark", DARK)
    sys.exit(0 if all_ok else 1)
