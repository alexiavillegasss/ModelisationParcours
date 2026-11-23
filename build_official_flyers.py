import fitz
import os

TEMPLATE_PATH = r'C:\Users\alexi\.gemini\antigravity\brain\3353040b-8a4c-4f8e-9e6b-d28798a04378\.user_uploaded\media_1793699849118_24db564a.pdf'

CRT_DATA = [
    {
        "id": "crt-provence-verdon",
        "filename": "flyer_crt_provence_verdon",
        "structure": "EHPAD Maison Saint-Jacques (Rians) / ARS PACA",
        "nom_service": "Centre de Ressources Territorial (CRT) Provence Verdon",
        "contact_tel": "04 94 80 50 00",
        "contact_mail": "crt.provenceverdon@maison-st-jacques.com",
        "ref_tel": "04 94 80 50 05",
        "ref_mail": "coordination.crt@maison-st-jacques.com",
        "site": "www.maison-st-jacques.com",
        "horaires": "Du lundi au vendredi : 8h30 - 17h30\nAstreinte soignante 24/7 (Volet 2)",
        "secteur": "15 communes du Haut-Var : Rians, Vinon/Verdon, St-Julien, Ginasservis, Artigues, Esparron, St-Martin, Brue-Auriac, Seillons, Barjols, Pontévès, Varages, Tavernes, Fox-Amphoux, Montmeyan.",
        "equipe": "Médecin gériatre coordonnateur, IDEC, Ergothérapeute, Psychologue clinicien, Assistants de soins en gérontologie (ASG).",
        "public_choice": "60", # 60 ans et +
        "type_patient": "Personnes âgées de 60 ans et + en perte d'autonomie (GIR 1 à 4), résidant sur le territoire Provence Verdon, nécessitant un accompagnement renforcé alternatif à l'entrée en EHPAD.",
        "adresseurs": "Médecins traitants, DAC Var Ouest, Équipes Mobiles de Gériatrie (EMG), CLIC, Services d'aide et de soins à domicile (SAD/SSIAD), Travailleurs sociaux.",
        "deroulement": "• Volet 1 (Appui & Ressources) : Sensibilisation gérontologique, formations soignantes de proximité, ateliers de prévention des chutes, dépistage précoce des fragilités (démarche ICOPE de l'OMS).\n\n• Volet 2 (Accompagnement renforcé à domicile) : Visite d'évaluation multidimensionnelle à domicile par l'IDEC et l'ergothérapeute. Co-construction du Plan Personnalisé d'Accompagnement (PPA) avec le médecin traitant. Sécurisation 24h/24, téléassistance, astreinte continue et passerelle avec l'EHPAD porteur.",
        "tags_cassi": "CRT, Provence Verdon, Haut-Var, Gériatrie, GIR 1-4, Maintien renforcé, Alternative EHPAD, Prévention ICOPE, Répit aidants.",
        "partenaires": "DAC Var Ouest, CPTS Provence Verdon, SSIAD/SAD territoriaux, Accueil de jour, Plateforme de répit des aidants, SMR gériatrique de secteur.",
        "aidants": "Entretiens de soutien psychosocial, évaluation du fardeau (échelle de Zarit), orientation répit, solutions d'accueil temporaire en EHPAD."
    },
    {
        "id": "crt-le-beausset",
        "filename": "flyer_crt_le_beausset",
        "structure": "EHPAD Public Manon des Sources (Le Beausset) / ARS PACA",
        "nom_service": "Centre de Ressources Territorial (CRT) Le Beausset - Var Ouest",
        "contact_tel": "04 94 98 55 00 / 06 08 46 20 32",
        "contact_mail": "crt.lebeausset@gmail.com",
        "ref_tel": "06 08 46 20 32",
        "ref_mail": "idec.crt@ehpad-lebeausset.fr",
        "site": "www.ville-lebeausset.fr",
        "horaires": "Permanences mardis et vendredis matin (9h-12h)\nContinuité et astreinte soignante Volet 2",
        "secteur": "8 communes : Le Beausset, Bandol, Evenos, La Cadière d'Azur, Le Castellet, Riboux, Signes, Saint-Cyr-sur-Mer.",
        "equipe": "Médecin coordonnateur, IDEC référente, Ergothérapeute, Psychologue, ASG, réseau des professionnels libéraux et SAD.",
        "public_choice": "60",
        "type_patient": "Personnes de 60 ans et + en situation de dépendance ou fragilité sévère (GIR 1-4) avec volonté de maintien à domicile sur le bassin Sud Sainte-Baume / Littoral Ouest.",
        "adresseurs": "Médecins traitants, DAC Var Ouest, CLIC, CCAS, Services d'aide et de soins à domicile, professionnels de santé libéraux du Var Ouest.",
        "deroulement": "• Volet 1 (Appui territorial & Prévention) : Ateliers mémoire, équilibre et motricité, conseil en aménagement du cadre de vie et aides techniques, soutien psychosocial des aidants.\n\n• Volet 2 (Accompagnement intensif au domicile) : Plan d'accompagnement individualisé, coordination resserrée soignante et humaine, sécurisation 24h/24, réponse d'urgence et accès aux solutions de répit de l'EHPAD Manon des Sources.",
        "tags_cassi": "CRT, Le Beausset, Var Ouest, Sud Sainte-Baume, GIR 1-4, Maintien à domicile, Ergothérapie, Sécurisation, Soutien aidants.",
        "partenaires": "DAC Var Ouest, CPTS Ouest Var, SAD/SSIAD du secteur, CCAS communaux, Plateformes de répit, Hôpital de proximité.",
        "aidants": "Groupes d'échanges, soutien psychologique individuel, formations aux gestes et postures, orientation vers des solutions de répit."
    },
    {
        "id": "crt-mar-vivo",
        "filename": "flyer_crt_mar_vivo",
        "structure": "LNA Santé - Résidence Les Jardins de Mar Vivo (La Seyne-sur-Mer)",
        "nom_service": "CRT Mar Vivo « Chez vous » - Service Renforcé à Domicile (SRAD)",
        "contact_tel": "04 94 10 99 00",
        "contact_mail": "crt.marvivo@lna-sante.com",
        "ref_tel": "04 94 10 99 05",
        "ref_mail": "coordination.srad@lna-sante.com",
        "site": "www.lna-sante.com",
        "horaires": "Du lundi au vendredi : 8h30 - 18h00\nVeille gériatrique et astreinte soignante 24/7",
        "secteur": "Bassin Ouest Toulonnais : La Seyne-sur-Mer, Six-Fours-les-Plages, Saint-Mandrier-sur-Mer, Ollioules, Sanary-sur-Mer, Toulon Ouest (Cantons C1, C2, C3).",
        "equipe": "IDEC dédiée, Ergothérapeute de terrain, Psychologue, Assistant social, Assistants de soins en gérontologie (ASG).",
        "public_choice": "60",
        "type_patient": "Personnes de 60 ans et + en perte d'autonomie (GIR 1 à 4) résidant sur l'Ouest Toulonnais, souhaitant une alternative solide à l'entrée définitive en institution.",
        "adresseurs": "Médecins traitants, DAC Var Ouest, Équipes Mobiles Hospitalières, CLIC, Travailleurs sociaux du Département, Services à domicile.",
        "deroulement": "• Volet 1 (Centre de ressources) : Partage de l'expertise gérontologique de la résidence, conférences et ateliers de prévention pour seniors et proches, formations soignantes.\n\n• Volet 2 (EHPAD Hors les Murs / SRAD) : Coordination resserrée de l'ensemble des soignants et aides, sécurisation de l'habitat (ergonomie, domotique), astreinte soignante continue et accès prioritaire aux prestations de l'EHPAD (hébergement temporaire, répit).",
        "tags_cassi": "CRT, Mar Vivo, SRAD, EHPAD Hors les Murs, GIR 1-4, Ouest Toulonnais, Domotique, Répit aidants.",
        "partenaires": "DAC Var Ouest, CPTS Ouest Toulonnais, SAD/SSIAD, CHITS Toulon, Réseau de professionnels libéraux de santé.",
        "aidants": "Cafés des aidants, répit personnalisé, accès simplifié aux accueils temporaires d'urgence et séjours de répit au sein de l'établissement."
    },
    {
        "id": "crt-felix-pey",
        "filename": "flyer_crt_felix_pey",
        "structure": "EHPAD Public Félix Pey (Solliès-Pont) / ARS PACA",
        "nom_service": "Centre de Ressources Territorial (CRT) Félix Pey « Avec vous »",
        "contact_tel": "04 94 28 91 16",
        "contact_mail": "crt@ehpad-felixpey.fr",
        "ref_tel": "04 94 28 91 20",
        "ref_mail": "idec.crt@ehpad-felixpey.fr",
        "site": "www.ville-sollies-pont.fr",
        "horaires": "Du lundi au vendredi : 8h30 - 17h00\nContinuité de prise en charge Volet 2",
        "secteur": "8 communes Vallée du Gapeau : Solliès-Pont, Solliès-Toucas, Solliès-Ville, Cuers, Belgentier, Pierrefeu-du-Var, Puget-Ville, La Crau.",
        "equipe": "Médecin gériatre coordonnateur, IDEC, Ergothérapeute spécialisé, Psychologue clinicien, Assistants de soins gérontologiques.",
        "public_choice": "60",
        "type_patient": "Personnes de 60 ans et + en perte d'autonomie avancée (GIR 1 à 4) résidant dans la Vallée du Gapeau et souhaitant rester à domicile dans un cadre sécurisé.",
        "adresseurs": "Médecins traitants, DAC Var Ouest, CLIC, CCAS, Travailleurs sociaux départementaux, Services d'aide et de soins à domicile.",
        "deroulement": "• Volet 1 (Animation gérontologique & Formation) : Ateliers prévention du bien vieillir dans les communes du Gapeau, sensibilisation des soignants de premier recours au repérage précoce.\n\n• Volet 2 (Maintien intensif à domicile) : Plan de soins et d'aides personnalisé, interventions d'ergothérapie pour compenser la perte d'autonomie motrice et cognitive, étayage soignant et passerelle avec l'EHPAD Félix Pey.",
        "tags_cassi": "CRT, Félix Pey, Vallée du Gapeau, GIR 1-4, Maintien renforcé, Ergothérapie domicile, Répit aidants.",
        "partenaires": "DAC Var Ouest, CPTS Vallée du Gapeau, SAD/SSIAD du secteur, Hôpital de jour, Plateforme de répit territoriale.",
        "aidants": "Entretiens de soutien, guidance des proches dans les gestes de la vie quotidienne, mise en place de séjours de répit programmés ou d'urgence."
    },
    {
        "id": "crt-chits",
        "filename": "flyer_crt_chits",
        "structure": "CHITS - Hôpital Clemenceau (La Garde) / Filière Gériatrique",
        "nom_service": "Centre de Ressources Territorial (CRT) C.H.I.T.S Toulon Métropole",
        "contact_tel": "04 94 08 80 00",
        "contact_mail": "crt.geriatrie@ch-toulon.fr",
        "ref_tel": "04 94 08 82 40",
        "ref_mail": "idec.crt@ch-toulon.fr",
        "site": "www.ch-toulon.fr",
        "horaires": "Du lundi au vendredi : 8h30 - 17h30\nLiaison hospitalière et astreinte soignante",
        "secteur": "Toulon Métropole (Cantons C4, C5, C6, C7), La Garde, La Valette-du-Var, Le Pradet, Le Revest-les-Eaux.",
        "equipe": "Médecin gériatre hospitalier, IDEC, Ergothérapeute, Enseignant en APA, Assistant social, Psychologue, ASG.",
        "public_choice": "60",
        "type_patient": "Personnes de 60 ans et + du bassin métropolitain en situation de dépendance lourde (GIR 1 à 4) avec fragilité aiguë ou risque de rupture post-urgence/hospitalisation.",
        "adresseurs": "Médecins traitants, Praticiens hospitaliers (Urgences, CSG, SMR), DAC Var Ouest, CLIC, SAD/SSIAD, Travailleurs sociaux.",
        "deroulement": "• Volet 1 (Appui d'expertise hospitalière) : Diffusion de l'expertise gériatrique, déploiement du programme OMS ICOPE, ateliers sport-santé APA, télé-expertise gériatrique.\n\n• Volet 2 (Suivi post-hospitalisation & Maintien intensif) : Suivi médical et soignant renforcé, coordination serrée post-urgence, sécurisation des traitements, télésurveillance et passerelle hospitalière continue.",
        "tags_cassi": "CRT, CHITS, Gériatrie hospitalière, GIR 1-4, Sortie hospitalisation, ICOPE, Sport-santé APA, Télé-expertise.",
        "partenaires": "DAC Var Ouest, Services d'urgence et gériatrie CHITS, CPTS Toulon, HAD, SAD/SSIAD métropolitains, Plateformes de répit.",
        "aidants": "Bilan de vulnérabilité de l'aidant, conseils ergothérapiques, soutien psychologique et mobilisation des dispositifs de répit et de transition."
    }
]

FONT_ARIAL = 'C:/Windows/Fonts/arial.ttf'
FONT_ARIAL_BOLD = 'C:/Windows/Fonts/arialbd.ttf'

def generate_flyers():
    os.makedirs("pdfs", exist_ok=True)
    os.makedirs("assets", exist_ok=True)

    for item in CRT_DATA:
        doc = fitz.open(TEMPLATE_PATH)
        page = doc[0]

        if os.path.exists(FONT_ARIAL):
            page.insert_font(fontname="arial", fontfile=FONT_ARIAL)
            font_regular = "arial"
        else:
            font_regular = "helv"

        if os.path.exists(FONT_ARIAL_BOLD):
            page.insert_font(fontname="arial-bold", fontfile=FONT_ARIAL_BOLD)
            font_bold = "arial-bold"
        else:
            font_bold = font_regular

        color_navy = (0.08, 0.2, 0.45)
        color_dark = (0.12, 0.15, 0.2)

        # 1. Structure & Nom Service (dans les rectangles blancs de l'en-tête bleu)
        page.insert_textbox(fitz.Rect(36, 102, 395, 127), item["structure"], fontsize=9.5, fontname=font_bold, color=color_navy)
        page.insert_textbox(fitz.Rect(36, 160, 395, 185), item["nom_service"], fontsize=9.5, fontname=font_bold, color=color_navy)

        # 2. Block 1 Contact
        page.insert_textbox(fitz.Rect(52, 234, 198, 248), item["contact_tel"], fontsize=8.5, fontname=font_regular, color=color_dark)
        page.insert_textbox(fitz.Rect(52, 253, 198, 268), item["contact_mail"], fontsize=7.5, fontname=font_regular, color=color_dark)

        # 3. Block 2 Référent opérationnel
        page.insert_textbox(fitz.Rect(263, 234, 408, 248), item["ref_tel"], fontsize=8.5, fontname=font_regular, color=color_dark)
        page.insert_textbox(fitz.Rect(263, 253, 408, 268), item["ref_mail"], fontsize=7.5, fontname=font_regular, color=color_dark)

        # 4. Block 3 Site internet & Block 4 Horaires
        page.insert_textbox(fitz.Rect(26, 308, 198, 338), item["site"], fontsize=8.5, fontname=font_regular, color=color_dark)
        page.insert_textbox(fitz.Rect(236, 308, 408, 338), item["horaires"], fontsize=8, fontname=font_regular, color=color_dark)

        # 5. Block 5 Secteur d'intervention & Block 6 Composition équipe
        page.insert_textbox(fitz.Rect(26, 375, 198, 452), item["secteur"], fontsize=8, fontname=font_regular, color=color_dark)
        page.insert_textbox(fitz.Rect(236, 375, 408, 452), item["equipe"], fontsize=8, fontname=font_regular, color=color_dark)

        # 6. Checkbox "60 ans et +" : remplir le cercle
        page.draw_circle(fitz.Point(102.7, 485.8), 3.5, color=(0.1, 0.4, 0.8), fill=(0.1, 0.4, 0.8))

        # 7. Block 7 Type de patient
        page.insert_textbox(fitz.Rect(26, 532, 408, 582), item["type_patient"], fontsize=8, fontname=font_regular, color=color_dark)

        # 8. Block 8 Professionnels adresseurs
        page.insert_textbox(fitz.Rect(438, 124, 630, 168), item["adresseurs"], fontsize=7.8, fontname=font_regular, color=color_dark)

        # Checkboxes Modalités de contact (Formulaire, Mail, Tél.)
        page.draw_circle(fitz.Point(652.5, 132.5), 3, color=(0.9, 0.4, 0.1), fill=(0.9, 0.4, 0.1)) # Formulaire
        page.draw_circle(fitz.Point(722.1, 132.5), 3, color=(0.9, 0.4, 0.1), fill=(0.9, 0.4, 0.1)) # Mail
        page.draw_circle(fitz.Point(767.3, 132.5), 3, color=(0.9, 0.4, 0.1), fill=(0.9, 0.4, 0.1)) # Tél.

        # 9. Block 9 Déroulement d'un accompagnement / prise en charge
        page.insert_textbox(fitz.Rect(438, 215, 815, 395), item["deroulement"], fontsize=8.2, fontname=font_regular, color=color_dark)

        # Tags CASSI
        page.insert_textbox(fitz.Rect(438, 418, 815, 460), item["tags_cassi"], fontsize=8, fontname=font_regular, color=(0.2, 0.3, 0.4))

        # Partenaires relais
        page.insert_textbox(fitz.Rect(438, 482, 815, 530), item["partenaires"], fontsize=8, fontname=font_regular, color=color_dark)

        # 10. Block 10 Action spécifique pour les aidants
        page.insert_textbox(fitz.Rect(438, 566, 815, 583), item["aidants"], fontsize=7.8, fontname=font_regular, color=color_dark)

        # Sauvegarde du PDF
        pdf_path = os.path.join("pdfs", item["filename"] + ".pdf")
        doc.save(pdf_path)

        # Rendu haute définition en PNG pour affichage direct instantané dans l'application
        pix = page.get_pixmap(dpi=150)
        png_path = os.path.join("assets", item["filename"] + ".png")
        pix.save(png_path)

        print(f"Generated: {pdf_path} and {png_path} ({pix.width}x{pix.height})")

if __name__ == "__main__":
    generate_flyers()
