with open('styles.css', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'\.(?:b5|b1)-thematics-group\s+\.(?:b5|b1)-section-bar', text)
for m in matches:
    pos = m.start()
    print("--- MATCH AT", pos, "---")
    print(text[pos:pos+500])
