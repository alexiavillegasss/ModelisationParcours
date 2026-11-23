import os
from generate_pdfs import escape_pdf_text, wrap_text

CRT_DATA = [
    {
        "id": "crt-provence-verdon",
        "nom": "CRT PROVENCE VERDON",
        "slogan": "Centre de Ressources Territorial - Haut Var & Provence Verdon",
        "porteur": "EHPAD Maison Saint-Jacques (Rians) / Finance par l'ARS PACA",
        "rgb": (0.12, 0.25, 0.69), # Bleu nuit
        "communes": "15 communes : Rians, Vinon-sur-Verdon, Saint-Julien, Ginasservis, Artigues, Esparron, Saint-Martin-de-Pallieres, Brue-Auriac, Seillons-Source-d'Argens, Barjols, Ponteves, Varages, Tavernes, Fox-Amphoux, Montmeyan.",
        "volet1": "Appui aux professionnels du domicile, formations gerontologiques de proximite, actions et forums de prevention de la fragilite, soutien et repit pour les aidants familiaux.",
        "volet2": "Accompagnement renforce et intensif a domicile (alternative concrete a l'EHPAD) pour personnes agees de 60 ans et + (GIR 1-4). Securisation 24/7, visites a domicile et coordination continue.",
        "equipe": "Medecin coordonnateur, Infirmiere coordinatrice (IDEC), Ergotherapeute, Psychologue, Assistants de soins en gerontologie (ASG).",
        "public": "Personnes de 60 ans et + en perte d'autonomie (GIR 1 a 4) residant sur le territoire Provence Verdon, et leurs proches aidants.",
        "contact": "EHPAD Maison Saint-Jacques, 83560 Rians",
        "tel": "04 94 80 50 00",
        "email": "crt.provenceverdon@maison-st-jacques.com",
        "filename": "flyer_crt_provence_verdon.pdf"
    },
    {
        "id": "crt-mar-vivo",
        "nom": "CRT MAR VIVO - CHEZ VOUS",
        "slogan": "Service Renforce a Domicile (SRAD) - EHPAD Hors les Murs",
        "porteur": "LNA Sante - Residence Les Jardins de Mar Vivo (La Seyne-sur-Mer)",
        "rgb": (0.75, 0.09, 0.36), # Magenta / Rose fonce
        "communes": "Bassin Ouest Toulonnais : La Seyne-sur-Mer, Six-Fours-les-Plages, Saint-Mandrier-sur-Mer, Ollioules, Sanary-sur-Mer, Toulon Ouest (Cantons C1, C2, C3).",
        "volet1": "Partage d'expertise gerontologique, ateliers thematiques pour aidants, conferences, synergies entre soignants liberaux et etablissements.",
        "volet2": "Accompagnement renforce au domicile : coordination medicale et paramedicale, securisation de l'habitat (ergonomie, domotique), astreinte soignante, acces direct au plateau technique de l'EHPAD.",
        "equipe": "Infirmiere coordinatrice dediee, Ergotherapeute, Psychologue, Assistant social, Assistants de soins, reseau de professionnels liberaux.",
        "public": "Seniors de 60 ans et plus en perte d'autonomie (GIR 1 a 4) souhaitant prolonger sereinement leur maintien a domicile.",
        "contact": "Residence Les Jardins de Mar Vivo, 104 Chemin du Manoir Vivo aux 2 Chenes, 83500 La Seyne-sur-Mer",
        "tel": "04 94 10 99 00",
        "email": "crt.marvivo@lna-sante.com",
        "filename": "flyer_crt_mar_vivo.pdf"
    },
    {
        "id": "crt-le-beausset",
        "nom": "CRT LE BEAUSSET - VAR OUEST",
        "slogan": "Centre de Ressources Territorial Sud Sainte-Baume & Var Ouest",
        "porteur": "EHPAD Public Manon des Sources (Le Beausset) / ARS PACA",
        "rgb": (0.02, 0.59, 0.41), # Vert
        "communes": "8 communes : Le Beausset, Bandol, Evenos, La Cadiere d'Azur, Le Castellet, Riboux, Signes, Saint-Cyr-sur-Mer.",
        "volet1": "Actions territoriales de prevention, ateliers memoire et motricite, soutien psycho-social aux aidants familiaux, etayage des professionnels de terrain.",
        "volet2": "Accompagnement renforce a domicile pour personnes tres dependantes (GIR 1 a 4) : evaluation multidimensionnelle, amenagement du domicile, coordination soignante et humaine.",
        "equipe": "Equipe pluridisciplinaire de l'EHPAD Manon des Sources, Medecin, IDEC, Ergotherapeute, Psychologue, partenaires SAD et liberaux.",
        "public": "Aines de 60 ans et + en situation de fragilite ou perte d'autonomie, familles et soignants du secteur Var Ouest.",
        "contact": "EHPAD Manon des Sources, 83330 Le Beausset - Permanences mardi et vendredi",
        "tel": "04 94 98 55 00 / 06 08 46 20 32",
        "email": "crt.lebeausset@gmail.com",
        "filename": "flyer_crt_le_beausset.pdf"
    },
    {
        "id": "crt-felix-pey",
        "nom": "CRT FELIX PEY - AVEC VOUS",
        "slogan": "Centre de Ressources Territorial Vallee du Gapeau & Coeur du Var",
        "porteur": "EHPAD Public Felix Pey (Sollies-Pont)",
        "rgb": (0.85, 0.47, 0.02), # Ocre / Ambre
        "communes": "8 communes : Sollies-Pont, Sollies-Toucas, Sollies-Ville, Cuers, Belgentier, Pierrefeu-du-Var, Puget-Ville, La Crau.",
        "volet1": "Sensibilisation gerontologique, ateliers de prevention de la perte d'autonomie, formations de proximite pour intervenants du domicile et aidants.",
        "volet2": "Accompagnement intensif au domicile : plan de soins personnalise, coordination pluridisciplinaire, securisation du domicile, solution alternative a l'entree en EHPAD.",
        "equipe": "Medecin coordonnateur, IDEC, Ergotherapeute, Psychologue, Assistants de soins en gerontologie, aides-soignants.",
        "public": "Personnes de 60 ans et + (GIR 1-4) residant dans le secteur du Gapeau et souhaitant rester a leur domicile dans un cadre securise.",
        "contact": "EHPAD Felix Pey, Chemin des Senes, 83210 Sollies-Pont",
        "tel": "04 94 28 91 16",
        "email": "crt@ehpad-felixpey.fr",
        "filename": "flyer_crt_felix_pey.pdf"
    },
    {
        "id": "crt-chits",
        "nom": "CRT C.H.I.T.S TOULON",
        "slogan": "Centre Hospitalier Intercommunal Toulon - La Seyne-sur-Mer",
        "porteur": "Filiere Geriatrique Hospitaliere / EHPAD Clemenceau (La Garde)",
        "rgb": (0.01, 0.52, 0.78), # Cyan / Bleu Ciel
        "communes": "Toulon Metropole (Cantons C4, C5, C6, C7), La Garde, La Valette-du-Var, Le Pradet, Le Revest-les-Eaux.",
        "volet1": "Diffusion de l'expertise geriatrique de recours, formation et appui des soignants de ville, deploiement du programme ICOPE et ateliers sport-sante APA.",
        "volet2": "Suivi renforce post-hospitalisation et maintien intensif : coordination medico-soignante, astreinte geriatrique, tele-expertise, liens etroits avec l'hopital.",
        "equipe": "Medecin geriatre coordonnateur, Infirmiere coordinatrice, Ergotherapeute, Enseignant en APA, Assistant social, Psychologue clinicien, ASG.",
        "public": "Personnes de 60 ans et + du bassin toulonnais en situation de dependance severe (GIR 1 a 4) avec risque de rupture du maintien a domicile.",
        "contact": "Hopital Clemenceau CHITS, 83130 La Garde - Pole de Gerontologie",
        "tel": "04 94 08 80 00",
        "email": "crt.geriatrie@ch-toulon.fr",
        "filename": "flyer_crt_chits.pdf"
    }
]

def build_crt_pdf(crt, out_path):
    r, g, b = crt["rgb"]
    content_stream = []

    # Banniere superieure coloree
    content_stream.append(f"{r:.2f} {g:.2f} {b:.2f} rg")
    content_stream.append("0 725 595 117 re f")

    # Bande decorative inferieure
    content_stream.append("0 0 595 32 re f")

    # En-tete
    content_stream.append("1 1 1 rg")
    content_stream.append("BT")
    content_stream.append("/F2 10 Tf")
    content_stream.append("40 812 Td (PLAQUETTE OFFICIELLE D'INFORMATION - DISPOSITIF CRT 83) Tj")
    content_stream.append("/F2 18 Tf")
    content_stream.append(f"0 -24 Td ({escape_pdf_text(crt['nom'])}) Tj")
    content_stream.append("/F1 10 Tf")
    content_stream.append(f"0 -16 Td ({escape_pdf_text(crt['slogan'])}) Tj")
    content_stream.append("/F1 9 Tf")
    content_stream.append(f"0 -14 Td ({escape_pdf_text('Structure porteuse : ' + crt['porteur'])}) Tj")
    content_stream.append("ET")

    # Pied de page
    content_stream.append("BT")
    content_stream.append("/F1 8.5 Tf")
    content_stream.append(f"40 12 Td (Cartographie & Flyers des Centres de Ressources Territoriaux du Var - DAC Var Ouest / ARS PACA) Tj")
    content_stream.append("ET")

    y = 695

    def add_section(title, text_lines, is_highlight=False):
        nonlocal y
        if not text_lines:
            return
        
        # Encart de fond si mis en valeur
        if is_highlight:
            content_stream.append(f"{r*0.15 + 0.85:.2f} {g*0.15 + 0.85:.2f} {b*0.15 + 0.85:.2f} rg")
            box_h = len(text_lines) * 14 + 30
            content_stream.append(f"30 {y - box_h + 16} 535 {box_h} re f")

        content_stream.append(f"{r:.2f} {g:.2f} {b:.2f} rg")
        content_stream.append("BT")
        content_stream.append("/F2 11 Tf")
        content_stream.append(f"40 {y} Td ({escape_pdf_text(title.upper())}) Tj")
        content_stream.append("ET")
        y -= 15

        content_stream.append(f"{r:.2f} {g:.2f} {b:.2f} RG 1 w")
        content_stream.append(f"40 {y+11} m 555 {y+11} l S")

        content_stream.append("0.12 0.12 0.12 rg")
        content_stream.append("BT")
        content_stream.append("/F1 9.5 Tf")
        content_stream.append(f"40 {y} Td")
        first = True
        for line in text_lines:
            if first:
                content_stream.append(f"({escape_pdf_text(line)}) Tj")
                first = False
            else:
                content_stream.append(f"0 -13 Td ({escape_pdf_text(line)}) Tj")
            y -= 13
        content_stream.append("ET")
        y -= 14

    add_section("1. Territoire d'intervention & Communes couvertes", wrap_text(crt["communes"], 80), is_highlight=True)
    add_section("2. Volet 1 - Appui & Mutualisation des ressources territoriales", wrap_text(crt["volet1"], 80))
    add_section("3. Volet 2 - Accompagnement renforce a domicile (Alternative EHPAD)", wrap_text(crt["volet2"], 80))
    add_section("4. Composition de l'equipe pluridisciplinaire", wrap_text(crt["equipe"], 80))
    add_section("5. Public cible & Criteres d'admission", wrap_text(crt["public"], 80))
    add_section("6. Coordonnees & Modalites de contact", [
        f"Lieu / Etablissement : {crt['contact']}",
        f"Telephone : {crt['tel']}",
        f"Email : {crt['email']}",
        "Saisine : Medecin traitant, DAC Var Ouest, CLIC, Travailleur social ou famille"
    ], is_highlight=True)

    stream_content = "\n".join(content_stream)
    stream_bytes = stream_content.encode('latin1', errors='replace')
    stream_len = len(stream_bytes)

    objs = []
    objs.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    objs.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    objs.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n")
    objs.append(f"4 0 obj\n<< /Length {stream_len} >>\nstream\n{stream_content}\nendstream\nendobj\n")
    objs.append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n")
    objs.append("6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n")

    xref_positions = []
    current_pos = 0
    header = "%PDF-1.4\n"
    current_pos += len(header.encode('latin1'))

    body_bytes = b""
    for obj_str in objs:
        xref_positions.append(current_pos)
        b_chunk = obj_str.encode('latin1')
        body_bytes += b_chunk
        current_pos += len(b_chunk)

    xref_pos = current_pos
    xref_str = f"xref\n0 {len(objs)+1}\n0000000000 65535 f \n"
    for pos in xref_positions:
        xref_str += f"{pos:010d} 00000 n \n"

    trailer_str = f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n"

    with open(out_path, "wb") as f:
        f.write(header.encode('latin1'))
        f.write(body_bytes)
        f.write(xref_str.encode('latin1'))
        f.write(trailer_str.encode('latin1'))

    print(f"Generated {out_path} ({os.path.getsize(out_path)} bytes)")

def main():
    os.makedirs("pdfs", exist_ok=True)
    for crt in CRT_DATA:
        out = os.path.join("pdfs", crt["filename"])
        build_crt_pdf(crt, out)

if __name__ == "__main__":
    main()
