import fitz
import os

TEMPLATE_PATH = r'C:\Users\alexi\.gemini\antigravity\brain\3353040b-8a4c-4f8e-9e6b-d28798a04378\.user_uploaded\media_1793699849118_24db564a.pdf'
FONT_ARIAL = 'C:/Windows/Fonts/arial.ttf'
FONT_ARIAL_BOLD = 'C:/Windows/Fonts/arialbd.ttf'

def build_perfect_adnp_flyer():
    doc = fitz.open(TEMPLATE_PATH)
    page = doc[0]

    # Inscription des polices Arial pour les accents
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
    color_dark = (0.1, 0.12, 0.18)
    color_blue_check = (0.1, 0.4, 0.8)

    # -------------------------------------------------------------
    # 1. EN-TÊTE BLEU (dans les deux rectangles blancs)
    # Structure (ligne blanche du haut : centre vertical autour de y=117)
    page.insert_text(fitz.Point(45, 118), "Filière gériatrique du CHITS", fontname=font_bold, fontsize=11, color=color_navy)

    # Nom du service / dispositif (ligne blanche du bas : centre vertical autour de y=175)
    page.insert_text(fitz.Point(45, 175), "Cellule ADNP (admissions directes non programmées)", fontname=font_bold, fontsize=10.5, color=color_navy)

    # -------------------------------------------------------------
    # 2. BLOC 1 : CONTACT
    # Tél. (ligne à y=246.1)
    page.insert_text(fitz.Point(52, 243.5), "04 94 14 55 66", fontname=font_regular, fontsize=8.5, color=color_dark)
    # Mail (ligne à y=264.9)
    page.insert_text(fitz.Point(52, 262.0), "celluleadnp.chits@ch-toulon.fr", fontname=font_regular, fontsize=7.5, color=color_dark)

    # -------------------------------------------------------------
    # 3. BLOC 4 : HORAIRES
    # Ligne 1 à y=313.7
    page.insert_text(fitz.Point(264, 311.0), "9h à 16h du lundi au vendredi", fontname=font_regular, fontsize=8.5, color=color_dark)

    # -------------------------------------------------------------
    # 4. BLOC 5 : SECTEUR D'INTERVENTION
    # 4 lignes réelles détectées dans le gabarit :
    # Ligne 1 : y=388.2
    # Ligne 2 : y=407.8
    # Ligne 3 : y=424.3
    # Ligne 4 : y=443.9
    page.insert_text(fitz.Point(27, 385.5), "CPTS TOULON LITTORAL", fontname=font_regular, fontsize=8, color=color_dark)
    page.insert_text(fitz.Point(27, 405.0), "CPTS LSTO, CPTS Var Provence Méditerranée", fontname=font_regular, fontsize=7.5, color=color_dark)
    page.insert_text(fitz.Point(27, 421.5), "CPTS Vallée du Gapeau, CPTS Var Ouest", fontname=font_regular, fontsize=7.5, color=color_dark)

    # -------------------------------------------------------------
    # 5. BLOC 6 : COMPOSITION DE L'ÉQUIPE
    # Ligne 1 : y=387.4
    page.insert_text(fitz.Point(242, 384.5), "1 IDE coordinatrice", fontname=font_regular, fontsize=8.5, color=color_dark)

    # -------------------------------------------------------------
    # 6. PUBLIC : Case "75 ans et +" (centre du cercle : x=178.8, y=485.8)
    page.draw_circle(fitz.Point(178.8, 485.8), 3.5, color=color_blue_check, fill=color_blue_check)

    # -------------------------------------------------------------
    # 7. BLOC 7 : TYPE DE PATIENT
    # Ligne 1 : y=550.6
    # Ligne 2 : y=571.3
    page.insert_text(fitz.Point(31, 547.5), "Situation clinique stable nécessitant une hospitalisation diagnostique,", fontname=font_regular, fontsize=8.2, color=color_dark)
    page.insert_text(fitz.Point(31, 568.0), "thérapeutique et palliative.", fontname=font_regular, fontsize=8.2, color=color_dark)

    # -------------------------------------------------------------
    # 8. BLOC 8 : PROFESSIONNELS ADRESSEURS
    # Ligne 1 : y=136.9
    page.insert_text(fitz.Point(440, 134.0), "Demande rédigée par le médecin de ville", fontname=font_regular, fontsize=8.5, color=color_dark)

    # -------------------------------------------------------------
    # 9. BLOC 9 : DÉROULEMENT D'UN ACCOMPAGNEMENT
    # Lignes successives du gabarit :
    # y=214.2, y=231.9, y=249.3, y=266.7, y=284.2, y=301.6, y=319.0...
    page.insert_text(fitz.Point(442, 211.5), "• Que peut apporter le service aux patients :", fontname=font_bold, fontsize=8, color=color_navy)
    page.insert_text(fitz.Point(442, 229.0), "Repérage précoce des fragilités (problèmes sociaux) - Information et coordination", fontname=font_regular, fontsize=7.8, color=color_dark)
    page.insert_text(fitz.Point(442, 246.5), "vers différents dispositifs existants (CRT, HTU, CEPPIM, HDJ)", fontname=font_regular, fontsize=7.8, color=color_dark)
    page.insert_text(fitz.Point(442, 264.0), "Établissement d'un projet de soins anticipé si besoin", fontname=font_regular, fontsize=7.8, color=color_dark)
    page.insert_text(fitz.Point(442, 281.5), "[Missions : Repérage précoce, Information, Orientation, Évaluation, Coordination]", fontname=font_regular, fontsize=7.2, color=(0.3, 0.35, 0.45))
    page.insert_text(fitz.Point(442, 299.0), "• Déroulement de la prise en charge étape par étape :", fontname=font_bold, fontsize=8, color=color_navy)
    page.insert_text(fitz.Point(442, 316.5), "cf schéma du flyer de présentation de la cellule qui existe déjà", fontname=font_regular, fontsize=8, color=color_dark)

    # -------------------------------------------------------------
    # 10. BLOC 10 : ACTION SPÉCIFIQUE POUR LES AIDANTS
    # Ligne : y=576.0
    page.insert_text(fitz.Point(462, 573.5), "NON", fontname=font_bold, fontsize=8.5, color=color_dark)

    # -------------------------------------------------------------
    # SAUVEGARDE
    out_pdf = "pdfs/fiche_adnp_geriatrie.pdf"
    doc.save(out_pdf)
    print(f"Saved perfectly aligned PDF: {out_pdf}")

    # Image haute résolution pour l'application et aperçu
    pix = page.get_pixmap(dpi=150)
    out_png = "assets/flyer_adnp.png"
    pix.save(out_png)
    print(f"Saved preview image: {out_png}")

if __name__ == "__main__":
    build_perfect_adnp_flyer()
