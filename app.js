// Modélisation des Parcours Personnes Âgées - Var 83 / PACA

// Logique interactive du schéma fidèle & Base de données



let appData = {

  besoins: [],

  structures: [],

  criteres_generaux_orientation: []

};



let currentSelectedStructure = null;

let currentZoom = 1;

const MIN_ZOOM = 0.05;

const MAX_ZOOM = 1.6;

let updateZoom = null;
let getFitRatio = null;
let zoomOnBoard = null;
let viewport = null;
let canvas = null;
let zoomLevelLabel = null;



document.addEventListener('DOMContentLoaded', async () => {

  await loadData();

  window.appData = appData;

  window.openDrawer = openDrawer;

  setupZoomAndPan();

  setupCardsClicks();

  setupCollapsibleSystem();
  setupBoardFocusSystem();

  setupSearch();

  setupDrawerAndPdf();

  setupExports();

  setupReperageInteractivity();

});



// 1. Chargement des données avec préchargement instantané

async function loadData() {

  const currentVer = (window.APP_INITIAL_DATA && window.APP_INITIAL_DATA.version) || '2.0';

  const localSaved = localStorage.getItem('modelisation_parcours_pa_data');

  if (localSaved) {

    try {

      const parsed = JSON.parse(localSaved);

      if (parsed && parsed.version === currentVer) {

        appData = parsed;

        console.log('Données chargées depuis le stockage local (v' + currentVer + ').');

        return;

      }

    } catch (e) {

      console.warn('Erreur lecture LocalStorage.', e);

    }

  }



  if (window.APP_INITIAL_DATA && window.APP_INITIAL_DATA.structures) {

    appData = JSON.parse(JSON.stringify(window.APP_INITIAL_DATA));

    saveToLocalStorage();

    return;

  }



  try {

    const res = await fetch('data/structures.json');

    if (res.ok) {

      appData = await res.json();

      saveToLocalStorage();

    }

  } catch (err) {

    console.error('Erreur chargement fetch:', err);

  }

}



function saveToLocalStorage() {

  localStorage.setItem('modelisation_parcours_pa_data', JSON.stringify(appData));

}



// 2. Gestion du Zoom et Déplacement fluide sur le schéma

function setupZoomAndPan() {

  canvas = document.getElementById('poster-canvas');

  viewport = document.getElementById('poster-viewport');

  zoomLevelLabel = document.getElementById('zoom-level');



  updateZoom = function(newZoom) {

    currentZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));

    const cv = canvas || document.getElementById('poster-canvas');
    const lbl = zoomLevelLabel || document.getElementById('zoom-level');
    if (cv) cv.style.transform = 'scale(' + currentZoom + ')';
    if (lbl) lbl.textContent = Math.round(currentZoom * 100) + '%';

    if (typeof syncThematicsAlignment === 'function') {
      syncThematicsAlignment();
    }
    if (typeof alignB3Connectors === 'function') {
      alignB3Connectors();
    }

  };
  window.updateZoom = updateZoom;



  getFitRatio = function() {
    const isSynthetic = document.body.classList.contains('mode-synthetic-view');
    if (isSynthetic) {
      return 0.95; // 95% automatique pour la vue synthétique
    }
    return 0.12; // 12% automatique pour la vue détaillée globale
  };
  window.getFitRatio = getFitRatio;



  document.getElementById('btn-zoom-in').addEventListener('click', () => {

    const step = currentZoom < 0.35 ? 0.02 : 0.05;
    updateZoom(currentZoom + step);

  });



  document.getElementById('btn-zoom-out').addEventListener('click', () => {

    const step = currentZoom < 0.35 ? 0.02 : 0.05;
    updateZoom(currentZoom - step);

  });



  document.getElementById('btn-zoom-fit').addEventListener('click', () => {

    zoomOnBoard('all');

  });



  // Navigation molette (Ctrl = Zoom, Shift = Défilement horizontal)
  viewport.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? (currentZoom < 0.35 ? -0.02 : -0.04) : (currentZoom < 0.35 ? 0.02 : 0.04);
      updateZoom(currentZoom + delta);
    } else if (e.shiftKey) {
      e.preventDefault();
      viewport.scrollLeft += e.deltaY;
    }
  }, { passive: false });



    // Pan / Glisser universel fluide sur tout l'écran (style Miro / Figma)
  let isPointerDown = false;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;
  const dragThreshold = 5;

  viewport.addEventListener('mousedown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.button !== 0 && e.button !== 1) return;

    isPointerDown = true;
    isPanning = false;
    startX = e.pageX;
    startY = e.pageY;
    scrollLeft = viewport.scrollLeft;
    scrollTop = viewport.scrollTop;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPointerDown) return;
    const dx = e.pageX - startX;
    const dy = e.pageY - startY;

    if (!isPanning && (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold)) {
      isPanning = true;
      viewport.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    if (isPanning) {
      e.preventDefault();
      viewport.scrollLeft = scrollLeft - dx;
      viewport.scrollTop = scrollTop - dy;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    document.body.style.userSelect = '';
    viewport.style.cursor = '';
    setTimeout(() => { isPanning = false; }, 30);
  });

  // Empêcher le clic indésirable lors du glisser
  window.addEventListener('click', (e) => {
    if (isPanning) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  // Support touche Espace pour se déplacer facilement sur le poster
  let isSpacePressed = false;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      isSpacePressed = true;
      viewport.style.cursor = 'grab';
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      isSpacePressed = false;
      if (!isPanning) viewport.style.cursor = '';
    }
  });



  // SYSTÈME DE LÉGENDE CONTEXTUELLE DYNAMIQUE PAR PLANCHE
  function updateContextualLegend(boardId) {
    const BOARD_LEGEND_MAP = {
      // 1. Prévention
      'transversal-prevention': ['prev', 'coord'],

      // 2. Repérer
      'transversal-reperage': ['eval', 'trans', 'coord'],

      // 3. Maintien à domicile
      'block-besoin-3': ['prev', 'info', 'aides', 'aides-plans', 'coord', 'soins', 'eval', 'trans'],

      // 4. Offre de soins de la filière gériatrique
      'block-besoin-1': ['geriatrie-amb', 'geriatrie-hosp', 'geriatrie-ssr'],

      // 5. Relais en ville en sortie d'hospitalisation
      'block-besoin-2': ['prev', 'info', 'aides', 'coord', 'soins', 'eval', 'trans'],

      // 6. Entrée en établissement
      'block-besoin-4': ['medico', 'coord', 'trans']
    };

    const allowed = (boardId && boardId !== 'all') ? BOARD_LEGEND_MAP[boardId] : null;

    // 1. Filtrer les pastilles dans tous les bandeaux de légende (top et overlay focus)
    document.querySelectorAll('.persistent-legend-inner .legend-chip[data-category]').forEach(chip => {
      const cat = chip.dataset.category;
      if (!allowed || allowed.includes(cat)) {
        chip.style.display = '';
      } else {
        chip.style.display = 'none';
      }
    });

    // 2. Filtrer les cartes de la fenêtre latérale (#legend-side-window)
    document.querySelectorAll('#legend-side-window .legend-card-item[data-category]').forEach(card => {
      const cat = card.dataset.category;
      if (!allowed || allowed.includes(cat)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    // 3. Titre contextualisé de la fenêtre latérale
    const titleEl = document.getElementById('legend-window-title');
    if (titleEl) {
      const BOARD_NAMES = {
        'transversal-prevention': 'Prévention',
        'transversal-reperage': 'Repérer',
        'block-besoin-3': 'Maintien à domicile',
        'block-besoin-1': 'Filière gériatrique',
        'block-besoin-2': 'Relais en ville',
        'block-besoin-4': 'Entrée en établissement'
      };
      if (boardId && BOARD_NAMES[boardId]) {
        titleEl.textContent = 'Légende — ' + BOARD_NAMES[boardId];
      } else {
        titleEl.textContent = 'Légende';
      }
    }
  }
  window.updateContextualLegend = updateContextualLegend;

  // FONCTION CLÉ : ZOOM CIBLÉ SUR UNE PLANCHE (AVEC CENTRAGE AUTOMATIQUE)

  let currentFocusedBoard = 'all';
  let lastZoomTime = 0;



  function zoomOnBoard(targetId) {

    if (!targetId || targetId === 'all') {

      currentFocusedBoard = 'all';
      updateContextualLegend('all');

      const fit = getFitRatio();

      updateZoom(fit);

      viewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });

      updateNavButtons('all');

      clearBoardHighlight();

      if (typeof syncThematicsAlignment === 'function') {
        syncThematicsAlignment();
        setTimeout(syncThematicsAlignment, 40);
        setTimeout(syncThematicsAlignment, 150);
      }

      return;

    }



    const targetEl = document.getElementById(targetId);

    if (!targetEl) return;



    // Si on zoome sur une planche spécifique, on quitte le mode synthétique et on la déplie

    document.body.classList.remove('mode-synthetic-view');

    if (targetEl.classList.contains('is-collapsed')) {

      toggleBoardCollapse(targetId, false);

    }



    // Toggle : si on reclique sur la même planche déjà ciblée, on revient à la vue d'ensemble
    if (currentFocusedBoard === targetId) {
      const now = Date.now();
      if (now - lastZoomTime < 450) {
        return; // Protection anti-double-clic involontaire
      }
      zoomOnBoard('all');
      return;
    }
    lastZoomTime = Date.now();
    currentFocusedBoard = targetId;
    if (typeof updateContextualLegend === 'function') {
      updateContextualLegend(targetId);
    }



    // 1. Calcul précis des coordonnées non-zoomées de targetEl par rapport au canvas
    const canvasRect = canvas.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const unscaledX = (targetRect.left - canvasRect.left) / currentZoom;
    const unscaledY = (targetRect.top - canvasRect.top) / currentZoom;
    const targetW = targetEl.offsetWidth;
    const targetH = targetEl.offsetHeight;

    const vpW = viewport.clientWidth;
    const vpH = viewport.clientHeight;

    // 2. Calcul du zoom optimal : adaptation à la largeur de l'écran pour éliminer les bords vides
    const padX = 32; // marge horizontale minimale (16px de chaque côté)
    const scaleX = (vpW - padX) / targetW;

    let targetZoom = Math.min(scaleX, 1.0);
    targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));

    // Application du zoom
    updateZoom(targetZoom);

    // 3. Défilement animé pour centrer parfaitement la planche dans l'écran
    setTimeout(() => {
      const scaledX = unscaledX * targetZoom;
      const scaledY = unscaledY * targetZoom;
      const scaledW = targetW * targetZoom;
      const scaledH = targetH * targetZoom;

      let scrollX;
      if (scaledW < vpW) {
        scrollX = scaledX - (vpW - scaledW) / 2;
      } else {
        scrollX = scaledX - 24;
      }

      // Aligné au sommet de la planche avec 16px de marge
      const scrollY = Math.max(0, scaledY - 16);

      viewport.scrollTo({
        left: Math.max(0, Math.round(scrollX)),
        top: Math.max(0, Math.round(scrollY)),
        behavior: 'smooth'
      });



      updateNavButtons(targetId);

      highlightBoard(targetEl);

    }, 60);

  }



  function updateNavButtons(activeTarget) {

    document.querySelectorAll('.nav-planche-btn').forEach(btn => {

      btn.classList.toggle('active', btn.dataset.target === activeTarget);

    });

  }

  // Rendue accessible aux autres parties du code (vue synthétique / détaillée)
  window.updateNavButtons = updateNavButtons;



  function highlightBoard(el) {

    clearBoardHighlight();

    el.classList.add('focused-board-highlight');

    setTimeout(() => {

      el.classList.remove('focused-board-highlight');

    }, 2200);

  }



  function clearBoardHighlight() {

    document.querySelectorAll('.focused-board-highlight').forEach(el => {

      el.classList.remove('focused-board-highlight');

    });

  }



  // Fonction d'ouverture / fermeture de la fenêtre de légende flottante à droite
  function toggleLegendSideWindow(forceState) {
    const windowEl = document.getElementById('legend-side-window');
    const triggerBtn = document.getElementById('float-legend-trigger');
    const navLegendBtn = document.querySelector('.btn-nav-legend');
    if (!windowEl) return;

    const willOpen = typeof forceState === 'boolean' ? forceState : !windowEl.classList.contains('open');
    windowEl.classList.toggle('open', willOpen);
    if (triggerBtn) {
      triggerBtn.classList.toggle('active', willOpen);
      triggerBtn.style.display = willOpen ? 'none' : 'inline-flex';
    }
    if (navLegendBtn) {
      navLegendBtn.classList.toggle('active', willOpen);
    }
  }
  window.toggleLegendSideWindow = toggleLegendSideWindow;

  // Écouteurs pour la fenêtre de légende à droite
  const floatLegendTrigger = document.getElementById('float-legend-trigger');
  if (floatLegendTrigger) {
    floatLegendTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLegendSideWindow();
    });
  }

  const btnCloseLegend = document.getElementById('btn-close-legend-window');
  if (btnCloseLegend) {
    btnCloseLegend.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLegendSideWindow(false);
    });
  }

  // Fermer la légende flottante avec la touche Echap
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const windowEl = document.getElementById('legend-side-window');
      if (windowEl && windowEl.classList.contains('open')) {
        toggleLegendSideWindow(false);
      }
    }
  });

  // Ouverture automatique de la légende au démarrage
  toggleLegendSideWindow(true);

  // Écouteurs sur la barre de boutons de planches (en haut du header)
  document.querySelectorAll('.nav-planche-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = btn.dataset.target;
      if (target === 'pathway-legend') {
        toggleLegendSideWindow();
        return;
      }
      zoomOnBoard(target);
    });
  });

  // Bouton dédié Plein écran dans le toit de chaque planche -> Ouverture en grand écran
  document.querySelectorAll('.btn-roof-focus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.dataset.target;
      if (targetId && typeof openBoardFocus === 'function') {
        if (document.body.classList.contains('board-focus-active') && window.currentFocusedBoard === targetId) {
          closeBoardFocus();
        } else {
          openBoardFocus(targetId);
        }
      }
    });
  });

  // Écouteurs au clic direct sur les toits / titres de chaque planche -> Ouverture en grand écran
  const boardMappings = [
    { el: document.querySelector('#transversal-prevention .roof-arrow-bar'), target: 'transversal-prevention' },
    { el: document.querySelector('#transversal-reperage .roof-arrow-bar'), target: 'transversal-reperage' },
    { el: document.querySelector('#block-besoin-3 .roof-arrow-bar'), target: 'block-besoin-3' },
    { el: document.querySelector('#block-besoin-1 .roof-arrow-bar'), target: 'block-besoin-1' },
    { el: document.querySelector('#block-besoin-2 .roof-arrow-bar'), target: 'block-besoin-2' },
    { el: document.querySelector('#block-besoin-4 .roof-arrow-bar'), target: 'block-besoin-4' }
  ];

  boardMappings.forEach(m => {
    if (m.el) {
      m.el.style.cursor = 'pointer';
      m.el.setAttribute('title', 'Cliquer pour ouvrir cette planche en grand écran');
      m.el.addEventListener('click', (e) => {
        // Ignorer si clic sur cartes intérieures ou bouton replier (Fermer)
        if (e.target.closest('.sch-card') || e.target.closest('.btn-roof-toggle')) return;
        e.stopPropagation();
        if (typeof openBoardFocus === 'function') {
          if (document.body.classList.contains('board-focus-active') && window.currentFocusedBoard === m.target) {
            closeBoardFocus();
          } else {
            openBoardFocus(m.target);
          }
        }
      });
    }
  });



  // Exposer globalement

  window.zoomOnBoard = zoomOnBoard;



  // Ajustement initial selon la taille d'écran

  const initialFit = getFitRatio();

  updateZoom(initialFit);

  if (typeof updateContextualLegend === 'function') {
    updateContextualLegend('all');
  }

}

// Mapping officiel data-id -> Fichier(s) PDF ou carte CRT
// Uniquement les nouveaux flyers présents dans /pdfs
const STRUCTURE_DOC_MAPPING = {
  // 1. Protection Juridique : 2 flyers (ATIAM et UDAF du Var)
  'protection-juridique': [
    { title: 'Association tutélaire — ATIAM', file: 'Association_tutelaire_-_ATIAM.pdf' },
    { title: 'Association tutélaire — UDAF du Var', file: 'Association_tutelaire_-_UDAF_du_Var.pdf' }
  ],

  // 2. CHITS - ADNP
  'adnp': 'CHITS_-_ADNP.pdf',

  // 3. CHITS - Consultation mémoire
  'consult-memoire': 'CHITS_-_Consultation_memoire.pdf',

  // 4. CHITS - Court séjour gériatrique
  'csg-geriatrique': 'CHITS_-_Court_sejour_geriatrique.pdf',
  'csg-med-chir': 'CHITS_-_Court_sejour_geriatrique.pdf',
  'medecine-chirurgie': null, // Pas de flyer pour les services de médecine et chirurgie

  // 5. CHITS - EMPSA
  'empsa': 'CHITS_-_EMPSA.pdf',

  // 6. CHITS - Hotline gériatrique
  'hotline-geriatrique': 'CHITS_-_Hotline_geriatrique.pdf',

  // 7. CHITS - SAS 83
  'sas83-osnp': 'CHITS_-_SAS_83.pdf',

  // 8. CHITS - Service social gériatrie
  'service-social-hosp': 'CHITS_-_Service_social_geriatrie.pdf',

  // 9. CHITS - SMR B-D Clemenceau
  'smr-geriatrique': 'CHITS_-_SMR_B-D_Clemenceau.pdf',

  // 10. CHITS - UMG (Équipe Mobile de Gériatrie Intra)
  'emg-intra': 'CHITS_-_UMG.pdf',

  // 11. CHITS - URCC
  'urcc': 'CHITS_-_URCC.pdf',

  // 12. CHITS - Urgences / IGU
  'urgences-igu': 'CHITS_-_Urgences.pdf',

  // 13. CHITS - USLD Clemenceau
  'usld-hosp': 'CHITS_-_USLD_Clemenceau.pdf',
  'usld-etablissement': 'CHITS_-_USLD_Clemenceau.pdf',

  // 14. CPAM du Var - MISAS (pas de PRADO)
  'cpam-prev': 'CPAM_du_Var_-_MISAS.pdf',
  'cpam-misas': 'CPAM_du_Var_-_MISAS.pdf',
  'prado-cpam': 'CPAM_du_Var_-_MISAS.pdf',

  // 16. Département du Var - Service social APA (uniquement pour Service Social APA, pas pour Instruction APA)
  'service-apa': 'Departement_du_Var_-_Service_social_APA.pdf',
  'service-instruction-apa': null,
  'service-social-apa': 'Departement_du_Var_-_Service_social_APA.pdf',

  // 17. HAD - Cap Domicile
  'had-relais-hosp': 'HAD_-_Cap_Domicile.pdf',

  // 18. HDJ - Fleur de l\'Âge
  'hdj-geriatrique': 'HDJ_-_Fleur_de_l_Age.pdf',

  // 19. SAD mixte (2 flyers : Âge et Vie & CCAS Toulon)
  'sad-mixte-maintien': [
    { title: 'SAD mixte — Âge et Vie', file: 'SAD_mixte_-_Age_et_Vie.pdf' },
    { title: 'SAD mixte — CCAS Toulon', file: 'SAD_mixte_-_CCAS_Toulon.pdf' }
  ],
  'sad-mixte-rep': [
    { title: 'SAD mixte — Âge et Vie', file: 'SAD_mixte_-_Age_et_Vie.pdf' },
    { title: 'SAD mixte — CCAS Toulon', file: 'SAD_mixte_-_CCAS_Toulon.pdf' }
  ],
  'sad-relais-hosp': [
    { title: 'SAD mixte — Âge et Vie', file: 'SAD_mixte_-_Age_et_Vie.pdf' },
    { title: 'SAD mixte — CCAS Toulon', file: 'SAD_mixte_-_CCAS_Toulon.pdf' }
  ],

  // 20. CRT - Carte interactive et flyers officiels
  'crt-prev': 'CRT_MAP',
  'crt-relais-hosp': 'CRT_MAP',
  'crt-volet2': 'CRT_MAP',
  'crt-volet2-maintien': 'CRT_MAP',
  'crt-volet1-maintien': 'CRT_MAP',
  'crt-volet2-relais': 'CRT_MAP',
  'crt-felix-pey': 'CRT_-_Felix_Pey.pdf',
  'crt-mar-vivo': 'CRT_-_Mar_Vivo.pdf',
  'crt-chits': 'CRT_-_Clemenceau.pdf',
  'crt-clemenceau': 'CRT_-_Clemenceau.pdf',

  // 21. CPTS - Carte interactive des CPTS du Var
  'cpts-prev': 'CPTS_MAP',
  'cpts-relais-hosp': 'CPTS_MAP'
};

// Mapping des liens vers l'annuaire régional de santé CASSI (PACA)
// Page générale par défaut : https://annuaire-intelligent.sante-paca.fr/annuaire
const CASSI_DEFAULT_URL = 'https://annuaire-intelligent.sante-paca.fr/annuaire';
const STRUCTURE_CASSI_MAPPING = {
  // HAD (Hospitalisation à Domicile)
  'had-relais-hosp': 'https://annuaire-intelligent.sante-paca.fr/entity/f697d0d8-e4b5-5a87-9337-c5cdae67671e',
  'had': 'https://annuaire-intelligent.sante-paca.fr/entity/f697d0d8-e4b5-5a87-9337-c5cdae67671e'
};
window.STRUCTURE_CASSI_MAPPING = STRUCTURE_CASSI_MAPPING;
window.CASSI_DEFAULT_URL = CASSI_DEFAULT_URL;

// Mapping des flyers / plaquettes d'origine des différentes structures partenaires
// Placer les fichiers dans /assets/flyers_structures/ ou indiquer une URL
const STRUCTURE_ORIGINAL_FLYER_MAPPING = {
  // 1. Admission directe non programmée (ADNP)
  'adnp': 'CHITS - flyer ADNP.pdf',

  // 2. Consultation mémoire
  'consult-memoire': 'CHITS - flyer Consultation memoire.pdf',

  // 3. Court séjour gériatrique (prêt dès dépôt du fichier)
  'csg-geriatrique': 'CHITS - flyer Court sejour geriatrique.pdf',
  'csg-med-chir': 'CHITS - flyer Court sejour geriatrique.pdf'
};
window.STRUCTURE_ORIGINAL_FLYER_MAPPING = STRUCTURE_ORIGINAL_FLYER_MAPPING;

// Fonction universelle d'affichage direct du flyer ou de la carte interactive
function openStructureFlyer(idOrStruct, card) {
  let id = typeof idOrStruct === 'string' ? idOrStruct : (idOrStruct && idOrStruct.id);
  const struct = typeof idOrStruct === 'object' ? idOrStruct : (appData && appData.structures ? appData.structures.find(s => s.id === id) : null);

  if (!card && id) {
    card = document.querySelector(`.sch-card[data-id="${id}"]`);
  }

  // 1. CAS PARTICULIER CRT : ouverture directe de la cartographie interactive du Var
  if ((id && id.startsWith('crt') && !id.startsWith('crt-felix') && !id.startsWith('crt-mar')) || (id && STRUCTURE_DOC_MAPPING[id] === 'CRT_MAP')) {
    if (window.openCrtMapModal) {
      window.openCrtMapModal();
      return;
    }
  }

  // 1b. CAS PARTICULIER CPTS : ouverture directe de la cartographie interactive des CPTS du Var
  if ((id && id.startsWith('cpts')) || (id && STRUCTURE_DOC_MAPPING[id] === 'CPTS_MAP')) {
    if (window.openCptsMapModal) {
      window.openCptsMapModal();
      return;
    }
  }

  // 2. Titre de la structure
  let title = (struct && (struct.nom || struct.sigle)) || '';
  if (!title && card) {
    title = card.querySelector('.card-title')?.textContent.trim() || 
            card.querySelector('.card-sigle')?.textContent.trim() || 
            card.textContent.trim();
  }
  if (!title && id) {
    const sInit = window.APP_INITIAL_DATA && window.APP_INITIAL_DATA.structures ? window.APP_INITIAL_DATA.structures.find(s => s.id === id) : null;
    if (sInit) title = sInit.nom || sInit.sigle;
  }
  if (!title) title = id || 'Structure';
  title = title.replace(/\s+/g, ' ').trim();

  // 3. Récupération du document associé (priorité absolue aux nouveaux flyers déclarés)
  let docEntry = null;
  if (struct && struct.custom_pdf_data) {
    docEntry = struct.custom_pdf_data;
  } else if (id && id in STRUCTURE_DOC_MAPPING) {
    docEntry = STRUCTURE_DOC_MAPPING[id];
  } else if (struct && struct.pdf_filename) {
    docEntry = struct.pdf_filename;
  }

  const modal = document.getElementById('pdf-modal');
  const iframe = document.getElementById('pdf-iframe');
  const img = document.getElementById('pdf-img');
  const titleEl = document.getElementById('pdf-modal-title');
  const newTabBtn = document.getElementById('pdf-modal-newtab');
  const tabsContainer = document.getElementById('pdf-modal-tabs');
  const noFlyerEl = document.getElementById('pdf-no-flyer');

  const getFlyerAssets = (fileOrUrl) => {
    let rawPdfUrl = (fileOrUrl.startsWith('http') || fileOrUrl.startsWith('assets/') || fileOrUrl.startsWith('data:')) ? fileOrUrl : `assets/flyers/${fileOrUrl}`;
    let fileName = fileOrUrl.split('/').pop().replace(/\.pdf$/i, '');
    let cacheKey = Date.now();
    let imgUrl = `assets/flyers/${fileName}.png?v=${cacheKey}`;
    let pdfUrl = `${rawPdfUrl}?v=${cacheKey}`;
    return { pdfUrl, imgUrl, fileName };
  };

  const displayFlyer = (fileOrUrl) => {
    const { pdfUrl, imgUrl, fileName } = getFlyerAssets(fileOrUrl);
    if (iframe) { iframe.style.display = 'none'; iframe.src = ''; }
    if (img) {
      img.src = imgUrl;
      img.style.display = 'block';
    }
    if (newTabBtn) {
      newTabBtn.style.display = 'inline-flex';
      newTabBtn.href = pdfUrl;
    }
  };

  // 4. Configuration des boutons CASSI et Flyer d'origine de la structure
  const cassiBtn = document.getElementById('pdf-modal-cassi');
  const structFlyerBtn = document.getElementById('pdf-modal-structure-flyer');

  const cassiUrl = (struct && struct.cassi_url) || (id && STRUCTURE_CASSI_MAPPING[id]) || (window.CASSI_DEFAULT_URL || 'https://annuaire-intelligent.sante-paca.fr/annuaire');
  if (cassiBtn) {
    cassiBtn.href = cassiUrl;
    cassiBtn.style.display = 'inline-flex';
  }

  const structFlyer = (struct && struct.original_flyer) || (id && STRUCTURE_ORIGINAL_FLYER_MAPPING[id]) || null;
  if (structFlyerBtn) {
    if (structFlyer) {
      let flyerUrl = (structFlyer.startsWith('http') || structFlyer.startsWith('assets/') || structFlyer.startsWith('data:'))
        ? structFlyer
        : `assets/flyers_structures/${encodeURI(structFlyer)}`;
      structFlyerBtn.href = flyerUrl;
      structFlyerBtn.style.display = 'inline-flex';
    } else {
      structFlyerBtn.style.display = 'none';
      structFlyerBtn.href = '#';
    }
  }

  // CAS A : PAS DE FLYER DISPONIBLE POUR LE MOMENT
  if (!docEntry) {
    if (titleEl) titleEl.textContent = `${title} — Mémo DAC`;
    if (newTabBtn) newTabBtn.style.display = 'none';
    if (iframe) { iframe.style.display = 'none'; iframe.src = ''; }
    if (img) { img.style.display = 'none'; img.src = ''; }
    if (tabsContainer) { tabsContainer.style.display = 'none'; tabsContainer.innerHTML = ''; }
    if (noFlyerEl) {
      noFlyerEl.style.display = 'flex';
      if (struct && (struct.description || struct.role)) {
        noFlyerEl.innerHTML = `
          <div class="struct-flyer-card" style="max-width: 680px; width:100%; text-align: left; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); margin: 20px auto;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; border-bottom:2px solid #e2e8f0; padding-bottom:12px;">
              <div style="background:#eff6ff; color:#2563eb; font-weight:800; font-size:1.1rem; padding:8px 14px; border-radius:8px; border:1px solid #bfdbfe;">
                ${struct.sigle || 'STRUCTURE'}
              </div>
              <div>
                <h3 style="margin:0; font-size:1.05rem; font-weight:800; color:#0f172a;">${struct.nom || title}</h3>
                <div style="font-size:0.8rem; color:#64748b; font-weight:600;">${struct.categorie || ''}</div>
              </div>
            </div>
            ${struct.role ? `<div style="margin-bottom:12px;"><strong style="color:#1e293b; font-size:0.85rem;">Rôle / Mission :</strong> <span style="font-size:0.85rem; color:#334155;">${struct.role}</span></div>` : ''}
            ${struct.description ? `<div style="margin-bottom:12px; line-height:1.5;"><strong style="color:#1e293b; font-size:0.85rem;">Description :</strong> <p style="margin:4px 0 0; font-size:0.85rem; color:#475569;">${struct.description}</p></div>` : ''}
            ${struct.public_cible ? `<div style="margin-bottom:10px;"><strong style="color:#1e293b; font-size:0.85rem;">Public cible :</strong> <span style="font-size:0.85rem; color:#475569;">${struct.public_cible}</span></div>` : ''}
            ${struct.criteres ? `<div style="margin-bottom:10px;"><strong style="color:#1e293b; font-size:0.85rem;">Critères d'accès :</strong> <span style="font-size:0.85rem; color:#475569;">${struct.criteres}</span></div>` : ''}
            ${struct.mode_acces ? `<div style="margin-bottom:10px;"><strong style="color:#1e293b; font-size:0.85rem;">Mode d'accès :</strong> <span style="font-size:0.85rem; color:#475569;">${struct.mode_acces}</span></div>` : ''}
            ${struct.contact ? `<div style="margin-top:16px; padding:10px 14px; background:#f8fafc; border-radius:8px; border-left:3px solid #3b82f6; font-size:0.82rem; color:#334155;"><strong>Contact & Territoire :</strong> ${struct.contact}</div>` : ''}
          </div>
        `;
      } else {
        noFlyerEl.innerHTML = `
          <div class="no-flyer-icon">📄</div>
          <h4 class="no-flyer-title" style="margin:8px 0; font-size:1.1rem; color:#0f172a;">Pas de flyer PDF pour le moment</h4>
          <p class="no-flyer-desc" style="color:#64748b; font-size:0.9rem;">Aucun document ou flyer officiel n'est actuellement associé à cette structure (${title}).</p>
        `;
      }
    }
    if (modal) modal.classList.add('open');
    return;
  }

  // CAS B : UN OU PLUSIEURS FLYERS SONT DISPONIBLES
  if (noFlyerEl) noFlyerEl.style.display = 'none';

  // Si plusieurs flyers sont associés (onglets de sélection)
  if (Array.isArray(docEntry)) {
    if (titleEl) titleEl.textContent = `${title} — Mémos DAC`;
    if (tabsContainer) {
      tabsContainer.style.display = 'flex';
      tabsContainer.innerHTML = '';
      docEntry.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = `pdf-tab-btn ${index === 0 ? 'active' : ''}`;
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> ${item.title}`;
        btn.addEventListener('click', () => {
          tabsContainer.querySelectorAll('.pdf-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          displayFlyer(item.file);
        });
        tabsContainer.appendChild(btn);
      });
    }

    displayFlyer(docEntry[0].file);
    if (modal) modal.classList.add('open');
    return;
  }

  // Si c'est un flyer unique
  if (tabsContainer) { tabsContainer.style.display = 'none'; tabsContainer.innerHTML = ''; }
  if (titleEl) titleEl.textContent = `${title} — Mémo DAC`;
  displayFlyer(docEntry);
  if (modal) modal.classList.add('open');
}

window.openStructureFlyer = openStructureFlyer;

// Redirection globale : tout appel à openDrawer affiche directement le flyer

window.openDrawer = openStructureFlyer;



// 3. Clics sur les cartes de structures du schéma : ouverture directe du flyer
function setupCardsClicks() {
  document.querySelectorAll('.sch-card[data-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = card.dataset.id;
      openStructureFlyer(id, card);
    });
  });

  // Sécurité délégation globale : intercepte tout clic sur une carte CPTS ou CRT
  document.addEventListener('click', (e) => {
    const cptsCard = e.target.closest('.sch-card[data-id^="cpts"], .b5-pill[data-id^="cpts"], [data-id^="cpts"]');
    if (cptsCard) {
      e.preventDefault();
      e.stopPropagation();
      if (window.openCptsMapModal) window.openCptsMapModal();
      return;
    }

    const crtCard = e.target.closest('.sch-card[data-id^="crt"], .b5-pill[data-id^="crt"]');
    if (crtCard) {
      const id = crtCard.dataset.id;
      if (!id.startsWith('crt-felix') && !id.startsWith('crt-mar')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.openCrtMapModal) window.openCrtMapModal();
        return;
      }
    }

    // Sécurité délégation globale : toute carte .sch-card cliquée ouvre le flyer/fiche
    const anyCard = e.target.closest('.sch-card');
    if (anyCard && anyCard.dataset && anyCard.dataset.id) {
      e.preventDefault();
      e.stopPropagation();
      openStructureFlyer(anyCard.dataset.id, anyCard);
    }
  });
}



function getBesoinFromCard(card) {

  const block = card.closest('.block-besoin');

  if (block) {

    if (block.id.includes('besoin-3')) return 'besoin-3';

    if (block.id.includes('besoin-1')) return 'besoin-1';

    if (block.id.includes('besoin-2')) return 'besoin-2';

    if (block.id.includes('besoin-4')) return 'besoin-4';

  }

  return 'besoin-1';

}



// 4. Recherche intelligente multi-critères : structures et besoins avec mise en lumière en direct
function setupSearch() {
  const searchInput = document.getElementById('schema-search');
  const countBadge = document.getElementById('search-counter');
  if (!searchInput) return;

  function normalizeText(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/['’]/g, ' ')           // Remplace les apostrophes par des espaces
      .replace(/[^a-z0-9\s]/g, ' ')    // Ne conserve que les caractères alphanumériques
      .replace(/\s+/g, ' ')
      .trim();
  }

  function matches(targetText, normQuery, tokens) {
    if (!targetText || !normQuery) return false;
    const normTarget = normalizeText(targetText);
    if (normTarget.includes(normQuery)) return true;
    if (tokens.length > 0) {
      const words = normTarget.split(' ').filter(w => w.length > 2);
      return tokens.every(tok => {
        if (normTarget.includes(tok)) return true;
        return words.some(w => w.startsWith(tok) || (w.length >= 4 && tok.startsWith(w)));
      });
    }
    return false;
  }

  const handleSearch = () => {
    const rawQuery = searchInput.value || '';
    const normQuery = normalizeText(rawQuery);
    const tokens = normQuery.split(' ').filter(t => t.length > 2);

    const allCards = Array.from(document.querySelectorAll('.sch-card'));
    const allCrits = Array.from(document.querySelectorAll('.b5-crit, .b1-crit, .b4-crit-tag, .b4-crit-box, .b4-crit-card, .rep-p-item'));
    const allSectionBars = Array.from(document.querySelectorAll('.b5-section-bar, .b1-section-bar'));
    const allRows = Array.from(document.querySelectorAll('.b5-row, .b1-row, .b4-branch-row, .b4-lits-row'));

    if (!normQuery) {
      allCards.forEach(c => {
        c.classList.remove('highlight');
        c.style.removeProperty('opacity');
      });
      allCrits.forEach(cr => {
        cr.classList.remove('highlight-besoin');
        cr.style.removeProperty('opacity');
      });
      allSectionBars.forEach(sb => {
        sb.classList.remove('highlight-besoin');
        sb.style.removeProperty('opacity');
      });
      allRows.forEach(r => {
        r.classList.remove('highlight-row');
        r.style.removeProperty('opacity');
      });
      if (countBadge) countBadge.style.display = 'none';
      return;
    }

    const matchedCards = new Set();
    const matchedCrits = new Set();
    const matchedRows = new Set();
    let firstMatchEl = null;

    // 1. Recherche dans les besoins / critères (ex: "perte d'autonomie", "diogène", "isolement", etc.)
    allCrits.forEach(crit => {
      if (matches(crit.textContent, normQuery, tokens)) {
        matchedCrits.add(crit);
        if (!firstMatchEl) firstMatchEl = crit;

        const row = crit.closest('.b5-row, .b1-row, .b4-branch-row, .b4-lits-row');
        if (row) {
          matchedRows.add(row);
          row.querySelectorAll('.sch-card').forEach(c => matchedCards.add(c));
        }
      }
    });

    // 2. Recherche dans les bandeaux thématiques transversaux (ex: "Soins palliatifs", "Addictologie", "Précarité", etc.)
    allSectionBars.forEach(bar => {
      if (matches(bar.textContent, normQuery, tokens)) {
        matchedCrits.add(bar);
        if (!firstMatchEl) firstMatchEl = bar;

        const themeBlock = bar.closest('[class*="-theme-"], .b5-thematics-group, .b1-thematics-group') || bar.parentElement;
        if (themeBlock) {
          themeBlock.querySelectorAll('.b5-row, .b1-row').forEach(r => {
            matchedRows.add(r);
            r.querySelectorAll('.b5-crit, .b1-crit').forEach(cr => matchedCrits.add(cr));
            r.querySelectorAll('.sch-card').forEach(c => matchedCards.add(c));
          });
        }
      }
    });

    // 3. Recherche dans les structures / cartes (nom, fiche descriptive, critères)
    allCards.forEach(card => {
      const cardText = card.textContent;
      const id = card.dataset.id || '';
      const struct = (window.appData && appData.structures) ? appData.structures.find(s => s.id === id) : null;
      const fullText = cardText + ' ' + (struct ? (struct.nom + ' ' + struct.description + ' ' + (struct.criteres || '')) : '');

      if (matches(fullText, normQuery, tokens)) {
        matchedCards.add(card);
        if (!firstMatchEl) firstMatchEl = card;

        const row = card.closest('.b5-row, .b1-row, .b4-branch-row, .b4-lits-row');
        if (row) {
          matchedRows.add(row);
          row.querySelectorAll('.b5-crit, .b1-crit, .b4-crit-tag, .b4-crit-box').forEach(cr => matchedCrits.add(cr));
        }
      }
    });

    // Application visuelle : mise en lumière des besoins et des structures correspondantes
    allCards.forEach(c => {
      if (matchedCards.has(c)) {
        c.classList.add('highlight');
        c.style.opacity = '1';
      } else {
        c.classList.remove('highlight');
        c.style.opacity = '0.28';
      }
    });

    allCrits.forEach(cr => {
      if (matchedCrits.has(cr)) {
        cr.classList.add('highlight-besoin');
        cr.style.opacity = '1';
      } else {
        cr.classList.remove('highlight-besoin');
        cr.style.opacity = '0.35';
      }
    });

    allSectionBars.forEach(sb => {
      if (matchedCrits.has(sb)) {
        sb.classList.add('highlight-besoin');
        sb.style.opacity = '1';
      } else {
        sb.classList.remove('highlight-besoin');
        sb.style.opacity = matchedRows.size > 0 ? '0.5' : '1';
      }
    });

    allRows.forEach(r => {
      if (matchedRows.has(r)) {
        r.classList.add('highlight-row');
        r.style.opacity = '1';
      } else {
        r.classList.remove('highlight-row');
        r.style.opacity = '0.35';
      }
    });

    // Mise à jour du compteur avec précision
    if (countBadge) {
      const cardCount = matchedCards.size;
      const critCount = matchedCrits.size;
      if (cardCount > 0 || critCount > 0) {
        let label = `${cardCount} structure${cardCount > 1 ? 's' : ''}`;
        if (critCount > 0) {
          label += ` • ${critCount} besoin${critCount > 1 ? 's' : ''}`;
        }
        countBadge.textContent = label;
        countBadge.style.display = 'block';
      } else {
        countBadge.textContent = '0 résultat';
        countBadge.style.display = 'block';
      }
    }

    // Déplier la planche si elle est repliée et centrer la vue sur le premier élément
    if (firstMatchEl) {
      const parentBoard = firstMatchEl.closest('.block-besoin, .transversal-block');
      if (parentBoard && parentBoard.classList.contains('is-collapsed') && typeof toggleBoardCollapse === 'function') {
        toggleBoardCollapse(parentBoard.id, false);
      }
      firstMatchEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  };

  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('search', handleSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      handleSearch();
    }
  });
}



// 5. Drawer et Visualiseur PDF

function setupDrawerAndPdf() {

  const drawer = document.getElementById('structure-drawer');

  const closeBtn = document.getElementById('drawer-close');

  const overlay = document.getElementById('drawer-overlay');



  closeBtn.addEventListener('click', () => drawer.classList.remove('open'));

  overlay.addEventListener('click', () => drawer.classList.remove('open'));



  // Modale PDF

  const modal = document.getElementById('pdf-modal');

  const modalClose = document.getElementById('pdf-modal-close');

  const modalOverlay = document.getElementById('pdf-modal-overlay');



  document.getElementById('btn-open-pdf-viewer').addEventListener('click', () => {

    if (!currentSelectedStructure) return;

    const struct = currentSelectedStructure;

    const pdfName = struct.pdf_filename || `fiche_${struct.id}.pdf`;

    const pdfUrl = struct.custom_pdf_data || `assets/flyers/${pdfName}`;



    document.getElementById('pdf-modal-title').textContent = `${struct.nom} - Fiche PDF`;

    document.getElementById('pdf-modal-newtab').href = pdfUrl;

    document.getElementById('pdf-iframe').src = pdfUrl;

    modal.classList.add('open');

  });



    const handleClosePdfModal = () => {
    modal.classList.remove('open');
    const iframe = document.getElementById('pdf-iframe');
    const img = document.getElementById('pdf-img');
    const tabs = document.getElementById('pdf-modal-tabs');
    const noFlyer = document.getElementById('pdf-no-flyer');
    if (iframe) { iframe.src = ''; iframe.style.display = 'none'; }
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (tabs) { tabs.innerHTML = ''; tabs.style.display = 'none'; }
    if (noFlyer) { noFlyer.style.display = 'none'; }
  };
  modalClose.addEventListener('click', handleClosePdfModal);
  modalOverlay.addEventListener('click', handleClosePdfModal);

  // Upload d'un PDF personnalisé pour la structure

  document.getElementById('pdf-file-input').addEventListener('change', (e) => {

    const file = e.target.files[0];

    if (!file || !currentSelectedStructure) return;



    const reader = new FileReader();

    reader.onload = (event) => {

      currentSelectedStructure.custom_pdf_data = event.target.result;

      currentSelectedStructure.pdf_filename = file.name;



      const idx = appData.structures.findIndex(s => s.id === currentSelectedStructure.id);

      if (idx !== -1) {

        appData.structures[idx] = currentSelectedStructure;

      } else {

        appData.structures.push(currentSelectedStructure);

      }

      saveToLocalStorage();

      openDrawer(currentSelectedStructure);

      alert(`Le fichier PDF "${file.name}" a été associé à la structure avec succès !`);

    };

    reader.readAsDataURL(file);

  });

}



function openDrawer(struct) {

  currentSelectedStructure = struct;

  window.openDrawer = openDrawer;

  const drawer = document.getElementById('structure-drawer');



  const besoinMap = {

    'besoin-1': 'Offre de soin de la filière gériatrique',

    'besoin-2': "Relais en ville en sortie d'hospitalisation",

    'besoin-3': 'Maintien à domicile',

    'besoin-4': 'Entrée en établissement'

  };



  const badge = document.getElementById('drawer-besoin-tag');

  badge.textContent = besoinMap[struct.besoin_id] || struct.besoin_id;



  const colors = {

    'besoin-1': { bg: '#dbeafe', color: '#1e40af' },

    'besoin-2': { bg: '#ffedd5', color: '#9a3412' },

    'besoin-3': { bg: '#fef3c7', color: '#92400e' },

    'besoin-4': { bg: '#f1f5f9', color: '#1e293b' }

  };

  const theme = colors[struct.besoin_id] || colors['besoin-1'];

  badge.style.background = theme.bg;

  badge.style.color = theme.color;



  document.getElementById('drawer-title').textContent = struct.nom + (struct.sigle ? ` (${struct.sigle})` : '');

  document.getElementById('drawer-subtitle').textContent = struct.role || struct.categorie || '';



  // Slot bannière pour CRT dans le volet latéral
  const crtSlot = document.getElementById('drawer-crt-banner-slot');
  if (crtSlot) {
    if (struct.id && struct.id.startsWith('crt-')) {
      crtSlot.innerHTML = `
        <div class="crt-banner-trigger" onclick="window.openCrtMapModal && window.openCrtMapModal('${struct.id}')" title="Ouvrir la cartographie interactive des CRT du Var">
          <div class="crt-banner-icon">🗺️</div>
          <div class="crt-banner-text">
            <strong>Carte interactive des CRT du Var &amp; Flyers</strong>
            <span>Cliquez pour explorer la carte territoriale et consulter les plaquettes de chaque CRT</span>
          </div>
          <span class="crt-banner-arrow">&rarr;</span>
        </div>
      `;
    } else {
      crtSlot.innerHTML = '';
    }
  }

  // Slot bannière pour CPTS dans le volet latéral
  const cptsSlot = document.getElementById('drawer-cpts-banner-slot');
  if (cptsSlot) {
    if (struct.id && struct.id.startsWith('cpts-')) {
      cptsSlot.innerHTML = `
        <div class="crt-banner-trigger" onclick="window.openCptsMapModal && window.openCptsMapModal('${struct.id}')" title="Ouvrir la cartographie interactive des CPTS du Var">
          <div class="crt-banner-icon">🗺️</div>
          <div class="crt-banner-text">
            <strong>Carte interactive des CPTS du Var &amp; Flyers</strong>
            <span>Cliquez pour explorer la carte territoriale et consulter les plaquettes de chaque CPTS</span>
          </div>
          <span class="crt-banner-arrow">&rarr;</span>
        </div>
      `;
    } else {
      cptsSlot.innerHTML = '';
    }
  }



  document.getElementById('drawer-desc').textContent = struct.description || 'Description non renseignée.';

  document.getElementById('drawer-public').textContent = struct.public_cible || 'Tout public';

  document.getElementById('drawer-criteres').textContent = struct.criteres || 'Non spécifié';

  document.getElementById('drawer-acces').textContent = struct.mode_acces || 'Orientation directe';

  document.getElementById('drawer-outil').textContent = struct.outil || 'Standard';

  document.getElementById('drawer-contact').textContent = struct.contact || 'Territoire Var 83';



  const pdfName = struct.pdf_filename || `fiche_${struct.id}.pdf`;

  const pdfUrl = struct.custom_pdf_data || `assets/flyers/${pdfName}`;



  document.getElementById('drawer-pdf-filename').textContent = pdfName;

  document.getElementById('btn-open-pdf-tab').href = pdfUrl;

  document.getElementById('btn-download-pdf').href = pdfUrl;

  document.getElementById('btn-download-pdf').setAttribute('download', pdfName);



  drawer.classList.add('open');

}



// 6. Exports CSV et JSON

function setupExports() {

  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);

  document.getElementById('btn-export-json').addEventListener('click', exportJSON);

}



function exportJSON() {

  const jsonStr = JSON.stringify(appData, null, 2);

  const blob = new Blob([jsonStr], { type: 'application/json' });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;

  a.download = `base_donnees_parcours_pa_${new Date().toISOString().split('T')[0]}.json`;

  a.click();

  URL.revokeObjectURL(url);

}



function exportCSV() {

  const headers = ['ID', 'Besoin', 'Catégorie', 'Sigle', 'Nom', 'Rôle', 'Description', 'Public cible', 'Critères', 'Accès', 'Outil', 'Contact', 'PDF'];

  const rows = appData.structures.map(s => [

    s.id,

    s.besoin_id,

    s.categorie || '',

    s.sigle || '',

    s.nom || '',

    s.role || '',

    s.description || '',

    s.public_cible || '',

    s.criteres || '',

    s.mode_acces || '',

    s.outil || '',

    s.contact || '',

    s.pdf_filename || ''

  ]);



  const escapeCSV = (f) => `"${String(f || '').replace(/"/g, '""')}"`;

  let csv = '\uFEFF' + headers.map(escapeCSV).join(';') + '\r\n';

  rows.forEach(r => { csv += r.map(escapeCSV).join(';') + '\r\n'; });



  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;

  a.download = `base_structures_parcours_pa_${new Date().toISOString().split('T')[0]}.csv`;

  a.click();

  URL.revokeObjectURL(url);

}





// Interactivité de la section 1. REPÉRER

function setupReperageInteractivity() {

  const profileCards = document.querySelectorAll('.reperage-profil-card');

  const critCards = {

    'rep-profil-1': document.querySelector('.card-crit-1'),

    'rep-profil-2': document.querySelector('.card-crit-2'),

    'rep-profil-3': document.querySelector('.card-crit-3'),

  };



  profileCards.forEach(card => {

    card.addEventListener('click', () => {

      const isSelected = card.classList.contains('active-profil');

      // Reset all

      profileCards.forEach(c => c.classList.remove('active-profil'));

      Object.values(critCards).forEach(cc => cc && cc.classList.remove('active-crit'));



      if (!isSelected) {

        card.classList.add('active-profil');

        const matchCrit = critCards[card.id];

        if (matchCrit) {

          matchCrit.classList.add('active-crit');

        }

      }

    });

  });

}



  // ========================================================

  // SYSTÈME DE PLANCHES REPLIABLES / DÉPLIABLES (FERMÉ / OUVERT)

  // ========================================================

  const ALL_BOARD_IDS = [

    'transversal-prevention',

    'transversal-reperage',

    'block-besoin-3',

    'block-besoin-1',

    'block-besoin-2',

    'block-besoin-4'

  ];



  function toggleBoardCollapse(boardId, forceState) {

    const el = document.getElementById(boardId);

    if (!el) return;



    const willCollapse = (forceState !== undefined) ? forceState : !el.classList.contains('is-collapsed');



    if (willCollapse) {

      el.classList.add('is-collapsed');

    } else {

      // Dépliement : on repasse en mode détaillé complet pour afficher le contenu à l'aise

      document.body.classList.remove('mode-synthetic-view');

      el.classList.remove('is-collapsed');

    }



    // Mettre à jour le texte du bouton dans le toit

    const toggleBtn = el.querySelector('.btn-roof-toggle');

    if (toggleBtn) {

      const txt = toggleBtn.querySelector('.toggle-text');

      if (txt) txt.textContent = willCollapse ? 'Ouvrir' : 'Fermer';

      toggleBtn.setAttribute('title', willCollapse ? 'Déplier cet encadré' : 'Fermer cet encadré');

    }



    updateGlobalModeButtons();

    if (!willCollapse) {

      setTimeout(alignB4Connectors, 50);

      setTimeout(alignB4Connectors, 250);

      if (typeof alignB3Connectors === 'function') {
        setTimeout(alignB3Connectors, 50);
        setTimeout(alignB3Connectors, 250);
      }

    }

  }



  function collapseAllBoards() {
    document.body.classList.add('mode-synthetic-view');
    ALL_BOARD_IDS.forEach(id => toggleBoardCollapse(id, true));
    updateGlobalModeButtons();

    // Zoom automatique infaillible fixé exactement à 95%
    const applySyntheticZoom = () => {
      currentZoom = 0.95;
      const cv = canvas || document.getElementById('poster-canvas');
      const vp = viewport || document.getElementById('poster-viewport');
      const lbl = zoomLevelLabel || document.getElementById('zoom-level');
      if (cv) cv.style.transform = 'scale(0.95)';
      if (lbl) lbl.textContent = '95%';
      if (vp) vp.scrollTo({ left: 0, top: 0, behavior: 'instant' });
      if (typeof syncThematicsAlignment === 'function') {
        syncThematicsAlignment();
      }
    };

    applySyntheticZoom();
    setTimeout(applySyntheticZoom, 30);
    setTimeout(applySyntheticZoom, 120);

    if (typeof window.updateNavButtons === 'function') window.updateNavButtons('all');
    if (typeof updateContextualLegend === 'function') {
      updateContextualLegend('all');
    }
  }



  function expandAllBoards() {

    document.body.classList.remove('mode-synthetic-view');

    ALL_BOARD_IDS.forEach(id => toggleBoardCollapse(id, false));

    updateGlobalModeButtons();

    // Vue détaillée infaillible fixée exactement à 12%
    currentZoom = 0.12;
    const cv = canvas || document.getElementById('poster-canvas');
    const vp = viewport || document.getElementById('poster-viewport');
    const lbl = zoomLevelLabel || document.getElementById('zoom-level');
    if (cv) cv.style.transform = 'scale(0.12)';
    if (lbl) lbl.textContent = '12%';
    if (vp) vp.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    if (typeof syncThematicsAlignment === 'function') {
      syncThematicsAlignment();
    }
    if (typeof alignB3Connectors === 'function') {
      alignB3Connectors();
    }
    if (typeof window.updateNavButtons === 'function') window.updateNavButtons('all');
    if (typeof updateContextualLegend === 'function') {
      updateContextualLegend('all');
    }

  }



  function updateGlobalModeButtons() {

    const allCollapsed = ALL_BOARD_IDS.every(id => {

      const el = document.getElementById(id);

      return el && el.classList.contains('is-collapsed');

    });

    const allExpanded = ALL_BOARD_IDS.every(id => {

      const el = document.getElementById(id);

      return el && !el.classList.contains('is-collapsed');

    });



    const btnCol = document.getElementById('btn-collapse-all');

    const btnExp = document.getElementById('btn-expand-all');

    if (btnCol) btnCol.classList.toggle('active-mode', allCollapsed);

    if (btnExp) btnExp.classList.toggle('active-mode', allExpanded);

  }



  // Écouteurs pour le système repliable

  function setupCollapsibleSystem() {

    // 1. Bouton "Fermer / Ouvrir" dans chaque toit

    document.querySelectorAll('.btn-roof-toggle').forEach(btn => {

      btn.addEventListener('click', (e) => {

        e.stopPropagation();

        const targetId = btn.dataset.target;

        toggleBoardCollapse(targetId);

      });

    });



    // 2. Clic sur la carte résumé de l'encadré fermé pour l'ouvrir

    document.querySelectorAll('.board-collapsed-summary').forEach(card => {

      card.addEventListener('click', (e) => {

        e.stopPropagation();

        const targetId = card.dataset.target;

        toggleBoardCollapse(targetId, false);

        if (targetId && typeof zoomOnBoard === 'function') {
          setTimeout(() => zoomOnBoard(targetId), 40);
        }

      });

    });



    // 3. Boutons globaux dans la barre de navigation

    const btnCol = document.getElementById('btn-collapse-all');

    if (btnCol) {

      btnCol.addEventListener('click', (e) => {

        e.stopPropagation();

        collapseAllBoards();

      });

    }



    const btnExp = document.getElementById('btn-expand-all');

    if (btnExp) {

      btnExp.addEventListener('click', (e) => {

        e.stopPropagation();

        expandAllBoards();

      });

    }

  }



  window.toggleBoardCollapse = toggleBoardCollapse;

  window.collapseAllBoards = collapseAllBoards;

  window.expandAllBoards = expandAllBoards;





// ========================================================

// ALIGNEMENT DYNAMIQUE PARFAIT DES CONNECTEURS B4

// (Flèches en face des lignes, aucun dépassement)

// ========================================================

function alignB4Connectors() {

  // 1. Fourche entre "Autonomie globalement préservée" et les 2 options

  const autoBlock = document.querySelector('.b4-autonomie-preservée-block');

  if (autoBlock) {

    const tag = autoBlock.querySelector('.b4-crit-tag-auto');

    const topTrack = autoBlock.querySelector('.b4-track-top');

    const botTrack = autoBlock.querySelector('.b4-track-bottom');

    const forkSvg = autoBlock.querySelector('.b4-auto-fork-svg');



    if (tag && topTrack && botTrack && forkSvg) {

      const blockRect = autoBlock.getBoundingClientRect();

      if (blockRect.height > 0) {

        const tagRect = tag.getBoundingClientRect();

        const topRect = topTrack.getBoundingClientRect();

        const botRect = botTrack.getBoundingClientRect();



        const tagMidY = (tagRect.top + tagRect.height / 2) - blockRect.top;

        const topMidY = (topRect.top + topRect.height / 2) - blockRect.top;

        const botMidY = (botRect.top + botRect.height / 2) - blockRect.top;



        forkSvg.setAttribute('viewBox', `0 0 32 ${blockRect.height}`);

        const path = forkSvg.querySelector('path');

        const arrowTop = forkSvg.querySelector('.arrow-top');

        const arrowBot = forkSvg.querySelector('.arrow-bot');



        if (path) {

          path.setAttribute('d', `M0 ${tagMidY.toFixed(1)} H14 M14 ${topMidY.toFixed(1)} V${botMidY.toFixed(1)} M14 ${topMidY.toFixed(1)} H26 M14 ${botMidY.toFixed(1)} H26`);

        }

        if (arrowTop) arrowTop.setAttribute('points', `21,${(topMidY - 4).toFixed(1)} 27,${topMidY.toFixed(1)} 21,${(topMidY + 4).toFixed(1)}`);

        if (arrowBot) arrowBot.setAttribute('points', `21,${(botMidY - 4).toFixed(1)} 27,${botMidY.toFixed(1)} 21,${(botMidY + 4).toFixed(1)}`);

      }

    }

  }



  // 2. Colonne de droite TYPES DE LITS (EHPAD) : embranchement depuis l'EHPAD

  const litsCard = document.querySelector('.b4-lits-slate-card');

  const spineSvg = document.querySelector('.b4-lits-fork-svg');

  const litRows = document.querySelectorAll('.b4-lit-row-unified');

  const ehpadCard = document.querySelector('.card-ehpad-origin-hub');



  if (litsCard && spineSvg && litRows.length >= 2 && ehpadCard) {

    const cardRect = litsCard.getBoundingClientRect();

    if (cardRect.height > 0) {

      const spineRect = spineSvg.getBoundingClientRect();

      const rowTops = Array.from(litRows).map(r => {

        const rect = r.getBoundingClientRect();

        return (rect.top + rect.height / 2) - spineRect.top;

      });



      const ehpadRect = ehpadCard.getBoundingClientRect();

      let ehpadMidY = (ehpadRect.top + ehpadRect.height / 2) - spineRect.top;

      ehpadMidY = Math.max(rowTops[0], Math.min(rowTops[rowTops.length - 1], ehpadMidY));



      const spineH = spineRect.height;

      spineSvg.setAttribute('viewBox', `0 0 28 ${spineH}`);



      const minY = rowTops[0];

      const maxY = rowTops[rowTops.length - 1];



      let d = `M0 ${ehpadMidY.toFixed(1)} H14 M14 ${minY.toFixed(1)} V${maxY.toFixed(1)}`;

      rowTops.forEach(y => {

        d += ` M14 ${y.toFixed(1)} H24`;

      });



      const path = spineSvg.querySelector('path');

      if (path) path.setAttribute('d', d);



      const arrowsGroup = spineSvg.querySelector('.spine-arrows');

      if (arrowsGroup) {

        arrowsGroup.innerHTML = rowTops.map(y => 

          `<polygon points="19,${(y - 4).toFixed(1)} 25,${y.toFixed(1)} 19,${(y + 4).toFixed(1)}" fill="#334155" />`

        ).join('');

      }

    }

  }

}



window.addEventListener('load', () => {

  alignB4Connectors();
  if (typeof alignB3Connectors === 'function') alignB3Connectors();

  setTimeout(alignB4Connectors, 200);
  if (typeof alignB3Connectors === 'function') setTimeout(alignB3Connectors, 200);

  setTimeout(alignB4Connectors, 600);
  if (typeof alignB3Connectors === 'function') setTimeout(alignB3Connectors, 600);

});

window.addEventListener('resize', () => {
  alignB4Connectors();
  if (typeof alignB3Connectors === 'function') alignB3Connectors();
});

// ========================================================
// ALIGNEMENT DYNAMIQUE DES CONNECTEURS ET FLÈCHES B3 (MAINTIEN À DOMICILE)
// (Fidèle à 100% au schéma de parcours Miro)
// ========================================================
function alignB3Connectors() {
  const container = document.getElementById('b5-autonomie-flow-container');
  const svg = document.getElementById('b5-autonomie-flow-svg');
  if (!container || !svg) return;

  const cRect = container.getBoundingClientRect();
  if (cRect.width === 0 || cRect.height === 0) return;

  const scale = (typeof getCanvasScale === 'function' ? getCanvasScale() : 1) || 1;
  const w = cRect.width / scale;
  const h = cRect.height / scale;

  svg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);
  svg.style.width = w + 'px';
  svg.style.height = h + 'px';

  const g = svg.querySelector('.b5-flow-paths');
  if (!g) return;

  const getR = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: (r.left - cRect.left) / scale,
      right: (r.right - cRect.left) / scale,
      top: (r.top - cRect.top) / scale,
      bottom: (r.bottom - cRect.top) / scale,
      width: r.width / scale,
      height: r.height / scale,
      midX: (r.left + r.width / 2 - cRect.left) / scale,
      midY: (r.top + r.height / 2 - cRect.top) / scale
    };
  };

  const critSoc = getR('b5-crit-soc');
  const ccasSoc = getR('b5-card-ccas-soc');
  const cmsSoc = getR('b5-card-cms-soc');
  const critAutoText = getR('b5-crit-autonomie-text');
  const critAuto = getR('b5-crit-autonomie');
  const retPrev = getR('b5-card-retraite-prev');
  const badgeOui = getR('b5-badge-oui');
  const retInfo = getR('b5-card-retraite-info');
  const retRec = getR('b5-card-retraite-reception');
  const ev1 = getR('b5-card-eval-1');
  const ev2 = getR('b5-card-eval-2');
  const pap = getR('b5-card-pap');
  const clicTop = getR('b5-card-clic-top');
  const ardh = getR('b5-card-ardh');

  const bNonCms = getR('b5-badge-non-cms');
  const bNonClic = getR('b5-badge-non-clic');
  const cmsApa = getR('b5-card-cms-apa');
  const clicInfo = getR('b5-card-clic-info');
  const cerfa = getR('b5-badge-cerfa');
  const srvInst = getR('b5-card-service-instruction');
  const clicRec = getR('b5-card-clic-reception');
  const eqMs = getR('b5-card-equipe-ms');
  const clicEv = getR('b5-card-clic-eval');
  const apad = getR('b5-card-apad');
  const rev = getR('b5-badge-revision');
  const apa = getR('b5-card-apa');
  const dacApa = getR('b5-card-dac-apa');
  const ssApa = getR('b5-card-service-social-apa');

  const crtPrev = getR('b5-card-crt-prev');
  const crtInfo = getR('b5-card-crt-info');
  const crtV2 = getR('b5-card-crt-volet2');
  const crtV2Red = getR('b5-card-crt-volet2-red');

  let paths = [];

  // Traçage sans triangle flèche (lignes directes épurées fidèles au schéma)
  const addPath = (d, stroke = '#334155', width = 2) => {
    paths.push(`<path d="${d}" stroke="${stroke}" stroke-width="${width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  };

  // 1. Problématiques sociales -> 2 lignes horizontales : CCAS et CMS
  if (critSoc && ccasSoc) {
    addPath(`M ${critSoc.right.toFixed(1)} ${ccasSoc.midY.toFixed(1)} H ${(ccasSoc.left - 2).toFixed(1)}`);
  }
  if (critSoc && cmsSoc) {
    addPath(`M ${critSoc.right.toFixed(1)} ${cmsSoc.midY.toFixed(1)} H ${(cmsSoc.left - 2).toFixed(1)}`);
  }

  // 2. Perte d'autonomie -> Accolade { vers Retraites et vers APA (CMS / CLIC)
  const autoAnchor = critAutoText || critAuto;
  if (autoAnchor && retPrev && bNonCms && bNonClic) {
    const xStemStart = autoAnchor.right + 2;
    const yTop = retPrev.midY;
    const yBot = bNonClic.midY;
    const yCusp = autoAnchor.midY;
    const r = 5;
    const xSpine = Math.min(xStemStart + 16, bNonCms.left - 18);
    const xCusp = xSpine - r;

    // Tige horizontale issue du texte vers la pointe de l'accolade
    addPath(`M ${xStemStart.toFixed(1)} ${yCusp.toFixed(1)} H ${xCusp.toFixed(1)}`);

    // Accolade { en courbes de Bézier
    const braceD = `M ${(xSpine + r).toFixed(1)} ${yTop.toFixed(1)} ` +
      `Q ${xSpine.toFixed(1)} ${yTop.toFixed(1)}, ${xSpine.toFixed(1)} ${(yTop + r).toFixed(1)} ` +
      `V ${(yCusp - r).toFixed(1)} ` +
      `Q ${xSpine.toFixed(1)} ${yCusp.toFixed(1)}, ${xCusp.toFixed(1)} ${yCusp.toFixed(1)} ` +
      `Q ${xSpine.toFixed(1)} ${yCusp.toFixed(1)}, ${xSpine.toFixed(1)} ${(yCusp + r).toFixed(1)} ` +
      `V ${(yBot - r).toFixed(1)} ` +
      `Q ${xSpine.toFixed(1)} ${yBot.toFixed(1)}, ${(xSpine + r).toFixed(1)} ${yBot.toFixed(1)}`;
    addPath(braceD);

    // Branche supérieure vers Ateliers de prévention
    addPath(`M ${(xSpine + r).toFixed(1)} ${yTop.toFixed(1)} H ${(retPrev.left - 2).toFixed(1)}`);

    // Branche médiane traversant bNonCms vers cmsApa
    const yNonCms = bNonCms.midY;
    addPath(`M ${xSpine.toFixed(1)} ${yNonCms.toFixed(1)} H ${(bNonCms.left - 2).toFixed(1)}`);
    addPath(`M ${bNonCms.right.toFixed(1)} ${yNonCms.toFixed(1)} H ${(cmsApa.left - 2).toFixed(1)}`);

    // Branche inférieure traversant bNonClic vers clicInfo
    addPath(`M ${(xSpine + r).toFixed(1)} ${yBot.toFixed(1)} H ${(bNonClic.left - 2).toFixed(1)}`);
    addPath(`M ${bNonClic.right.toFixed(1)} ${yBot.toFixed(1)} H ${(clicInfo.left - 2).toFixed(1)}`);
  }

  // 3. Retraites flow (Haut)
  if (retPrev && badgeOui && retInfo) {
    addPath(`M ${retPrev.right.toFixed(1)} ${retPrev.midY.toFixed(1)} H ${(badgeOui.left - 2).toFixed(1)}`);
    addPath(`M ${badgeOui.right.toFixed(1)} ${badgeOui.midY.toFixed(1)} H ${(retInfo.left - 2).toFixed(1)}`);
  } else if (retPrev && retInfo) {
    addPath(`M ${retPrev.right.toFixed(1)} ${retPrev.midY.toFixed(1)} H ${(retInfo.left - 2).toFixed(1)}`);
  }
  if (retInfo && ev1) {
    addPath(`M ${retInfo.right.toFixed(1)} ${retInfo.midY.toFixed(1)} H ${(ev1.left - 2).toFixed(1)}`);
  } else {
    if (retInfo && retRec) {
      addPath(`M ${retInfo.right.toFixed(1)} ${retInfo.midY.toFixed(1)} H ${(retRec.left - 2).toFixed(1)}`);
    }
    if (retRec && ev1) {
      addPath(`M ${retRec.right.toFixed(1)} ${retRec.midY.toFixed(1)} H ${(ev1.left - 2).toFixed(1)}`);
    }
  }
  if (ev1 && pap) {
    addPath(`M ${ev1.right.toFixed(1)} ${ev1.midY.toFixed(1)} H ${(pap.left - 2).toFixed(1)}`);
  } else {
    if (ev1 && ev2) {
      addPath(`M ${ev1.right.toFixed(1)} ${ev1.midY.toFixed(1)} H ${(ev2.left - 2).toFixed(1)}`);
    }
    if (ev2 && pap) {
      addPath(`M ${ev2.right.toFixed(1)} ${ev2.midY.toFixed(1)} H ${(pap.left - 2).toFixed(1)}`);
    }
  }
  if (pap && clicTop && ardh) {
    const yLine = pap.midY;
    addPath(`M ${pap.right.toFixed(1)} ${yLine.toFixed(1)} H ${(clicTop.left - 2).toFixed(1)}`);
    addPath(`M ${clicTop.right.toFixed(1)} ${yLine.toFixed(1)} H ${(ardh.left - 2).toFixed(1)}`);
  }

  // 4. Descente Carsat vers Cerfa & CMS vers Service Instruction APAD
  if (retInfo && cerfa) {
    const xDrop = cerfa.midX;
    addPath(`M ${xDrop.toFixed(1)} ${retInfo.bottom.toFixed(1)} V ${(cerfa.top - 2).toFixed(1)}`);
  }
  if (cerfa && srvInst) {
    addPath(`M ${cerfa.midX.toFixed(1)} ${cerfa.bottom.toFixed(1)} V ${(srvInst.top - 2).toFixed(1)}`);
  }
  if (cmsApa && srvInst) {
    addPath(`M ${cmsApa.right.toFixed(1)} ${cmsApa.midY.toFixed(1)} H ${(srvInst.left - 2).toFixed(1)}`);
  }

  // 5. APA green flow (Bas)
  if (srvInst && eqMs) {
    addPath(`M ${srvInst.right.toFixed(1)} ${srvInst.midY.toFixed(1)} H ${(eqMs.left - 2).toFixed(1)}`);
  }
  if (eqMs && apad) {
    addPath(`M ${eqMs.right.toFixed(1)} ${eqMs.midY.toFixed(1)} H ${(apad.left - 2).toFixed(1)}`);
  }

  // Ligne CLIC (Col 3 -> Col 4/5 fusionné -> Révision)
  if (clicInfo && clicRec) {
    addPath(`M ${clicInfo.right.toFixed(1)} ${clicInfo.midY.toFixed(1)} H ${(clicRec.left - 2).toFixed(1)}`);
  }
  if (clicRec && rev) {
    addPath(`M ${clicRec.right.toFixed(1)} ${clicRec.midY.toFixed(1)} H ${(rev.left - 2).toFixed(1)}`);
  } else {
    if (clicRec && clicEv) {
      addPath(`M ${clicRec.right.toFixed(1)} ${clicRec.midY.toFixed(1)} H ${(clicEv.left - 2).toFixed(1)}`);
    }
    if (clicEv && rev) {
      addPath(`M ${clicEv.right.toFixed(1)} ${clicEv.midY.toFixed(1)} H ${(rev.left - 2).toFixed(1)}`);
    }
  }

  // 6. APAD -> APA -> DAC -> Service social APA (ligne parfaitement horizontale continue)
  const yApaLine = apad ? apad.midY : (cmsApa ? cmsApa.midY : 0);
  if (apad && apa) {
    const y = yApaLine || apa.midY;
    addPath(`M ${apad.right.toFixed(1)} ${y.toFixed(1)} H ${(apa.left - 2).toFixed(1)}`);
  }
  if (apa && dacApa && ssApa) {
    const y = yApaLine || apa.midY;
    addPath(`M ${apa.right.toFixed(1)} ${y.toFixed(1)} H ${(dacApa.left - 2).toFixed(1)}`);
    addPath(`M ${dacApa.right.toFixed(1)} ${y.toFixed(1)} H ${(ssApa.left - 2).toFixed(1)}`);
  }

  // 7. CRT Row flow
  if (crtPrev && crtInfo) {
    addPath(`M ${crtPrev.right.toFixed(1)} ${crtPrev.midY.toFixed(1)} H ${(crtInfo.left - 2).toFixed(1)}`);
  }
  if (crtInfo && crtV2) {
    addPath(`M ${crtInfo.right.toFixed(1)} ${crtInfo.midY.toFixed(1)} H ${(crtV2.left - 2).toFixed(1)}`);
  }
  if (crtV2 && crtV2Red) {
    addPath(`M ${crtV2.right.toFixed(1)} ${crtV2.midY.toFixed(1)} H ${(crtV2Red.left - 2).toFixed(1)}`);
  }

  g.innerHTML = paths.join('\n');
}
window.alignB3Connectors = alignB3Connectors;

document.addEventListener('DOMContentLoaded', () => {
  alignB3Connectors();
  setTimeout(alignB3Connectors, 100);
  setTimeout(alignB3Connectors, 300);
  const autonomieContainer = document.getElementById('b5-autonomie-flow-container');
  if (autonomieContainer && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => alignB3Connectors()).observe(autonomieContainer);
  }
});


window.alignB4Connectors = alignB4Connectors;



// ========================================================
// SYSTÈME PLEIN ÉCRAN / MODE FOCUS SUR LES 4 PLANCHES
// Agrandit instantanément une planche en haute définition
// ========================================================
let currentFocusedBoard = null;

function setupBoardFocusSystem() {
  const overlay = document.getElementById('board-focus-overlay');
  if (!overlay) return;

  const wrapper = document.getElementById('bfo-board-wrapper');
  const closeBtn = document.getElementById('bfo-close-btn');
  const backdrop = document.getElementById('bfo-backdrop');
  const scroller = document.getElementById('bfo-content-scroller');
  const titleText = document.getElementById('bfo-title-text');

  const titles = {
    'block-besoin-1': 'OFFRE DE SOINS DE LA FILIÈRE GÉRIATRIQUE',
    'block-besoin-2': 'RELAIS EN VILLE',
    'block-besoin-3': 'MAINTIEN À DOMICILE',
    'block-besoin-4': 'ENTRÉE EN ÉTABLISSEMENT',
    'transversal-prevention': 'PRÉVENTION',
    'transversal-reperage': 'REPÉRER'
  };

  let currentFocusScale = 1.0;
  let savedScrollX = 0;
  let savedScrollY = 0;

  function openBoardFocus(targetId) {
    if (!targetId) return;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    // Si une autre planche est déjà en focus, la restituer
    if (currentFocusedBoard && currentFocusedBoard !== targetId) {
      closeBoardFocus(false);
    }

    // Déplier la planche si elle est repliée
    if (targetEl.classList.contains('is-collapsed')) {
      if (typeof toggleBoardCollapse === 'function') {
        toggleBoardCollapse(targetId, false);
      }
    }

    currentFocusedBoard = targetId;
    window.currentFocusedBoard = targetId;
    currentFocusScale = 1.0;
    if (typeof updateContextualLegend === 'function') {
      updateContextualLegend(targetId);
    }

    // Créer un marqueur placeholder dans le canvas pour conserver l'emplacement
    const placeholder = document.createElement('div');
    placeholder.id = `${targetId}-focus-placeholder`;
    placeholder.className = 'board-focus-placeholder';
    placeholder.style.display = 'none';
    targetEl.parentNode.insertBefore(placeholder, targetEl);

    // Déplacer l'élément réel dans la modale plein écran
    wrapper.innerHTML = '';
    wrapper.appendChild(targetEl);
    targetEl.classList.add('in-focus-mode');

    // Sauvegarder les styles transversaux d'alignement pour pouvoir les restituer fidèlement
    if (targetId === 'block-besoin-1') {
      try {
        const b1Group = targetEl.querySelector('.b1-thematics-group');
        if (b1Group) {
          if (b1Group.style.marginTop) {
            b1Group.dataset.savedMt = b1Group.style.marginTop;
          }
          b1Group.style.removeProperty('margin-top');
          Array.from(b1Group.children).forEach(div => {
            if (div.style.height) div.dataset.savedH = div.style.height;
            if (div.style.minHeight) div.dataset.savedMinH = div.style.minHeight;
            div.style.removeProperty('height');
            div.style.removeProperty('min-height');
          });
        }
      } catch (err) {
        console.warn('Erreur non-bloquante sauvegarde styles B1 focus:', err);
      }
    }

    // Mettre à jour le titre
    if (titleText) {
      titleText.textContent = titles[targetId] || 'VUE DÉTAILLÉE';
    }

    // Mettre à jour les boutons d'onglets
    document.querySelectorAll('.bfo-tab-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.target === targetId);
    });

    // Mémoriser le défilement et geler l'écran à (0, 0) pour empêcher tout décalage
    savedScrollX = window.scrollX || window.pageXOffset || 0;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
    document.documentElement.classList.add('board-focus-active');
    document.body.classList.add('board-focus-active');

    // Afficher la modale
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');

    // Scroller au sommet
    if (scroller) scroller.scrollTop = 0;

    // Ajustement dynamique automatique pour que la planche rentre à 100% dans la page
    fitBoardInFocus(null);
    requestAnimationFrame(() => {
      fitBoardInFocus(null);
    });
    setTimeout(() => {
      fitBoardInFocus(null);
    }, 50);
    setTimeout(() => {
      fitBoardInFocus(null);
    }, 150);

    // Réaligner les connecteurs SVG pour B4 et B3
    if (targetId === 'block-besoin-4') {
      if (typeof alignB4Connectors === 'function') setTimeout(alignB4Connectors, 60);
      if (typeof alignB4EhpadLits === 'function') setTimeout(alignB4EhpadLits, 80);
    }
    if (targetId === 'block-besoin-3') {
      if (typeof alignB3Connectors === 'function') setTimeout(alignB3Connectors, 60);
    }
    // Rétablir la synchronisation transversale exacte de la vue détaillée
    if (typeof syncThematicsAlignment === 'function') {
      setTimeout(syncThematicsAlignment, 100);
    }
  }

  function fitBoardInFocus(customScale = null) {
    if (!currentFocusedBoard) return;
    const targetEl = document.getElementById(currentFocusedBoard);
    if (!targetEl || !scroller || !wrapper) return;

    // Déterminer la largeur naturelle exacte de la planche selon son type
    let naturalW = 1570;
    if (currentFocusedBoard === 'block-besoin-3' || currentFocusedBoard === 'block-besoin-2') {
      naturalW = 1570;
    } else if (currentFocusedBoard === 'block-besoin-1') {
      naturalW = 1480;
    } else if (currentFocusedBoard === 'block-besoin-4') {
      naturalW = 2966;
    } else if (currentFocusedBoard === 'transversal-prevention' || currentFocusedBoard === 'transversal-reperage') {
      naturalW = 4552;
    } else {
      naturalW = targetEl.offsetWidth || targetEl.scrollWidth || 1570;
      naturalW = Math.max(naturalW, targetEl.scrollWidth || 0);
    }

    // Dimensions réelles utilisables dans le conteneur scroller (avec marges de respiration)
    const scrollerW = scroller.clientWidth || window.innerWidth || 1280;
    const scrollerH = scroller.clientHeight || (window.innerHeight - 56) || 720;
    const availableW = Math.max(320, scrollerW - 36);
    const availableH = Math.max(240, scrollerH - 44);

    const naturalH = targetEl.offsetHeight || targetEl.scrollHeight || 1000;

    let scale;
    if (typeof customScale === 'number' && !isNaN(customScale)) {
      scale = Math.min(1.5, Math.max(0.15, customScale));
    } else {
      // Ajustement automatique dézoomé pour embrasser toute la planche confortablement (largeur ET hauteur)
      const scaleW = availableW / naturalW;
      const scaleH = naturalH > 100 ? (availableH / naturalH) : scaleW;
      // On prend le facteur qui permet de voir la planche dans son ensemble sans débordement (ex: ~53%)
      scale = Math.min(scaleW, scaleH);
      if (scale > 1.0) scale = 1.0; // Ne pas grossir au-delà de 100% par défaut
      scale = Math.max(0.15, scale);
    }

    currentFocusScale = scale;

    // Appliquer le facteur d'échelle depuis le coin supérieur gauche
    targetEl.style.transformOrigin = 'top left';
    targetEl.style.transform = `scale(${scale})`;

    // Ajuster les dimensions du wrapper parent pour qu'il épouse exactement la planche à l'échelle
    const scaledW = Math.floor(naturalW * scale);
    const scaledH = Math.ceil(naturalH * scale + 30);

    wrapper.style.width = `${scaledW}px`;
    wrapper.style.minWidth = `${scaledW}px`;
    wrapper.style.maxWidth = `${scaledW}px`;
    wrapper.style.height = `${scaledH}px`;
    wrapper.style.margin = '0 auto';

    // Mettre à jour le texte du bouton d'ajustement
    const zoomLabel = document.getElementById('bfo-zoom-label');
    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    }

    // Réaligner les connecteurs de B4 et B3 si nécessaire
    if (currentFocusedBoard === 'block-besoin-4') {
      if (typeof alignB4Connectors === 'function') setTimeout(alignB4Connectors, 40);
      if (typeof alignB4EhpadLits === 'function') setTimeout(alignB4EhpadLits, 60);
    }
    if (currentFocusedBoard === 'block-besoin-3') {
      if (typeof alignB3Connectors === 'function') setTimeout(alignB3Connectors, 40);
    }
  }

  function closeBoardFocus(removeOverlay = true) {
    if (!currentFocusedBoard) return;
    const targetId = currentFocusedBoard;
    const boardEl = document.getElementById(targetId);
    const placeholder = document.getElementById(`${targetId}-focus-placeholder`);

    if (boardEl) {
      boardEl.classList.remove('in-focus-mode');
      boardEl.style.transform = '';
      boardEl.style.transformOrigin = '';

      // Restaurer immédiatement la marge transversale et les hauteurs transversales de B1
      if (targetId === 'block-besoin-1') {
        try {
          const b1Group = boardEl.querySelector('.b1-thematics-group');
          if (b1Group) {
            if (b1Group.dataset.savedMt) {
              b1Group.style.setProperty('margin-top', b1Group.dataset.savedMt, 'important');
            }
            Array.from(b1Group.children).forEach(div => {
              if (div.dataset.savedH) div.style.setProperty('height', div.dataset.savedH, 'important');
              if (div.dataset.savedMinH) div.style.setProperty('min-height', div.dataset.savedMinH, 'important');
            });
          }
        } catch (err) {
          console.warn('Erreur non-bloquante restauration styles B1 focus:', err);
        }
      }

      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(boardEl, placeholder);
        placeholder.remove();
      } else {
        // Fallback de sécurité absolue : réinsérer à l'emplacement exact d'origine
        if (targetId === 'block-besoin-1') {
          const row = document.querySelector('.b1-b2-row');
          const b2 = document.getElementById('block-besoin-2');
          if (row && b2) row.insertBefore(boardEl, b2);
          else if (row) row.appendChild(boardEl);
        } else if (targetId === 'block-besoin-2') {
          const row = document.querySelector('.b1-b2-row');
          if (row) row.appendChild(boardEl);
        } else if (targetId === 'block-besoin-3') {
          const col = document.querySelector('.parcours-col-left');
          if (col) col.appendChild(boardEl);
        } else if (targetId === 'block-besoin-4') {
          const container = document.getElementById('etablissement-wrapper');
          if (container) container.appendChild(boardEl);
        }
      }
    }

    wrapper.style.height = '';
    wrapper.style.width = '';
    wrapper.style.minWidth = '';
    wrapper.style.maxWidth = '';

    currentFocusedBoard = null;
    window.currentFocusedBoard = null;
    currentFocusScale = 1.0;
    if (typeof updateContextualLegend === 'function') {
      updateContextualLegend('all');
    }

    if (removeOverlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('board-focus-active');
      document.body.classList.remove('board-focus-active');
      window.scrollTo(savedScrollX, savedScrollY);
    }

    if (targetId === 'block-besoin-4') {
      if (typeof alignB4Connectors === 'function') setTimeout(alignB4Connectors, 60);
      if (typeof alignB4EhpadLits === 'function') setTimeout(alignB4EhpadLits, 80);
    }

    // Réaligner systématiquement et instantanément les thématiques sur la vue générale
    if (typeof syncThematicsAlignment === 'function') {
      syncThematicsAlignment();
      setTimeout(syncThematicsAlignment, 40);
      setTimeout(syncThematicsAlignment, 150);
      setTimeout(syncThematicsAlignment, 400);
    }
  }

  window.openBoardFocus = openBoardFocus;
  window.closeBoardFocus = closeBoardFocus;
  window.fitBoardInFocus = fitBoardInFocus;

  // Contrôles de zoom direct
  const zoomInBtn = document.getElementById('bfo-zoom-in');
  const zoomOutBtn = document.getElementById('bfo-zoom-out');
  const zoomFitBtn = document.getElementById('bfo-zoom-fit');

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fitBoardInFocus(currentFocusScale + 0.08);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fitBoardInFocus(currentFocusScale - 0.08);
    });
  }

  if (zoomFitBtn) {
    zoomFitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fitBoardInFocus(null);
    });
  }

  // Clic sur Quitter ou fond sombre
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBoardFocus();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBoardFocus();
    });
  }

  // Touche Échap pour quitter le plein écran et raccourcis zoom
  document.addEventListener('keydown', (e) => {
    if (!currentFocusedBoard) return;
    if (e.key === 'Escape') {
      const pdfModal = document.getElementById('pdf-modal');
      if (pdfModal && pdfModal.classList.contains('open')) {
        pdfModal.classList.remove('open');
        const iframe = document.getElementById('pdf-iframe');
        const img = document.getElementById('pdf-img');
        if (iframe) iframe.src = '';
        if (img) img.src = '';
        e.stopPropagation();
        return;
      }
      const cptsModal = document.getElementById('cpts-simple-modal');
      if (cptsModal && cptsModal.style.display !== 'none') {
        if (window.closeCptsMapModal) window.closeCptsMapModal();
        e.stopPropagation();
        return;
      }
      const crtModal = document.getElementById('crt-simple-modal');
      if (crtModal && crtModal.style.display !== 'none') {
        if (window.closeCrtMapModal) window.closeCrtMapModal();
        e.stopPropagation();
        return;
      }
      const drawer = document.getElementById('structure-drawer');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        e.stopPropagation();
        return;
      }
      closeBoardFocus();
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      fitBoardInFocus(currentFocusScale + 0.08);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      fitBoardInFocus(currentFocusScale - 0.08);
    } else if (e.key === '0') {
      e.preventDefault();
      fitBoardInFocus(null);
    }
  });

  // Ajustement automatique lors du redimensionnement de l'écran en mode focus
  window.addEventListener('resize', () => {
    if (currentFocusedBoard && document.body.classList.contains('board-focus-active')) {
      fitBoardInFocus(null);
    }
  });

  // Navigation par onglets dans le bandeau focus
  document.querySelectorAll('.bfo-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = btn.dataset.target;
      if (target && target !== currentFocusedBoard) {
        openBoardFocus(target);
      }
    });
  });


}

// Alignement dynamique au pixel près de la flèche EHPAD <-> Types de lits
function alignB4EhpadLits() {
  const ehpad = document.querySelector('.card-ehpad-origin-hub');
  const ehpadConn = document.querySelector('.ehpad-connector-out');
  const litsCard = document.querySelector('.b4-lits-slate-card');
  const litsRowsGroup = document.querySelector('.b4-lits-rows-group');
  if (!ehpad || !ehpadConn || !litsCard || !litsRowsGroup) return;

  const ehpadRect = ehpad.getBoundingClientRect();
  if (ehpadRect.width === 0) return; // caché / replié

  const scale = ehpadRect.width / (ehpad.offsetWidth || ehpadRect.width);
  const cardRect = litsCard.getBoundingClientRect();
  const rowsRect = litsRowsGroup.getBoundingClientRect();

  // 1. Aligner verticalement la boîte des lits pour que le centre de b4-lits-rows-group soit en face du centre d'EHPAD
  const ehpadCenterY = ehpadRect.top + ehpadRect.height / 2;
  const rowsCenterY = rowsRect.top + rowsRect.height / 2;
  const deltaY = (ehpadCenterY - rowsCenterY) / scale;
  const currentMarginTop = parseFloat(getComputedStyle(litsCard).marginTop) || 0;
  const newMarginTop = Math.max(10, Math.round(currentMarginTop + deltaY));
  litsCard.style.setProperty('margin-top', newMarginTop + 'px', 'important');

  // 2. Donner au connecteur sortant d'EHPAD la longueur exacte jusqu'au tronc vertical (left - 16px)
  const distX = (rowsRect.left - ehpadRect.right) / scale - 14;
  if (distX > 5) {
    ehpadConn.style.setProperty('flex', `0 0 ${distX}px`, 'important');
    ehpadConn.style.setProperty('width', `${distX}px`, 'important');
    ehpadConn.style.setProperty('margin-right', `-${distX}px`, 'important');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  alignB4EhpadLits();
  setTimeout(alignB4EhpadLits, 150);
  const b4Grid = document.querySelector('.b4-funnel-grid');
  if (b4Grid && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => alignB4EhpadLits()).observe(b4Grid);
  }
});
window.addEventListener('resize', alignB4EhpadLits);


/* ========================================================================== */
/* ALIGNEMENT TRANSVERSAL PARFAIT : THÉMATIQUES B3 (DOMICILE) & B1 (HÔPITAL)   */
/* ========================================================================== */
function getCanvasScale() {
  if (typeof currentZoom === 'number' && currentZoom > 0) {
    return currentZoom;
  }
  const canvas = document.getElementById('poster-canvas');
  if (canvas && canvas.offsetWidth > 0) {
    return canvas.getBoundingClientRect().width / canvas.offsetWidth;
  }
  return 1;
}

function getElementTrueHeight(el) {
  if (!el) return 0;
  let childrenHeight = 0;
  Array.from(el.children).forEach(child => {
    const style = window.getComputedStyle(child);
    const mt = parseFloat(style.marginTop) || 0;
    const mb = parseFloat(style.marginBottom) || 0;
    const h = Math.max(child.offsetHeight, child.scrollHeight);
    childrenHeight += h + mt + mb;
  });
  return Math.max(el.scrollHeight, el.offsetHeight, childrenHeight);
}

function syncThematicsAlignment() {
  // Ne pas modifier les planches quand l'utilisateur est en mode zoom/focus
  if (document.body.classList.contains('board-focus-active')) return;
  const b3 = document.getElementById('block-besoin-3');
  const b1 = document.getElementById('block-besoin-1');
  const b2 = document.getElementById('block-besoin-2');
  if (!b3 || !b1) return;
  if (b3.classList.contains('is-collapsed') || b1.classList.contains('is-collapsed')) return;

  const b5Group = b3.querySelector('.b5-thematics-group');
  const b1Group = b1.querySelector('.b1-thematics-group');
  const b2Group = (b2 && !b2.classList.contains('is-collapsed')) ? b2.querySelector('.b5-thematics-group') : null;
  if (!b5Group || !b1Group) return;

  const themes = ['soinspalliatifs', 'oncogeriatrie', 'precarite', 'handicap', 'addicto', 'psychogeriatrie', 'aidants'];

  // 1. Réinitialisation des styles temporaires pour mesurer les hauteurs naturelles
  themes.forEach(t => {
    const el5 = b5Group.querySelector('.b5-theme-' + t);
    const el1 = b1Group.querySelector('.b1-theme-' + t);
    const el2 = b2Group ? b2Group.querySelector('.b5-theme-' + t) : null;
    if (el5) {
      el5.style.removeProperty('height');
      el5.style.removeProperty('min-height');
      el5.style.removeProperty('max-height');
      el5.style.removeProperty('flex');
    }
    if (el1) {
      el1.style.removeProperty('height');
      el1.style.removeProperty('min-height');
      el1.style.removeProperty('max-height');
      el1.style.removeProperty('flex');
    }
    if (el2) {
      el2.style.removeProperty('height');
      el2.style.removeProperty('min-height');
      el2.style.removeProperty('max-height');
      el2.style.removeProperty('flex');
    }
  });

  // Forcer le reflow du navigateur
  void b5Group.offsetHeight;
  void b1Group.offsetHeight;
  if (b2Group) void b2Group.offsetHeight;

  // 2. Harmonisation hauteur par hauteur pour chaque thématique (max des planches)
  themes.forEach(t => {
    const el5 = b5Group.querySelector('.b5-theme-' + t);
    const el1 = b1Group.querySelector('.b1-theme-' + t);
    const el2 = b2Group ? b2Group.querySelector('.b5-theme-' + t) : null;
    if (el5 && el1) {
      const h5 = getElementTrueHeight(el5);
      const h1 = getElementTrueHeight(el1);
      const h2 = el2 ? getElementTrueHeight(el2) : 0;
      // Au moins 155px pour handicap afin que C360 soit totalement aéré et visible sans chevauchement, et 165px pour précarité (3 lignes)
      const minBase = (t === 'handicap') ? 155 : ((t === 'precarite') ? 165 : 85);
      const maxH = Math.max(h5, h1, h2, minBase);

      el5.style.setProperty('height', maxH + 'px', 'important');
      el5.style.setProperty('min-height', maxH + 'px', 'important');
      el5.style.removeProperty('max-height');

      el1.style.setProperty('height', maxH + 'px', 'important');
      el1.style.setProperty('min-height', maxH + 'px', 'important');
      el1.style.removeProperty('max-height');

      if (el2) {
        el2.style.setProperty('height', maxH + 'px', 'important');
        el2.style.setProperty('min-height', maxH + 'px', 'important');
        el2.style.removeProperty('max-height');
      }
    }
  });

  // Forcer le reflow après l'égalisation des hauteurs
  void b5Group.offsetHeight;
  void b1Group.offsetHeight;
  if (b2Group) void b2Group.offsetHeight;

  // 3. Harmonisation de la hauteur globale des blocs
  const totalMaxH = Math.max(b3.offsetHeight, b1.offsetHeight, b2 ? b2.offsetHeight : 0);
  b1.style.minHeight = totalMaxH + 'px';
  b3.style.minHeight = totalMaxH + 'px';
  if (b2) b2.style.minHeight = totalMaxH + 'px';
  void b1.offsetHeight;
  void b3.offsetHeight;
  if (b2) void b2.offsetHeight;

  // 4. Alignement par boucle de convergence au pixel écran près entre B3, B1 et B2
  const bar5 = b5Group.querySelector('.b5-theme-soinspalliatifs .b5-section-bar');
  const bar1 = b1Group.querySelector('.b1-theme-soinspalliatifs .b1-section-bar');
  const bar2 = b2Group ? b2Group.querySelector('.b5-theme-soinspalliatifs .b5-section-bar') : null;

  if (bar5 && bar1) {
    b5Group.style.removeProperty('margin-top');
    b1Group.style.removeProperty('margin-top');
    if (b2Group) b2Group.style.removeProperty('margin-top');
    void b5Group.offsetHeight;
    void b1Group.offsetHeight;
    if (b2Group) void b2Group.offsetHeight;

    // Boucle de convergence pour aligner les 3 barres de tête au même Y absolu
    for (let pass = 0; pass < 5; pass++) {
      const r5 = bar5.getBoundingClientRect();
      const r1 = bar1.getBoundingClientRect();
      const r2 = bar2 ? bar2.getBoundingClientRect() : null;
      const r2Valid = r2 && r2.height > 0 && r2.top > 0;

      const targetTop = Math.max(r5.top, r1.top, r2Valid ? r2.top : 0);
      const scale = getCanvasScale() || 1;

      const diff1 = targetTop - r1.top;
      const diff5 = targetTop - r5.top;
      const diff2 = r2Valid ? (targetTop - r2.top) : 0;

      if (Math.abs(diff1) < 0.2 && Math.abs(diff5) < 0.2 && (!r2Valid || Math.abs(diff2) < 0.2)) {
        break;
      }

      if (diff1 > 0.2) {
        const curMt1 = parseFloat(b1Group.style.marginTop) || 0;
        b1Group.style.setProperty('margin-top', (curMt1 + diff1 / scale).toFixed(2) + 'px', 'important');
      }
      if (diff5 > 0.2) {
        const curMt5 = parseFloat(b5Group.style.marginTop) || 0;
        b5Group.style.setProperty('margin-top', (curMt5 + diff5 / scale).toFixed(2) + 'px', 'important');
      }
      if (r2Valid && diff2 > 0.2) {
        const curMt2 = parseFloat(b2Group.style.marginTop) || 0;
        b2Group.style.setProperty('margin-top', (curMt2 + diff2 / scale).toFixed(2) + 'px', 'important');
      }

      void b5Group.offsetHeight;
      void b1Group.offsetHeight;
      if (b2Group) void b2Group.offsetHeight;
    }

    // Mémoriser la marge de synchronisation pour les restaurations après focus
    if (b1Group.style.marginTop) b1Group.dataset.savedMt = b1Group.style.marginTop;
    if (b5Group.style.marginTop) b5Group.dataset.savedMt = b5Group.style.marginTop;
    if (b2Group && b2Group.style.marginTop) b2Group.dataset.savedMt = b2Group.style.marginTop;
  }

  // 5. Harmonisation finale de la hauteur globale des blocs après calage des thématiques
  const finalMaxH = Math.max(b3.offsetHeight, b1.offsetHeight, (b2 && !b2.classList.contains('is-collapsed')) ? b2.offsetHeight : 0);
  b1.style.minHeight = finalMaxH + 'px';
  b3.style.minHeight = finalMaxH + 'px';
  if (b2 && !b2.classList.contains('is-collapsed')) b2.style.minHeight = finalMaxH + 'px';

  // 6. Harmonisation de la largeur des blocs transversaux du haut (Prévention et Repérage)
  syncTopBlocksWidth();
}

/**
 * Synchronise la largeur exacte des deux blocs du haut (Prévention & Repérage)
 * pour qu'ils épousent fidèlement et sans dépasser la largeur de la grille des besoins en dessous.
 */
function syncTopBlocksWidth() {
  const prev = document.getElementById('transversal-prevention');
  const rep = document.getElementById('transversal-reperage');
  const legend = document.getElementById('pathway-legend');

  if (document.body.classList.contains('mode-synthetic-view')) {
    if (prev) {
      prev.style.removeProperty('width');
      prev.style.removeProperty('min-width');
      prev.style.removeProperty('max-width');
    }
    if (rep) {
      rep.style.removeProperty('width');
      rep.style.removeProperty('min-width');
      rep.style.removeProperty('max-width');
    }
    if (legend) {
      legend.style.removeProperty('width');
      legend.style.removeProperty('min-width');
      legend.style.removeProperty('max-width');
    }
    return;
  }

  // Largeur rigoureusement identique aux 3 besoins réunis (B3 1570px + B1 1380px + B2 1570px + gaps 32px = 4552px)
  const exactWidth = '4552px';
  [prev, rep].forEach(el => {
    if (el) {
      el.style.setProperty('width', exactWidth, 'important');
      el.style.setProperty('min-width', exactWidth, 'important');
      el.style.setProperty('max-width', exactWidth, 'important');
      el.style.setProperty('box-sizing', 'border-box', 'important');
      el.style.setProperty('margin-left', '0', 'important');
      el.style.setProperty('margin-right', '0', 'important');
    }
  });

  if (legend) {
    legend.style.setProperty('width', exactWidth, 'important');
    legend.style.setProperty('min-width', exactWidth, 'important');
    legend.style.setProperty('max-width', exactWidth, 'important');
    legend.style.setProperty('box-sizing', 'border-box', 'important');
    legend.style.setProperty('margin-left', '0', 'important');
    legend.style.setProperty('margin-right', '0', 'important');
  }
}

// Aliasing pour compatibilité éventuelle
window.alignThematicsWithB3 = syncThematicsAlignment;
window.syncThematicsAlignment = syncThematicsAlignment;
window.syncTopBlocksWidth = syncTopBlocksWidth;

// Observation dynamique de la largeur de la grille principale
if (typeof ResizeObserver !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const mainGrid = document.querySelector('.poster-main-parcours-grid');
    if (mainGrid) {
      const gridRo = new ResizeObserver(() => {
        syncTopBlocksWidth();
      });
      gridRo.observe(mainGrid);
    }
  });
}


// Initialisation au chargement du DOM et de la page
document.addEventListener('DOMContentLoaded', () => {
  syncThematicsAlignment();
  setTimeout(syncThematicsAlignment, 100);
  // Interaction fluide au clic sur les pastilles de légende persistante
  document.querySelectorAll('.legend-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const dot = chip.querySelector('.legend-dot');
      if (!dot) return;
      const dotClass = Array.from(dot.classList).find(c => c.startsWith('dot-'));
      if (!dotClass) return;
      
      const mapping = {
        'dot-prevention': '.sch-card[data-id*="prev"], .b5-pill-prev',
        'dot-info': '.sch-card[data-id="ccas"], .sch-card[data-id="uts"], .sch-card[data-id="clic"], .sch-card[data-id="istf"]',
        'dot-aides': '.sch-card[data-id*="apa"], .sch-card[data-id*="sad"], .sch-card[data-id*="crt"]',
        'dot-aides-plans': '.sch-card.b5-pill-grey, .b5-pill-grey, #b5-badge-revision, #b5-badge-cerfa',
        'dot-filiere': '.b1-pill, .sch-card[data-id*="geriatrie"], .sch-card[data-id*="hdj"], .sch-card[data-id="adnp"]',
        'dot-coord': '.sch-card[data-id="dac"], .sch-card[data-id*="cpts"]',
        'dot-soins': '.sch-card[data-id*="soin"], .sch-card[data-id*="smr"], .sch-card[data-id*="palli"]',
        'dot-medico': '.sch-card[data-id*="ehpad"], .sch-card[data-id*="usld"], .sch-card[data-id*="residence"]',
        'dot-tools': '.sch-card-dark, .b1-pill-dark, #b5-badge-aggir',
        'dot-trans': '.b5-pill-black, .sch-card-dark, .b5-vt-badge'
      };
      
      const sel = mapping[dotClass];
      if (sel) {
        document.querySelectorAll(sel).forEach(el => {
          el.classList.add('focused-board-highlight');
          setTimeout(() => el.classList.remove('focused-board-highlight'), 1800);
        });
      }
    });
  });

  setTimeout(syncThematicsAlignment, 300);
  setTimeout(syncThematicsAlignment, 800);
  if (typeof alignB3Connectors === 'function') {
    alignB3Connectors();
    setTimeout(alignB3Connectors, 100);
    setTimeout(alignB3Connectors, 350);
  }
});

window.addEventListener('load', () => {
  syncThematicsAlignment();
  if (typeof alignB3Connectors === 'function') alignB3Connectors();
  setTimeout(syncThematicsAlignment, 200);
  if (typeof alignB3Connectors === 'function') setTimeout(alignB3Connectors, 200);
  setTimeout(syncThematicsAlignment, 600);
  if (typeof alignB3Connectors === 'function') setTimeout(alignB3Connectors, 600);
});

let thematicResizeTimeout = null;
window.addEventListener('resize', () => {
  if (thematicResizeTimeout) cancelAnimationFrame(thematicResizeTimeout);
  thematicResizeTimeout = requestAnimationFrame(() => {
    syncThematicsAlignment();
    if (typeof alignB3Connectors === 'function') alignB3Connectors();
  });
});

// Écoute des bascules de vue ou repli
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn-roof-toggle') || e.target.closest('.btn-roof-focus') || e.target.closest('#toggle-synthetic-view-btn') || e.target.closest('.header-action-btn')) {
    setTimeout(syncThematicsAlignment, 60);
    setTimeout(syncThematicsAlignment, 350);
    if (typeof alignB3Connectors === 'function') {
      setTimeout(alignB3Connectors, 80);
      setTimeout(alignB3Connectors, 400);
    }
  }
});
