import fitz
import os
import shutil

TEMPLATE_PATH = r'C:\Users\alexi\.gemini\antigravity\brain\3353040b-8a4c-4f8e-9e6b-d28798a04378\.user_uploaded\media_1793699849118_24db564a.pdf'
OUTPUT_PDF = r'pdfs/flyer_crt_chits.pdf'
OUTPUT_PNG = r'assets/flyer_crt_chits.png'
ALT_PDF = r'pdfs/fiche_crt_clemenceau.pdf'
ALT_PNG = r'assets/flyer_crt_clemenceau.png'

def add_line_field(page, name, x0, x1, y_line, value="", fontsize=8.5, color=(0.1, 0.12, 0.18)):
    # Rect spanning from y_line - 12.5 to y_line + 1.2 so font baseline sits right on y_line
    rect = fitz.Rect(x0, y_line - 12.5, x1, y_line + 1.2)
    w = fitz.Widget()
    w.rect = rect
    w.field_type = fitz.PDF_WIDGET_TYPE_TEXT
    w.field_name = name
    w.field_value = value
    w.text_fontsize = fontsize
    w.text_color = color
    w.text_font = "helv"
    w.border_width = 0
    w.fill_color = None
    page.add_widget(w)
    w.update()
    return w

def add_cassi_field(page, name, x0, x1, y_line, value="", fontsize=8.0, color=(0.1, 0.12, 0.18)):
    # Specific for CASSI and Partenaires relais below titles
    rect = fitz.Rect(x0, y_line - 7.5, x1, y_line + 1.2)
    w = fitz.Widget()
    w.rect = rect
    w.field_type = fitz.PDF_WIDGET_TYPE_TEXT
    w.field_name = name
    w.field_value = value
    w.text_fontsize = fontsize
    w.text_color = color
    w.text_font = "helv"
    w.border_width = 0
    w.fill_color = None
    page.add_widget(w)
    w.update()
    return w

def add_circle_checkbox(page, name, rect, checked=False):
    w = fitz.Widget()
    w.rect = rect
    w.field_type = fitz.PDF_WIDGET_TYPE_CHECKBOX
    w.field_name = name
    w.field_value = "Yes" if checked else "Off"
    w.button_caption = "4" # Standard checkmark
    w.border_width = 0
    w.fill_color = None
    page.add_widget(w)
    w.update()
    return w

def build():
    doc = fitz.open(TEMPLATE_PATH)
    page = doc[0]

    navy = (0.08, 0.2, 0.45)
    dark = (0.1, 0.12, 0.18)

    # 1. EN-TÊTE
    w_struct = fitz.Widget()
    w_struct.rect = fitz.Rect(42, 106, 395, 126)
    w_struct.field_type = fitz.PDF_WIDGET_TYPE_TEXT
    w_struct.field_name = "Structure"
    w_struct.field_value = "Filière gériatrique du CHITS"
    w_struct.text_fontsize = 11
    w_struct.text_color = navy
    w_struct.text_font = "helv"
    w_struct.border_width = 0
    page.add_widget(w_struct)
    w_struct.update()

    w_serv = fitz.Widget()
    w_serv.rect = fitz.Rect(42, 162, 395, 182)
    w_serv.field_type = fitz.PDF_WIDGET_TYPE_TEXT
    w_serv.field_name = "Nom_service"
    w_serv.field_value = "CRT CLEMENCEAU"
    w_serv.text_fontsize = 11
    w_serv.text_color = navy
    w_serv.text_font = "helv"
    w_serv.border_width = 0
    page.add_widget(w_serv)
    w_serv.update()

    # 2. CONTACT SERVICE
    add_line_field(page, "Contact_Tel", 52, 230, 246.1, "06 83 38 39 39", fontsize=8.5, color=dark)
    add_line_field(page, "Contact_Mail", 52, 230, 264.9, "crt.clemenceau@ch-toulon.fr", fontsize=7.8, color=dark)

    # 3. RÉFÉRENT OPÉRATIONNEL (vide modifiable)
    add_line_field(page, "Referent_Nom", 263, 410, 228.0, "", fontsize=8.5, color=dark)
    add_line_field(page, "Referent_Tel", 263, 410, 246.1, "", fontsize=8.5, color=dark)
    add_line_field(page, "Referent_Mail", 263, 410, 264.9, "", fontsize=8.0, color=dark)

    # 4. SITE INTERNET (vide modifiable)
    add_line_field(page, "Site_Internet", 52, 230, 313.7, "", fontsize=8.0, color=dark)

    # 5. HORAIRES
    add_line_field(page, "Horaires", 264, 410, 313.7, "9h - 16h30 du lundi au vendredi", fontsize=8.5, color=dark)

    # 6. SECTEUR D'INTERVENTION
    add_line_field(page, "Secteur_Ligne1", 27, 225, 388.2, "TOULON 83000 et 83100", fontsize=8.0, color=dark)
    add_line_field(page, "Secteur_Ligne2", 27, 225, 407.8, "LA GARDE 83130", fontsize=8.0, color=dark)
    add_line_field(page, "Secteur_Ligne3", 27, 225, 424.3, "LA VALETTE DU VAR 83100", fontsize=8.0, color=dark)
    add_line_field(page, "Secteur_Ligne4", 27, 225, 443.9, "", fontsize=7.5, color=dark)

    # 7. COMPOSITION ÉQUIPE
    add_line_field(page, "Equipe_Ligne1", 242, 410, 387.4, "IDEC 0.1, Médecin coordonnateur 0.1, AS 0.2", fontsize=7.8, color=dark)
    add_line_field(page, "Equipe_Ligne2", 242, 410, 407.8, "Enseignant APA 0.6, ASG 0.5", fontsize=7.8, color=dark)
    add_line_field(page, "Equipe_Ligne3", 242, 410, 424.0, "Ergothérapeute 0.6, Diététicienne 0.2", fontsize=7.8, color=dark)
    add_line_field(page, "Equipe_Ligne4", 242, 410, 443.6, "", fontsize=8.0, color=dark)

    # 8. PUBLIC : 60 ANS ET + EST COCHÉ
    add_circle_checkbox(page, "Public_60_plus", fitz.Rect(96.0, 479.2, 109.5, 492.4), checked=True)
    add_circle_checkbox(page, "Public_75_plus", fitz.Rect(172.0, 479.2, 185.5, 492.4), checked=False)
    add_circle_checkbox(page, "Public_Autre", fitz.Rect(248.0, 479.2, 261.5, 492.4), checked=False)
    add_line_field(page, "Public_Autre_Precision", 298, 400, 487.7, "", fontsize=8.0, color=dark)

    # 9. TYPE DE PATIENT
    add_line_field(page, "Type_Patient_Ligne1", 31, 405, 550.9, "PA 60 ans et plus, GIR 1 à 4,", fontsize=8.2, color=dark)
    add_line_field(page, "Type_Patient_Ligne2", 31, 405, 571.6, "PA résidant sur le territoire d'intervention.", fontsize=8.2, color=dark)
    add_line_field(page, "Type_Patient_Ligne3", 31, 405, 588.0, "", fontsize=8.2, color=dark)

    # 10. PROFESSIONNELS ADRESSEURS
    add_line_field(page, "Adresseurs_Ligne1", 440, 630, 136.9, "CCAS, CLIC, Professionnels de santé libéraux,", fontsize=7.8, color=dark)
    add_line_field(page, "Adresseurs_Ligne2", 440, 630, 155.0, "Plateforme de répit, SSIAD, DAC VO,", fontsize=7.8, color=dark)
    add_line_field(page, "Adresseurs_Ligne3", 440, 630, 171.1, "SAD Aide et SAD Mixte, Résidence autonomie", fontsize=7.6, color=dark)

    # 11. PARTENAIRES RELAIS HAUT (vides modifiables)
    add_line_field(page, "Partenaires_Haut_Ligne1", 695, 815, 155.5, "", fontsize=8.0, color=dark)
    add_line_field(page, "Partenaires_Haut_Ligne2", 695, 815, 171.1, "", fontsize=8.0, color=dark)

    # 12. DÉROULEMENT ACCOMPAGNEMENT (11 lignes calées pile sur les traits)
    add_line_field(page, "Deroulement_Ligne1", 442, 815, 214.2, "- Missions : Prévention, Repérage précoce, Information, Orientation, Évaluation, Coordination, Accompagnement", fontsize=7.2, color=navy)
    add_line_field(page, "Deroulement_Ligne2", 442, 815, 231.9, "- Déroulement de la prise en charge étape par étape :", fontsize=7.8, color=navy)
    add_line_field(page, "Deroulement_Ligne3", 442, 815, 249.3, "1. Identification d'une situation par un partenaire et transmission d'une fiche d'orientation", fontsize=7.3, color=dark)
    add_line_field(page, "Deroulement_Ligne4", 442, 815, 266.7, "2. Analyse du dossier par l'équipe médico-sociale du CRT", fontsize=7.5, color=dark)
    add_line_field(page, "Deroulement_Ligne5", 442, 815, 284.2, "3. Validation et échanges en réunion partenariale", fontsize=7.5, color=dark)
    add_line_field(page, "Deroulement_Ligne6", 442, 815, 301.6, "4. Organisation d'une VAD par IDEC et un autre membre du CRT", fontsize=7.5, color=dark)
    add_line_field(page, "Deroulement_Ligne7", 442, 815, 319.0, "5. Programmation des bilans (nutrition, mobilité, ergothérapie)", fontsize=7.5, color=dark)
    add_line_field(page, "Deroulement_Ligne8", 442, 815, 336.4, "6. Élaboration du premier projet d'accompagnement personnalisé (PAP)", fontsize=7.5, color=dark)
    add_line_field(page, "Deroulement_Ligne9", 442, 815, 353.9, "7. Mise en place des intervenants en fonction des besoins", fontsize=7.5, color=dark)
    add_line_field(page, "Deroulement_Ligne10", 442, 815, 371.3, "8. Réévaluation régulière et adaptation du PAP", fontsize=7.5, color=dark)
    add_line_field(page, "Deroulement_Ligne11", 442, 815, 388.7, "", fontsize=7.8, color=dark)

    # 13. TAGS CASSI (3 lignes sous le titre "Tags CASSI")
    add_cassi_field(page, "CASSI_Ligne1", 459, 808, 420.4, "", fontsize=8.0, color=dark)
    add_cassi_field(page, "CASSI_Ligne2", 459, 808, 437.8, "", fontsize=8.0, color=dark)
    add_cassi_field(page, "CASSI_Ligne3", 459, 808, 455.2, "", fontsize=8.0, color=dark)

    # 14. PARTENAIRES RELAIS (3 lignes sous le titre "Partenaires relais...")
    add_cassi_field(page, "Partenaires_Relais_Ligne1", 459, 808, 487.7, "", fontsize=8.0, color=dark)
    add_cassi_field(page, "Partenaires_Relais_Ligne2", 459, 808, 505.2, "", fontsize=8.0, color=dark)
    add_cassi_field(page, "Partenaires_Relais_Ligne3", 459, 808, 522.7, "", fontsize=8.0, color=dark)

    # 15. ACTION SPÉCIFIQUE AIDANTS
    add_line_field(page, "Aidants_Action", 462, 808, 576.0, "Temps de répit", fontsize=8.5, color=dark)

    # Sauvegarde
    os.makedirs('pdfs', exist_ok=True)
    os.makedirs('assets', exist_ok=True)
    doc.save(OUTPUT_PDF)
    print(f"Saved perfectly aligned editable PDF to {OUTPUT_PDF}")

    # Dupliquer sous ALT_PDF pour compatibilité
    shutil.copyfile(OUTPUT_PDF, ALT_PDF)
    print(f"Saved copy to {ALT_PDF}")

    # Image de prévisualisation
    pix = page.get_pixmap(dpi=150)
    pix.save(OUTPUT_PNG)
    shutil.copyfile(OUTPUT_PNG, ALT_PNG)
    print(f"Saved preview PNG to {OUTPUT_PNG} and {ALT_PNG}")

if __name__ == '__main__':
    build()
