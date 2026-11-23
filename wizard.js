// ========================================================
// PARCOURS GUIDÉ UTILISATEUR & ASSISTANT D'ORIENTATION
// Navigation interactive le long des 4 besoins (Gauche -> Droite)
// ========================================================

const WIZARD_DATA = {
  // Définition des scénarios décisionnels
  scenarios: [
    {
      id: "domicile",
      icon: "🏠",
      title: "1. Maintien à domicile & Aides",
      badge: "Besoin 3",
      targetBlock: "block-besoin-3",
      stepIndex: 1,
      question: "Quel est le besoin principal de la personne à domicile ?",
      options: [
        {
          label: "Prévention & Bilans de santé",
          desc: "Activité physique, prévention des chutes, dépistage de fragilité",
          next: {
            targetBlock: "block-besoin-3",
            stepIndex: 1,
            question: "Quel type d'action de prévention souhaitez-vous mobiliser ?",
            options: [
              {
                label: "Bilans de prévention & Examens de santé",
                targetCardId: "cpam-prev",
                explanation: "La CPAM propose des bilans complets en centre d'examens de santé et des programmes de repérage."
              },
              {
                label: "Ateliers et sensibilisation locale",
                targetCardId: "cpts-prev",
                explanation: "Les Communautés Professionnelles Territoriales de Santé (CPTS) organisent des ateliers de prévention et bilans au plus près du domicile."
              },
              {
                label: "Repérage précoce de fragilité (Presage, ICOPE)",
                targetCardId: "sad-mixte-rep",
                explanation: "Le SAD mixte utilise des outils innovants (Presage, ICOPE, mini ZARIT) pour anticiper la perte d'autonomie."
              }
            ]
          }
        },
        {
          label: "Informations administratives & Aides financières",
          desc: "Dossiers d'aide sociale, APA, retraite, accès aux droits",
          next: {
            targetBlock: "block-besoin-3",
            stepIndex: 1,
            question: "Quelle démarche souhaitez-vous effectuer ?",
            options: [
              {
                label: "Dossier d'aide sociale ou APA initiale",
                targetCardId: "ccas-social",
                explanation: "Le CCAS vous accompagne pour constituer vos dossiers d'aides sociales et d'accès aux droits communaux."
              },
              {
                label: "Information et orientation gérontologique générale",
                targetCardId: "clic-niv1-info",
                explanation: "Le CLIC (niveau 1) est le guichet d'accueil, d'information générale et d'orientation pour les personnes âgées."
              },
              {
                label: "Accompagnement social départemental",
                targetCardId: "uts-social",
                explanation: "Les Unités Territoriales Sociales (UTS) accompagnent les démarches sociales globales et l'orientation."
              }
            ]
          }
        },
        {
          label: "Mise en place d'aides humaines et de soins à domicile",
          desc: "Auxiliaires de vie, soins infirmiers, portage, soutien quotidien",
          next: {
            targetBlock: "block-besoin-3",
            stepIndex: 1,
            question: "Quelle est la nature du besoin à domicile ?",
            options: [
              {
                label: "Aide ménagère et vie quotidienne (GIR 5-6 ou APA)",
                targetCardId: "sad-aide-maintien",
                explanation: "Le Service Autonomie à Domicile (SAD Aide) déploie des auxiliaires de vie pour l'entretien et l'aide humaine."
              },
              {
                label: "Aide ET Soins coordonnés (SAD mixte)",
                targetCardId: "sad-mixte-maintien",
                explanation: "Le SAD mixte (ex-SPASAD) coordonne sous une même structure l'aide à la vie quotidienne et les soins infirmiers."
              },
              {
                label: "Soins infirmiers / Rééducation libérale",
                targetCardId: "pro-liberaux",
                explanation: "Les professionnels libéraux (infirmiers, kinésithérapeutes, médecins) assurent la continuité des soins à domicile."
              },
              {
                label: "Accompagnement renforcé pour maintien complexe (GIR 1-4)",
                targetCardId: "crt-volet2-maintien",
                explanation: "Le Centre de Ressources Territorial (CRT volet 2) offre un accompagnement renforcé avec équipe pluridisciplinaire et soutien de l'EHPAD porteur."
              }
            ]
          }
        },
        {
          label: "Soutien de l'aidant familial & Solutions de répit",
          desc: "Aidant fatigué, besoin de temps libéré, soutien psychologique",
          targetCardId: "pfr-repit",
          targetBlock: "block-besoin-3",
          stepIndex: 1,
          explanation: "La Plateforme d'Accompagnement et de Répit (PFR) propose écoute psychologique, visites, répit à domicile et orientation vers les accueils de jour."
        }
      ]
    },

    {
      id: "hopital",
      icon: "🏥",
      title: "2. Filière gériatrique hospitalière",
      badge: "Besoin 1",
      targetBlock: "block-besoin-1",
      stepIndex: 2,
      question: "Quelle est la situation médicale hospitalière ?",
      options: [
        {
          label: "Bilan gériatrique / Fragilité sans hospitalisation",
          desc: "Évaluation complète de la personne âgée en ambulatoire",
          next: {
            targetBlock: "block-besoin-1",
            stepIndex: 2,
            question: "Quel type de consultation recherchez-vous ?",
            options: [
              {
                label: "Consultation gériatrique externe",
                targetCardId: "consult-geriatrie",
                explanation: "Consultation avec un médecin gériatre hospitalier pour une évaluation diagnostique et thérapeutique."
              },
              {
                label: "Bilan global en Hôpital de jour (HDJ)",
                targetCardId: "hdj-geriatrique",
                explanation: "L'Hôpital de jour gériatrique permet de réaliser sur une journée l'ensemble des examens pluridisciplinaires."
              },
              {
                label: "Avis d'expert / Télé-expertise téléphonique",
                targetCardId: "hotline-geriatrique",
                explanation: "La Hotline gériatrique permet aux médecins traitants et soignants d'obtenir un avis spécialisé rapide."
              }
            ]
          }
        },
        {
          label: "Troubles neurocognitifs / Maladie d'Alzheimer",
          desc: "Pertes de mémoire, désorientation, troubles du comportement",
          next: {
            targetBlock: "block-besoin-1",
            stepIndex: 2,
            question: "Quelle est l'intensité des troubles observés ?",
            options: [
              {
                label: "Troubles légers débutants ou atypiques",
                targetCardId: "consult-memoire",
                explanation: "La Consultation Mémoire réalise les bilans neuropsychologiques et l'annonce diagnostique."
              },
              {
                label: "Troubles cognitifs aigus et déséquilibrés",
                targetCardId: "urcc",
                explanation: "L'URCC (Unité de Réhabilitation Cognitive et Comportementale) prend en charge les crises comportementales aiguës en milieu sécurisé."
              }
            ]
          }
        },
        {
          label: "Rééducation / Convalescence post-hospitalisation",
          desc: "Récupération de l'autonomie après chirurgie ou infection",
          targetCardId: "smr-geriatrique",
          targetBlock: "block-besoin-1",
          stepIndex: 2,
          explanation: "Les Soins Médicaux et de Réadaptation (SMR gériatriques) permettent la réadaptation motrice et fonctionnelle."
        },
        {
          label: "Urgence médicale / Décompensation aiguë",
          desc: "Chute grave, détresse, urgence non programmée",
          next: {
            targetBlock: "block-besoin-1",
            stepIndex: 2,
            question: "Quel canal d'urgence mobiliser ?",
            options: [
              {
                label: "Admission aux Urgences hospitalières avec filière IGU",
                targetCardId: "urgences-igu",
                explanation: "L'Infirmière de Gériatrie aux Urgences (IGU) assure l'accueil adapté et l'orientation rapide des 75 ans et +."
              },
              {
                label: "Régulation SAS 83 / 15 pour soins non programmés",
                targetCardId: "sas83-osnp",
                explanation: "Le Service d'Accès aux Soins (SAS 83) régule les demandes urgentes vers les médecins de garde et centres de soins."
              }
            ]
          }
        }
      ]
    },

    {
      id: "relais",
      icon: "🤝",
      title: "3. Acteurs relais en ville",
      badge: "Besoin 2",
      targetBlock: "block-besoin-2",
      stepIndex: 3,
      question: "Quel appui spécifique recherchez-vous auprès des acteurs relais en ville ?",
      options: [
        {
          label: "Situation complexe nécessitant une coordination (DAC)",
          desc: "Rupture de parcours, multiplicité d'intervenants, situation bloquée",
          targetCardId: "dac-relais-hosp",
          targetBlock: "block-besoin-2",
          stepIndex: 3,
          explanation: "Le Dispositif d'Appui à la Coordination (DAC) intervient gratuitement pour démêler les situations médico-sociales les plus complexes."
        },
        {
          label: "Hébergement temporaire d'urgence (HTU) en sortie d'hôpital",
          desc: "Retour à domicile temporairement impossible",
          targetCardId: "ehpad-temporaire-urgence",
          targetBlock: "block-besoin-2",
          stepIndex: 3,
          explanation: "L'EHPAD en Hébergement Temporaire d'Urgence (HTU) accueille pour quelques semaines la personne âgée le temps de sécuriser le domicile."
        },
        {
          label: "Accueil de jour pour stimulation et répit",
          desc: "Activités physiques et cognitives en journée, soulagement de l'aidant",
          targetCardId: "ehpad-adj-maintien",
          targetBlock: "block-besoin-2",
          stepIndex: 3,
          explanation: "L'Accueil de jour en EHPAD propose une à plusieurs journées par semaine de stimulation cognitive et lien social."
        },
        {
          label: "Hospitalisation à domicile (HAD)",
          desc: "Soins médicaux et paramédicaux lourds au domicile",
          targetCardId: "had-relais-hosp",
          targetBlock: "block-besoin-2",
          stepIndex: 3,
          explanation: "L'HAD assure à domicile des soins techniques hospitaliers (perfusion, pansements complexes, soins palliatifs)."
        },
        {
          label: "Mesure de protection juridique (Tutelle / Curatelle)",
          desc: "Vulnérabilité, gestion des biens et de la personne",
          targetCardId: "protection-juridique",
          targetBlock: "block-besoin-2",
          stepIndex: 3,
          explanation: "Le Département du Var et le Tribunal Judiciaire instruisent les demandes de sauvegarde de justice, curatelle ou tutelle."
        }
      ]
    },

    {
      id: "etablissement",
      icon: "🏢",
      title: "4. Entrée en établissement",
      badge: "Besoin 4",
      targetBlock: "block-besoin-4",
      stepIndex: 4,
      question: "Quel est le profil de la personne et le type d'établissement recherché ?",
      options: [
        {
          label: "Autonomie préservée (GIR 5-6) - Logement sécurisé",
          desc: "Recherche d'un cadre de vie privatif avec services et convivialité",
          next: {
            targetBlock: "block-besoin-4",
            stepIndex: 4,
            question: "Quelles sont les ressources financières de la personne ?",
            options: [
              {
                label: "Ressources modestes (Besoins services collectifs)",
                targetCardId: "residence-autonomie",
                explanation: "La Résidence Autonomie offre un hébergement accessible aux revenus modestes avec des services d'animation et restauration."
              },
              {
                label: "Ressources suffisantes (Services à la carte)",
                targetCardId: "residence-services-seniors",
                explanation: "La Résidence Services Séniors (RSS) propose des appartements privatifs haut standing avec services hôteliers à la carte."
              }
            ]
          }
        },
        {
          label: "Autonomie réduite (GIR 1-4) - Perte d'autonomie quotidienne",
          desc: "Besoin d'aide pour les actes de la vie courante et surveillance soignante",
          next: {
            targetBlock: "block-besoin-4",
            stepIndex: 4,
            question: "Existe-t-il des particularités ou troubles spécifiques ?",
            options: [
              {
                label: "Hébergement permanent standard en EHPAD",
                targetCardId: "ehpad-permanent",
                explanation: "L'EHPAD assure une prise en charge globale, l'hébergement médicalisé et l'accompagnement quotidien de la dépendance."
              },
              {
                label: "Troubles du comportement modérés (Déambulation, anxiété)",
                targetCardId: "ehpad-pasa",
                explanation: "Le PASA (Pôle d'Activités et de Soins Adaptés) accueille en journée les résidents d'EHPAD pour des ateliers thérapeutiques."
              },
              {
                label: "Troubles sévères du comportement (Agressivité, crise)",
                targetCardId: "ehpad-uhr",
                explanation: "L'UHR (Unité d'Hébergement Renforcée) ou UVP offre un hébergement sécurisé 24h/24 avec personnel formé aux troubles majeurs."
              }
            ]
          }
        },
        {
          label: "Dépendance totale avec soins médicaux continus",
          desc: "Pathologies chroniques lourdes, instabilité clinique permanente",
          targetCardId: "usld-etablissement",
          targetBlock: "block-besoin-4",
          stepIndex: 4,
          explanation: "L'USLD (Unité de Soins de Longue Durée) est adossée à l'hôpital pour les personnes ayant besoin d'une présence médicale continue."
        },
        {
          label: "Personne handicapée vieillissante (PHV)",
          desc: "Vieillissement d'une personne en situation de handicap",
          next: {
            targetBlock: "block-besoin-4",
            stepIndex: 4,
            question: "Quel niveau de médicalisation et âge ?",
            options: [
              {
                label: "PHV 65 ans et + : EHPAD avec places dédiées PHV",
                targetCardId: "ehpad-phv",
                explanation: "Certains EHPAD disposent de places labellisées pour l'accompagnement spécifique des personnes handicapées vieillissantes."
              },
              {
                label: "PHV moins de 60 ans : EAM ou MAS",
                targetCardId: "eam-mas",
                explanation: "L'EAM (Établissement d'Accueil Médicalisé) ou la MAS accueillent les adultes handicapés nécessitant soins et accompagnement éducatif."
              }
            ]
          }
        }
      ]
    }
  ]
};

// État courant du parcours utilisateur
let wizardState = {
  isOpen: false,
  isCollapsed: false,
  currentScenario: null,
  history: [],
  currentQuestionObj: null,
  activeTargetCardId: null,
  activeTargetBlockId: null
};

// Initialisation résiliente au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPathwayWizard);
} else {
  initPathwayWizard();
}

// Exposer globalement pour compatibilité immédiate
window.initPathwayWizard = initPathwayWizard;
window.openWizard = openWizard;
window.closeWizard = closeWizard;
window.toggleWizard = toggleWizard;
window.resetWizard = resetWizard;

function initPathwayWizard() {
  const wizardContainer = document.getElementById('pathway-wizard');
  const toggleBtn = document.getElementById('btn-toggle-wizard');
  const floatBtn = document.getElementById('btn-float-wizard');
  const collapseBtn = document.getElementById('wizard-btn-collapse');
  const closeBtn = document.getElementById('wizard-btn-close');
  const resetBtn = document.getElementById('wizard-btn-reset');

  if (!wizardContainer) return;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => toggleWizard());
  }

  if (floatBtn) {
    floatBtn.addEventListener('click', () => {
      openWizard();
      floatBtn.style.display = 'none';
    });
  }

  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => toggleCollapseWizard());
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeWizard());
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => resetWizard());
  }

  // Clic sur les chevrons de la grande flèche pour sauter directement à une étape
  document.querySelectorAll('.wizard-step').forEach(stepEl => {
    stepEl.addEventListener('click', () => {
      const stepIdx = parseInt(stepEl.dataset.step, 10);
      const scenario = WIZARD_DATA.scenarios[stepIdx - 1];
      if (scenario) {
        startScenario(scenario);
      }
    });
  });

  // Affichage initial de la question d'entrée
  renderInitialQuestion();
}

function openWizard() {
  const wizardContainer = document.getElementById('pathway-wizard');
  const toggleBtn = document.getElementById('btn-toggle-wizard');
  const floatBtn = document.getElementById('btn-float-wizard');

  wizardState.isOpen = true;
  wizardState.isCollapsed = false;
  wizardContainer.classList.add('open');
  wizardContainer.classList.remove('collapsed');

  if (toggleBtn) toggleBtn.classList.add('active');
  if (floatBtn) floatBtn.style.display = 'none';

  if (!wizardState.currentScenario) {
    renderInitialQuestion();
  }
}

function closeWizard() {
  const wizardContainer = document.getElementById('pathway-wizard');
  const toggleBtn = document.getElementById('btn-toggle-wizard');
  const floatBtn = document.getElementById('btn-float-wizard');

  wizardState.isOpen = false;
  wizardContainer.classList.remove('open');
  if (toggleBtn) toggleBtn.classList.remove('active');
  if (floatBtn) floatBtn.style.display = 'flex';

  clearHighlights();
}

function toggleWizard() {
  if (wizardState.isOpen) {
    closeWizard();
  } else {
    openWizard();
  }
}

function toggleCollapseWizard() {
  const wizardContainer = document.getElementById('pathway-wizard');
  const collapseIcon = document.getElementById('wizard-collapse-icon');

  wizardState.isCollapsed = !wizardState.isCollapsed;
  if (wizardState.isCollapsed) {
    wizardContainer.classList.add('collapsed');
    if (collapseIcon) {
      collapseIcon.innerHTML = '<polyline points="18 15 12 9 6 15"/>';
    }
  } else {
    wizardContainer.classList.remove('collapsed');
    if (collapseIcon) {
      collapseIcon.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
    }
  }
}

function resetWizard() {
  wizardState.currentScenario = null;
  wizardState.history = [];
  wizardState.currentQuestionObj = null;
  clearHighlights();
  updateTimelineStep(1);
  renderInitialQuestion();

  // Re-ajustement de vue global
  const fitBtn = document.getElementById('btn-zoom-fit');
  if (fitBtn) fitBtn.click();
}

function renderInitialQuestion() {
  const box = document.getElementById('wizard-question-box');
  if (!box) return;

  updateTimelineStep(1);

  box.innerHTML = `
    <div class="wizard-prompt-row">
      <span class="wizard-step-badge">Point de départ</span>
      <h4 class="wizard-prompt-text">Où commence la situation de la personne âgée ?</h4>
    </div>
    <div class="wizard-options-grid starter-grid">
      ${WIZARD_DATA.scenarios.map(sc => `
        <button class="wizard-option-btn starter-btn" data-scenario-id="${sc.id}">
          <span class="btn-scenario-icon">${sc.icon}</span>
          <div class="btn-scenario-texts">
            <strong>${sc.title}</strong>
            <small>${sc.question}</small>
          </div>
          <span class="btn-arrow">&rarr;</span>
        </button>
      `).join('')}
    </div>
  `;

  box.querySelectorAll('.wizard-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sId = btn.dataset.scenarioId;
      const scenario = WIZARD_DATA.scenarios.find(s => s.id === sId);
      if (scenario) {
        startScenario(scenario);
      }
    });
  });
}

function startScenario(scenario) {
  wizardState.currentScenario = scenario;
  wizardState.history = [];
  clearHighlights();

  // Animation caméra vers le bloc correspondant
  navigateToBlock(scenario.targetBlock);
  updateTimelineStep(scenario.stepIndex);

  renderQuestionLevel({
    question: scenario.question,
    options: scenario.options,
    stepIndex: scenario.stepIndex,
    targetBlock: scenario.targetBlock
  });
}

function renderQuestionLevel(qObj) {
  wizardState.currentQuestionObj = qObj;
  const box = document.getElementById('wizard-question-box');
  if (!box) return;

  updateTimelineStep(qObj.stepIndex);
  if (qObj.targetBlock) {
    navigateToBlock(qObj.targetBlock);
  }

  box.innerHTML = `
    <div class="wizard-prompt-row">
      <span class="wizard-step-badge">Étape ${qObj.stepIndex} sur 4</span>
      <h4 class="wizard-prompt-text">${qObj.question}</h4>
      ${wizardState.history.length > 0 ? `
        <button id="wizard-btn-prev" class="wizard-back-link">
          &larr; Étape précédente
        </button>
      ` : ''}
    </div>
    <div class="wizard-options-grid">
      ${qObj.options.map((opt, i) => `
        <button class="wizard-option-btn" data-opt-idx="${i}">
          <div class="opt-label-group">
            <strong>${opt.label}</strong>
            ${opt.desc ? `<small>${opt.desc}</small>` : ''}
          </div>
          <span class="btn-arrow">&rarr;</span>
        </button>
      `).join('')}
    </div>
  `;

  const prevBtn = document.getElementById('wizard-btn-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (wizardState.history.length > 0) {
        const prev = wizardState.history.pop();
        renderQuestionLevel(prev);
      } else {
        renderInitialQuestion();
      }
    });
  }

  box.querySelectorAll('.wizard-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.optIdx, 10);
      const chosen = qObj.options[idx];
      if (chosen.next) {
        wizardState.history.push(qObj);
        renderQuestionLevel(chosen.next);
      } else if (chosen.targetCardId) {
        showFinalResult(chosen);
      }
    });
  });
}

function showFinalResult(result) {
  const box = document.getElementById('wizard-question-box');
  if (!box) return;

  const cardId = result.targetCardId;
  const blockId = result.targetBlock || (wizardState.currentScenario ? wizardState.currentScenario.targetBlock : 'block-besoin-1');
  const struct = (window.appData && window.appData.structures) ? window.appData.structures.find(s => s.id === cardId) : null;
  const structName = struct ? struct.nom : (result.label || cardId);

  // Mettre en surbrillance la carte et naviguer
  highlightTargetCard(cardId, blockId);

  box.innerHTML = `
    <div class="wizard-result-card">
      <div class="result-badge-row">
        <span class="result-success-badge">Orientation Recommandée</span>
        <span class="result-step-name">${getStepNameByBlock(blockId)}</span>
      </div>
      <div class="result-main-body">
        <div class="result-title-group">
          <h3 class="result-struct-name">${structName}</h3>
          <p class="result-explanation">${result.explanation || "Structure identifiée dans le parcours correspondant aux critères saisis."}</p>
        </div>
        <div class="result-actions">
          ${cardId && cardId.startsWith('crt-') ? `
            <button id="wizard-btn-open-crt-map" class="result-cta-btn" style="background: #1d4ed8;">
              🗺️ Voir la Carte des 5 CRT &amp; Flyers
            </button>
          ` : ''}
          <button id="wizard-btn-open-details" class="result-cta-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Consulter la fiche détaillée &amp; Contacts
          </button>
          <button id="wizard-btn-retry" class="result-sec-btn">
            ↺ Recommencer une orientation
          </button>
        </div>
      </div>
    </div>
  `;

  const crtMapBtn = document.getElementById('wizard-btn-open-crt-map');
  if (crtMapBtn) {
    crtMapBtn.addEventListener('click', () => {
      if (window.openCrtMapModal) window.openCrtMapModal();
    });
  }

  document.getElementById('wizard-btn-open-details').addEventListener('click', () => {
    if (struct && typeof window.openDrawer === 'function') {
      window.openDrawer(struct);
    } else {
      const domCard = document.querySelector(`.sch-card[data-id="${cardId}"]`);
      if (domCard) domCard.click();
    }
  });

  document.getElementById('wizard-btn-retry').addEventListener('click', () => {
    resetWizard();
  });
}

function updateTimelineStep(activeStepNumber) {
  document.querySelectorAll('.wizard-step').forEach(stepEl => {
    const num = parseInt(stepEl.dataset.step, 10);
    stepEl.classList.remove('active', 'completed');
    if (num === activeStepNumber) {
      stepEl.classList.add('active');
    } else if (num < activeStepNumber) {
      stepEl.classList.add('completed');
    }
  });
}

function navigateToBlock(blockId) {
  if (!blockId) return;

  if (window.zoomOnBoard) {
    window.zoomOnBoard(blockId);
    return;
  }

  const blockEl = document.getElementById(blockId);
  const viewport = document.getElementById('poster-viewport');
  if (!blockEl || !viewport) return;

  // Scroll horizontal centré
  blockEl.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'center'
  });
}

function highlightTargetCard(cardId, blockId) {
  clearHighlights();

  const canvas = document.getElementById('poster-canvas');
  if (canvas) canvas.classList.add('canvas-focused-mode');

  const cards = document.querySelectorAll(`.sch-card[data-id="${cardId}"]`);
  if (cards.length > 0) {
    cards.forEach(c => {
      c.classList.add('wizard-highlight');
      // Mettre aussi en évidence la ligne parente si possible
      const parentRow = c.closest('.b2-grid-row, .b1-line-row, .b4-branch-row');
      if (parentRow) parentRow.classList.add('wizard-row-highlight');
    });

    const firstCard = cards[0];
    firstCard.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'center'
    });
  } else if (blockId) {
    navigateToBlock(blockId);
  }
}

function clearHighlights() {
  const canvas = document.getElementById('poster-canvas');
  if (canvas) canvas.classList.remove('canvas-focused-mode');

  document.querySelectorAll('.wizard-highlight').forEach(el => {
    el.classList.remove('wizard-highlight');
  });

  document.querySelectorAll('.wizard-row-highlight').forEach(el => {
    el.classList.remove('wizard-row-highlight');
  });
}

function getStepNameByBlock(blockId) {
  switch (blockId) {
    case 'block-besoin-3': return 'Besoin 3 : Maintien à domicile';
    case 'block-besoin-1': return 'Besoin 1 : Filière gériatrique hospitalière';
    case 'block-besoin-2': return 'Besoin 2 : Acteurs relais en ville';
    case 'block-besoin-4': return 'Besoin 4 : Entrée en établissement';
    default: return 'Parcours Personnes Âgées';
  }
}
