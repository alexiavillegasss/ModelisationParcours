with open('styles.css', encoding='utf-8') as f:
    text = f.read()

import re
print("--- b5-bg-col rules ---")
matches = re.findall(r'(\.b5-bg-col[^{]*\{[^}]*\})', text)
for m in matches:
    print(m)

print("\n--- b1-bg-col rules ---")
matches1 = re.findall(r'(\.b1-bg-col[^{]*\{[^}]*\})', text)
for m in matches1:
    print(m)

print("\n--- ch- pills rules ---")
matches_ch = re.findall(r'(\.(?:ch-|b5-ch-|b1-ch-)[^{]*\{[^}]*\})', text)
for m in matches_ch:
    print(m)
