#!/usr/bin/env python3
"""Add a brief HTML file to the website and rebuild the indexes (Python port of tools/add-brief.ps1).

Usage:  python3 tools/add_brief.py <source.html> <YYYY-MM-DD> <morning|afternoon|weekend>
The source may already be briefs/<date>-<slot>.html (it is then updated in place).
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAG = '<script src="../assets/brief-bar.js?v=2" defer></script>'


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    src, date, slot = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        sys.exit("date must be YYYY-MM-DD")
    if slot not in ("morning", "afternoon", "weekend"):
        sys.exit("slot must be morning, afternoon or weekend")
    doc = src.read_text(encoding="utf-8")
    if "assets/brief-bar.js" not in doc:
        doc = doc.replace("</body>", TAG + "\n</body>", 1) if "</body>" in doc else doc + "\n" + TAG + "\n"
    dest = ROOT / "briefs" / f"{date}-{slot}.html"
    dest.write_text(doc, encoding="utf-8", newline="\n")
    print(f"Added {dest.relative_to(ROOT)}")
    sys.exit(subprocess.call([sys.executable, str(ROOT / "tools" / "build_index.py")]))


if __name__ == "__main__":
    main()
