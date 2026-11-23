with open("styles.css", "r", encoding="utf-8") as f:
    css = f.read()

import re

# find any rules with block-b3 or b5-container or b5-matrix-layout
for sel in ['b5-matrix-layout', 'parcours-col-left', 'block-b3']:
    matches = re.finditer(rf'([^{{}}]*?\.{sel}\b[^{{}}]*?\{{([^}}]*)\}})', css)
    for m in matches:
        b = m.group(2)
        if 'width' in b:
            print(f"{m.group(1).split('{')[0].strip()} -> {b.strip()}")
            print("-" * 30)
