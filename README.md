# Modélisation des Parcours Personnes Âgées (PA) - Var 83 / PACA

Ce projet implémente une **grande base de données structurée** et une **application web interactive** reproduisant fidèlement l'organisation et le visuel du schéma de modélisation des parcours pour personnes âgées.

---

## 🎯 Architecture des 4 Besoins Clés

Conformément à la modélisation :

1. **Premier volet (Besoin 3 - Jaune/Ambre) : Structures de la ville pour le maintien à domicile**
   - **Besoins de prévention** : CLIC Niveau 1, Activité Physique Adaptée (AA83), CRT Volet 1, CPTS Prévention, CCAS Prévention, SAD Mixte (Varef - outils Présage, ICOPE, ZARIT), CEPPIM / HTU (Iatrogénie), CPAM (CES, Dépistages).
   - **Lutte contre l'isolement** : Réseau MONALISA.
   - **Soutien des aidants** : Plateforme de Répit (PFR), Maison des Aidants (Département du Var), COS Beauséjour (Relayage / Baluchonnage), Dispositif DATE / ETSP (Accompagnement du deuil).
   - **Besoins informations et aides** : CLIC Niveau 1 (Accueil & orientation), CCAS (Pôle social et dossiers APA/ASH), UTS (Unité Territoriale Sociale), Service APA du Conseil Départemental, Mesures de protection juridique (ISTF, Tutelles).
   - **Mise en place des aides et services** : SAD Mixte (Aide et Soins coordonnés), SAD Aide, Équipe Spécialisée Alzheimer (ESA), CLIC Niveaux 2 et 3, CRT Volet 2 (Accompagnement renforcé alternatif EHPAD), DAC Var Ouest (Coordination complexe), Professionnels libéraux de 1er recours, Accueil de jour en EHPAD.

2. **Deuxième volet (Besoin 1 - Bleu roi) : Filière gériatrique de l'hôpital**
   - **Parcours Programmés** : Consultation de gériatrie, Consultation mémoire (CMRR), Hôpital de Jour Gériatrique (HDJ), Équipes Mobiles de Gériatrie (EMG Intra et Extra / EHPAD), Unité de Réhabilitation Cognitive et Comportementale (URCC / UCC), Soins Palliatifs (EMSP / LISP / USP), Équipe Mobile de Psychiatrie du Sujet Âgé (EMPSA), Court Séjour Gériatrique (CSG), SMR Gériatrique, USLD.
   - **Parcours Non Programmés** : Urgences avec Infirmière Gériatrique d'Urgence (IGU 75+), Admissions Directes Non Programmées (ADNP), Hotline Gériatrique territoriale, SAS 83 / OSNP / SOS Médecins, Régulation SAMU 15.

3. **Troisième volet (Besoin 2 - Corail/Orange) : Structures de la ville, en relai à l'hôpital (Sortie d'hospitalisation)**
   - **Informations et Aides en sortie** : Service social hospitalier, CPAM PRADO (Orthopédie, Insuffisance cardiaque, BPCO...).
   - **Coordination & Accompagnement renforcé** : DAC Var Ouest (Sécurisation des retours complexes, PPC), CPTS (Mobilisation rapide des soignants libéraux MT/IDEL/MK), SAD Aide et Soins (recherche Via Trajectoire SAD), CRT Volet 2 (Alternative EHPAD post-hospit).
   - **Soins et réadaptation à domicile** : Hospitalisation à Domicile (HAD dont ERISP), Équipe Territoriale de Soins Palliatifs (ETSP), SMR post-chirurgical ou post-médical.
   - **Outils d'orientation mis en avant** : Via Trajectoire Sanitaire, Via Trajectoire SAD, CPAM PRADO, DAC, CPTS.

4. **Quatrième volet (Besoin 4 - Gris/Ardoise) : Entrée en établissement quand le maintien à domicile est impossible**
   - **Critères généraux** : Santé & soins, Autonomie & AVQ, Sécurité & environnement, Aidants & entourage, Projet de vie & consentement.
   - **Critères décisifs** : Adéquation structure, faisabilité administrative, faisabilité financière, décision de la personne.
   - **Personnes autonomes (GIR 5-6)** : Résidence Autonomie (Via Trajectoire Grand Âge), Résidence Services Seniors (RSS), Habitat Inclusif / Famille Gouvernante.
   - **Dépendance (GIR 1 à 4)** : EHPAD Hébergement Permanent (HP), EHPAD Hébergement Temporaire et d'Urgence (HT / HTU - formulaire IGU CLIC DAC).
   - **Unités spécialisées EHPAD** : PASA (Troubles modérés en journée), UVP / UHR (Troubles psycho-comportementaux sévères / sécurisé).
   - **Soins médicaux constants** : Unité de Soins de Longue Durée (USLD).
   - **Filière Personnes Handicapées Vieillissantes (PHV)** : Foyer de vie / Foyer d'hébergement, Établissement d'Accueil Médicalisé (EAM / FAM), Maison d'Accueil Spécialisée (MAS), EHPAD Section PHV / Dispositif Pass'âge APFH, Handiconsult 83 / AVISO (Soins somatiques adaptés).

---

## 🚀 Démarrage rapide

1. **Double-cliquez sur `Lancer_Application.bat`**  
   Le serveur local se lance automatiquement et ouvre votre navigateur sur `http://localhost:8000`.

2. **Fonctionnalités disponibles :**
   - **Schéma panoramique interactif** : Visualisez les 4 grands besoins côte à côte.
   - **Clic sur une structure** : Ouvre un volet détaillé complet avec toutes les missions, critères d'orientation, mode d'accès, outils et contacts.
   - **Visualiseur PDF & Téléchargement** : Consultez la fiche PDF de la structure en 1 clic dans le lecteur intégré.
   - **Personnalisation de vos PDF** : Vous pouvez glisser-déposer ou associer votre propre document PDF officiel pour n'importe quelle structure !
   - **Recherche instantanée** : Tapez un mot-clé (ex: *Alzheimer*, *PASA*, *Urgences*, *Aidant*, *DAC*, *75 ans*...).
   - **Filtres de profil** : Filtrez en 1 clic pour PA 60+, PA 75+, Proches aidants, Situations complexes ou PHV.
   - **Bascule Vue Fiches / Grille** : Pour consulter l'ensemble des 37+ structures sous forme de catalogue.
   - **Ajout & Modification** : Formulaire pour enrichir ou adapter la base de données.
   - **Exports professionnels** :
     - **Export CSV (Excel)** : Fichier tabulé compatible direct Excel (séparateur point-virgule et encodage UTF-8 avec accents préservés).
     - **Export JSON** : Sauvegarde complète de la base.

---

## 📂 Contenu du dossier

- `index.html` : Interface principale de l'application.
- `styles.css` : Feuilles de style avec code couleur officiel fidèle au schéma.
- `app.js` : Logique applicative, gestion des filtres, modales, PDF et exports.
- `data/structures.json` : Base de données exhaustive structurée.
- `pdfs/` : Répertoire contenant les fiches PDF de chaque structure (62 fiches générées).
- `generate_pdfs.py` : Script Python autonome pour régénérer l'ensemble des PDF.
- `Lancer_Application.bat` : Lanceur 1-clic pour Windows.
