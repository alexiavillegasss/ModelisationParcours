with open('styles.css', encoding='utf-8') as f:
    text = f.read()

import re

# Find background colors in b5, b1, thematics
print("=== SECTION BARS ===")
m = re.findall(r'(\.(?:b5|b1)-section-bar[^{]*\{[^}]*\})', text)
for r in m[:5]:
    print(r)

print("\n=== THEMATICS BARS ===")
m2 = re.findall(r'(\.(?:b5|b1)-thematics-group[^{]*\.(?:b5|b1)-section-bar[^{]*\{[^}]*\})', text)
for r in m2:
    print(r)

print("\n=== BG COLUMNS ===")
m3 = re.findall(r'(\.(?:b5|b1)-bg-col[^{]*\{[^}]*\})', text)
for r in m3[:6]:
    print(r)

print("\n=== COL HEADERS ===")
m4 = re.findall(r'(\.(?:ch-|b5-ch-|b1-ch-)[^{]*\{[^}]*\})', text)
for r in m4[:6]:
    print(r)
