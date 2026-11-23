with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("File size:", len(html))
print("Has transversal-prevention?", 'id="transversal-prevention"' in html)
print("Has transversal-reperage?", 'id="transversal-reperage"' in html)
print("Has block-besoin-3?", 'id="block-besoin-3"' in html)
print("Has block-besoin-1?", 'id="block-besoin-1"' in html)
print("Has block-besoin-2?", 'id="block-besoin-2"' in html)
print("Has block-besoin-4?", 'id="block-besoin-4"' in html)
print("Has old b3-col-prev inside block-besoin-3?", '<div class="b3-col-prev">' in html[html.find('id="block-besoin-3"'):html.find('id="block-besoin-1"')])

# Count divs
open_divs = html.count('<div')
close_divs = html.count('</div>')
print(f"Open divs: {open_divs}, Close divs: {close_divs}")
