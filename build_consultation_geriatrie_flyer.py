import fitz
import os

TEMPLATE_PATH = r'C:\Users\alexi\.gemini\antigravity\brain\3353040b-8a4c-4f8e-9e6b-d28798a04378\.user_uploaded\media_1793699849118_24db564a.pdf'
OUTPUT_PDF = r'pdfs/fiche_consultation_geriatrie.pdf'
OUTPUT_PNG = r'assets/flyer_consultation_geriatrie.png'

def add_line_field(page, name, x0, x1, y_line, value="", fontsize=8.5, color=(0.1, 0.12, 0.18)):
    # Rect spanning from y_line - 12.5 to y_line + 1.2 so that font baseline sits exactly on y_line
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
    # Specific for CASSI and Partenaires relais to stay strictly on the lines below titles
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
    w_serv.field_value = "Consultations de gériatrie - Ste Musse"
    w_serv.text_fontsize = 10
    w_serv.text_color = navy
    w_serv.text_font = "helv"
    w_serv.border_width = 0
    page.add_widget(w_serv)
    w_serv.update()

    # 2. CONTACT SERVICE
    add_line_field(page, "Contact_Tel", 52, 230, 246.1, "04 94 14 57 72", fontsize=8.5, color=dark)
    add_line_field(page, "Contact_Mail", 52, 230, 264.9, "", fontsize=7.8, color=dark)

    # 3. RÉFÉRENT OPÉRATIONNEL (vide modifiable)
    add_line_field(page, "Referent_Nom", 263, 410, 228.0, "", fontsize=8.5, color=dark)
    add_line_field(page, "Referent_Tel", 263, 410, 246.1, "", fontsize=8.5, color=dark)
    add_line_field(page, "Referent_Mail", 263, 410, 264.9, "", fontsize=8.0, color=dark)

    # 4. SITE INTERNET (vide modifiable)
    add_line_field(page, "Site_Internet", 52, 230, 313.7, "", fontsize=8.0, color=dark)

    # 5. HORAIRES
    add_line_field(page, "Horaires", 264, 410, 313.7, "Mercredi matin", fontsize=8.5, color=dark)

    # 6. SECTEUR D'INTERVENTION
    add_line_field(page, "Secteur_Ligne1", 27, 225, 388.2, "Prise de rendez-vous", fontsize=8.0, color=dark)
    add_line_field(page, "Secteur_Ligne2", 27, 225, 407.8, "", fontsize=7.5, color=dark)
    add_line_field(page, "Secteur_Ligne3", 27, 225, 424.3, "", fontsize=7.5, color=dark)
    add_line_field(page, "Secteur_Ligne4", 27, 225, 443.9, "", fontsize=7.5, color=dark)

    # 7. COMPOSITION ÉQUIPE
    add_line_field(page, "Equipe_Ligne1", 242, 410, 387.4, "Il s'agit d'une consultation : 1 gériatre (Dr AMALBERTI)", fontsize=7.8, color=dark)
    add_line_field(page, "Equipe_Ligne2", 242, 410, 407.8, "+ secrétariat", fontsize=8.0, color=dark)
    add_line_field(page, "Equipe_Ligne3", 242, 410, 424.0, "", fontsize=8.0, color=dark)
    add_line_field(page, "Equipe_Ligne4", 242, 410, 443.6, "", fontsize=8.0, color=dark)

    # 8. PUBLIC : 3 CERCLES DU GABARIT
    add_circle_checkbox(page, "Public_60_plus", fitz.Rect(96.0, 479.2, 109.5, 492.4), checked=False)
    add_circle_checkbox(page, "Public_75_plus", fitz.Rect(172.0, 479.2, 185.5, 492.4), checked=True)
    add_circle_checkbox(page, "Public_Autre", fitz.Rect(248.0, 479.2, 261.5, 492.4), checked=False)
    add_line_field(page, "Public_Autre_Precision", 298, 400, 487.7, "", fontsize=8.0, color=dark)

    # 9. TYPE DE PATIENT
    add_line_field(page, "Type_Patient_Ligne1", 31, 405, 550.9, "Patients âgés présentant une problématique gériatrique -", fontsize=8.2, color=dark)
    add_line_field(page, "Type_Patient_Ligne2", 31, 405, 571.6, "Troubles neurocognitifs -", fontsize=8.2, color=dark)
    add_line_field(page, "Type_Patient_Ligne3", 31, 405, 588.0, "", fontsize=8.2, color=dark)

    # 10. PROFESSIONNELS ADRESSEURS
    add_line_field(page, "Adresseurs_Ligne1", 440, 630, 136.9, "Tous mais seuls les patients ou leur famille peuvent", fontsize=8.2, color=dark)
    add_line_field(page, "Adresseurs_Ligne2", 440, 630, 155.0, "prendre un rendez-vous", fontsize=8.2, color=dark)
    add_line_field(page, "Adresseurs_Ligne3", 440, 630, 171.1, "", fontsize=8.2, color=dark)

    # 11. PARTENAIRES RELAIS (en haut à droite à côté des adresseurs)
    add_line_field(page, "Partenaires_Haut_Ligne1", 695, 815, 155.5, "", fontsize=8.0, color=dark)
    add_line_field(page, "Partenaires_Haut_Ligne2", 695, 815, 171.1, "", fontsize=8.0, color=dark)

    # 12. DÉROULEMENT ACCOMPAGNEMENT (11 lignes calées pile sur les traits)
    add_line_field(page, "Deroulement_Ligne1", 442, 815, 214.2, "- Que peut apporter le service aux patients :", fontsize=8.0, color=navy)
    add_line_field(page, "Deroulement_Ligne2", 442, 815, 231.9, "Prévention, Repérage précoce, Information, Orientation, Évaluation, Accompagnement", fontsize=7.8, color=dark)
    add_line_field(page, "Deroulement_Ligne3", 442, 815, 249.3, "", fontsize=7.8, color=dark)
    add_line_field(page, "Deroulement_Ligne4", 442, 815, 266.7, "- Déroulement de la prise en charge étape par étape :", fontsize=8.0, color=navy)
    add_line_field(page, "Deroulement_Ligne5", 442, 815, 284.2, "- Consultation médicale", fontsize=7.8, color=dark)
    add_line_field(page, "Deroulement_Ligne6", 442, 815, 301.6, "- Suivi annuel ou bisannuel", fontsize=7.8, color=dark)
    add_line_field(page, "Deroulement_Ligne7", 442, 815, 319.0, "", fontsize=7.8, color=dark)
    add_line_field(page, "Deroulement_Ligne8", 442, 815, 336.4, "", fontsize=7.8, color=dark)
    add_line_field(page, "Deroulement_Ligne9", 442, 815, 353.9, "", fontsize=7.8, color=dark)
    add_line_field(page, "Deroulement_Ligne10", 442, 815, 371.3, "", fontsize=7.8, color=dark)
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
    add_line_field(page, "Aidants_Action", 462, 808, 576.0, "Non en dehors d'informations et de conseils", fontsize=8.2, color=dark)

    # Sauvegarde
    os.makedirs('pdfs', exist_ok=True)
    os.makedirs('assets', exist_ok=True)
    doc.save(OUTPUT_PDF)
    print(f"Saved perfectly aligned editable PDF to {OUTPUT_PDF}")

    # Image de prévisualisation
    pix = page.get_pixmap(dpi=150)
    pix.save(OUTPUT_PNG)
    print(f"Saved preview PNG to {OUTPUT_PNG}")

if __name__ == '__main__':
    build()
