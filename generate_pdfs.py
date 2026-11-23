import json
import os
import re

def escape_pdf_text(text):
    if not text:
        return ""
    # Remplacer caractères spéciaux pour PDF WinAnsi / Latin1
    replacements = {
        'é': r'\351', 'è': r'\350', 'ê': r'\352', 'ë': r'\353',
        'à': r'\340', 'â': r'\342', 'ä': r'\344',
        'î': r'\356', 'ï': r'\357',
        'ô': r'\364', 'ö': r'\366',
        'ù': r'\371', 'û': r'\373', 'ü': r'\374',
        'ç': r'\347',
        'É': r'\311', 'È': r'\310', 'Ê': r'\312',
        'À': r'\300', 'Â': r'\302',
        'Î': r'\316', 'Ô': r'\324',
        'Ç': r'\307',
        'œ': 'oe', '’': "'", '«': '"', '»': '"',
        '°': r'\260', '—': '-', '–': '-',
        '(': r'\(', ')': r'\)', '\\': r'\\'
    }
    # Remplace d'abord les parenthèses et backslashs s'ils ne sont pas déjà traités
    res = ""
    for ch in text:
        if ch in replacements:
            res += replacements[ch]
        elif ord(ch) < 128:
            if ch in ['(', ')', '\\']:
                res += '\\' + ch
            else:
                res += ch
        else:
            # Caractère non ascii hors liste
            res += '?'
    return res

def wrap_text(text, max_len=75):
    words = text.split(' ')
    lines = []
    current_line = []
    current_length = 0
    for word in words:
        if current_length + len(word) + 1 <= max_len:
            current_line.append(word)
            current_length += len(word) + 1
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
            current_length = len(word)
    if current_line:
        lines.append(' '.join(current_line))
    return lines

def create_pdf(filepath, struct, besoin_titre):
    # Palette de couleurs selon besoin
    color_map = {
        "besoin-1": (0.15, 0.39, 0.92),  # Bleu
        "besoin-2": (0.92, 0.35, 0.05),  # Orange/Corail
        "besoin-3": (0.85, 0.55, 0.05),  # Ambre/Jaune
        "besoin-4": (0.28, 0.33, 0.41)   # Ardoise/Gris foncé
    }
    r, g, b = color_map.get(struct.get("besoin_id", "besoin-1"), (0.2, 0.4, 0.8))

    content_stream = []
    # Bannière supérieure
    content_stream.append(f"{r:.2f} {g:.2f} {b:.2f} rg")
    content_stream.append("0 740 595 102 re f")
    
    # Ligne décorative en bas de page
    content_stream.append("0 0 595 30 re f")

    # Texte de l'en-tête (blanc)
    content_stream.append("1 1 1 rg")
    content_stream.append("BT")
    content_stream.append("/F1 12 Tf")
    content_stream.append(f"40 810 Td ({escape_pdf_text('FICHE STRUCTURE - MODELISATION DES PARCOURS PA')}) Tj")
    content_stream.append("/F2 18 Tf")
    content_stream.append(f"0 -26 Td ({escape_pdf_text(struct.get('nom', 'Structure'))}) Tj")
    content_stream.append("/F1 11 Tf")
    content_stream.append(f"0 -18 Td ({escape_pdf_text(besoin_titre)} | {escape_pdf_text(struct.get('categorie', ''))}) Tj")
    content_stream.append("ET")

    # Texte du pied de page
    content_stream.append("BT")
    content_stream.append("/F1 9 Tf")
    content_stream.append(f"40 12 Td (Document d'orientation et de cadrage - Filiere Geriatrique & Maintien a Domicile 83) Tj")
    content_stream.append("ET")

    # Corps du texte (noir/gris sombre)
    content_stream.append("0.1 0.1 0.1 rg")
    
    y = 705

    def add_section(title, text_lines, is_bold=False):
        nonlocal y
        if not text_lines:
            return
        # Titre de section
        content_stream.append(f"{r:.2f} {g:.2f} {b:.2f} rg")
        content_stream.append("BT")
        content_stream.append("/F2 12 Tf")
        content_stream.append(f"40 {y} Td ({escape_pdf_text(title.upper())}) Tj")
        content_stream.append("ET")
        y -= 16

        # Ligne de séparation fine sous le titre
        content_stream.append(f"{r:.2f} {g:.2f} {b:.2f} RG 1 w")
        content_stream.append(f"40 {y+12} m 555 {y+12} l S")

        # Contenu
        content_stream.append("0.15 0.15 0.15 rg")
        content_stream.append("BT")
        font_name = "/F2" if is_bold else "/F1"
        content_stream.append(f"{font_name} 10 Tf")
        content_stream.append(f"40 {y} Td")
        first = True
        for line in text_lines:
            if first:
                content_stream.append(f"({escape_pdf_text(line)}) Tj")
                first = False
            else:
                content_stream.append(f"0 -14 Td ({escape_pdf_text(line)}) Tj")
            y -= 14
        content_stream.append("ET")
        y -= 14

    # Rôle & Missions
    add_section("1. Role principal et missions", wrap_text(struct.get("role", "")), is_bold=True)
    add_section("2. Description detaillee", wrap_text(struct.get("description", "")))
    add_section("3. Public cible concerne", wrap_text(struct.get("public_cible", "")))
    add_section("4. Criteres d'orientation et d'eligibilite", wrap_text(struct.get("criteres", "")))
    add_section("5. Modalites d'acces & Outil d'orientation", [
        f"Mode d'acces : {struct.get('mode_acces', 'Non renseigne')}",
        f"Outil d'orientation : {struct.get('outil', 'Non renseigne')}"
    ])
    add_section("6. Contact et coordination", wrap_text(struct.get("contact", "DAC Var Ouest / Territoire 83")))

    # Stream final
    stream_content = "\n".join(content_stream)
    stream_bytes = stream_content.encode('latin1', errors='replace')
    stream_len = len(stream_bytes)

    # Objets PDF
    objs = []
    
    # 1: Catalog
    objs.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    # 2: Pages
    objs.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    # 3: Page
    objs.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n")
    # 4: Contents
    objs.append(f"4 0 obj\n<< /Length {stream_len} >>\nstream\n{stream_content}\nendstream\nendobj\n")
    # 5: Font F1 (Helvetica)
    objs.append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n")
    # 6: Font F2 (Helvetica-Bold)
    objs.append("6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n")

    # Assemblage
    pdf_bytes = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for obj_str in objs:
        offsets.append(len(pdf_bytes))
        pdf_bytes.extend(obj_str.encode('latin1'))

    xref_offset = len(pdf_bytes)
    pdf_bytes.extend(b"xref\n0 7\n0000000000 65535 f \n")
    for off in offsets:
        pdf_bytes.extend(f"{off:010d} 00000 n \n".encode('ascii'))
    
    pdf_bytes.extend(f"trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode('ascii'))

    with open(filepath, "wb") as f:
        f.write(pdf_bytes)

def main():
    json_path = os.path.join("data", "structures.json")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    besoins_map = {b["id"]: b["titre"] for b in data.get("besoins", [])}
    pdf_dir = "pdfs"
    os.makedirs(pdf_dir, exist_ok=True)

    count = 0
    for s in data.get("structures", []):
        filename = s.get("pdf_filename", f"fiche_{s['id']}.pdf")
        dest = os.path.join(pdf_dir, filename)
        besoin_titre = besoins_map.get(s.get("besoin_id"), "Parcours PA")
        create_pdf(dest, s, besoin_titre)
        count += 1

    print(f"Genere avec succes {count} fichiers PDF dans le dossier {pdf_dir}/")

if __name__ == "__main__":
    main()
