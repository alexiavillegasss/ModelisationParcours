// ========================================================
// ÉTAPES DU PRIOCA
// Ajoute les visuels des étapes du PRIOCA aux endroits du schéma où elles
// correspondent :
//  - au-dessus des colonnes des planches (Prévention → « 2 Agir en prévention »…)
//  - sur la planche Repérer (étape 1) et l'Entrée en établissement (étape 4)
//  - sur les bandeaux « Aidants » (étape 10)
//  - en frise complète sous la carte de la vue synthétique
//  - sur l'accueil d'« Orienter par besoin » (étape 4)
// Pour changer une correspondance, modifier le tableau CORRESPONDANCES.
// ========================================================
(function () {
  'use strict';

  const ETAPES = {
    1: 'Repérer – analyser',
    2: 'Agir en prévention',
    3: "S'informer – se former",
    4: 'Orienter',
    5: 'Évaluer',
    6: 'Accompagner',
    7: 'Accompagner en ville',
    8: "Accompagner à l'hôpital",
    9: 'Renforcer le lien ville-hôpital – coordonner',
    10: 'Soutenir les aidants'
  };
  const img = n => `assets/prioca/etape${n}.png`;

  // planche → [texte de l'en-tête de colonne (début), n° d'étape, libellé court facultatif]
  const CORRESPONDANCES = {
    'block-besoin-3': {
      selecteur: '.b5-col-headers .b5-ch-pill',
      liens: [['PRÉVENTION', 2], ['BESOINS', 3, "S'informer"], ['BESOIN DE MISE EN PLACE', 5], ['COORDINATION', 9, 'Coordonner'], ["BESOIN D'ACCOMPAGNEMENT", 6]]
    },
    'block-besoin-1': {
      selecteur: '.b1-col-headers .b1-ch-pill',
      liens: [['BILAN', 5], ['HOSPITALISATION', 8], ['SOINS DE SUITE', 9, 'Renforcer le lien ville-hôpital']]
    },
    'block-besoin-2': {
      selecteur: '.b5-col-headers .b5-ch-pill',
      liens: [['HÔPITAL', 9, 'Renforcer le lien ville-hôpital'], ['BESOINS', 3, "S'informer"], ['BESOIN DE MISE EN PLACE', 5], ['COORDINATION', 9, 'Coordonner'], ["BESOIN D'ACCOMPAGNEMENT", 7]]
    }
  };

  // Planches qui correspondent à une seule étape : pastille dans le bandeau-titre
  const ETAPE_DE_PLANCHE = {
    'transversal-reperage': 1,
    'block-besoin-4': 4
  };

  const norm = s => (s || '').replace(/\s+/g, ' ').trim().toUpperCase();

  function vignette(n, classe, court) {
    return `<div class="prioca-item ${classe || ''}" title="PRIOCA : ${ETAPES[n]}">
      <img src="${img(n)}" alt="">
      <div class="prioca-legende"><span class="prioca-texte">${court || ETAPES[n]}</span></div>
    </div>`;
  }

  // --------------------------------------------------------
  // 1. Bandeau d'étapes au-dessus des colonnes de chaque planche
  // --------------------------------------------------------
  const bandeaux = [];

  function installerBandeaux() {
    Object.keys(CORRESPONDANCES).forEach(boardId => {
      const board = document.getElementById(boardId);
      if (!board) return;
      const conf = CORRESPONDANCES[boardId];
      const entetes = Array.from(board.querySelectorAll(conf.selecteur));
      const cibles = [];
      conf.liens.forEach(([debut, n, court]) => {
        const el = entetes.find(e => norm(e.textContent).startsWith(norm(debut)) && !cibles.some(c => c.el === e));
        if (el) cibles.push({ el, n, court });
      });
      if (!cibles.length) return;

      // Le bandeau se place juste avant la ligne d'en-têtes
      const ligne = cibles[0].el.closest('.b5-col-headers, .b1-col-headers');
      if (!ligne || (ligne.previousElementSibling && ligne.previousElementSibling.classList.contains('prioca-bandeau'))) return;

      const bandeau = document.createElement('div');
      bandeau.className = 'prioca-bandeau';
      bandeau.setAttribute('aria-label', 'Étapes du PRIOCA');
      bandeau.innerHTML = cibles.map(c => vignette(c.n, '', c.court)).join('');
      ligne.parentElement.insertBefore(bandeau, ligne);
      bandeaux.push({ bandeau, cibles });
    });
    placerBandeaux();
  }

  // Centre chaque vignette au-dessus de sa colonne
  function placerBandeaux() {
    bandeaux.forEach(({ bandeau, cibles }) => {
      const rb = bandeau.getBoundingClientRect();
      if (!rb.width || !bandeau.offsetWidth) return;
      const echelle = rb.width / bandeau.offsetWidth;
      const items = bandeau.querySelectorAll('.prioca-item');
      cibles.forEach((c, i) => {
        const r = c.el.getBoundingClientRect();
        if (!r.width) return;
        const centre = (r.left + r.width / 2 - rb.left) / echelle;
        const largeur = r.width / echelle;
        items[i].style.left = centre + 'px';
        items[i].style.maxWidth = Math.max(110, Math.min(largeur, 260)) + 'px';
      });
    });
  }

  // --------------------------------------------------------
  // 1 bis. Planches d'une seule étape : pastille dans le bandeau-titre
  // --------------------------------------------------------
  function installerPastillesTitre() {
    Object.keys(ETAPE_DE_PLANCHE).forEach(boardId => {
      const board = document.getElementById(boardId);
      const barre = board && board.querySelector('.roof-arrow-bar');
      if (!barre || barre.querySelector('.prioca-chip')) return;
      const n = ETAPE_DE_PLANCHE[boardId];
      const chip = document.createElement('span');
      chip.className = 'prioca-chip prioca-chip-titre';
      chip.title = `PRIOCA : ${ETAPES[n]}`;
      chip.innerHTML = `<img src="${img(n)}" alt=""><span>${ETAPES[n]}</span>`;
      barre.appendChild(chip);
    });
  }

  // --------------------------------------------------------
  // 2. Bandeaux « Aidants » : étape 10
  // --------------------------------------------------------
  function installerAidants() {
    document.querySelectorAll('.b5-section-bar, .b1-section-bar').forEach(bar => {
      if (!/^AIDANTS/.test(norm(bar.textContent)) || bar.querySelector('.prioca-chip')) return;
      const chip = document.createElement('span');
      chip.className = 'prioca-chip';
      chip.title = `PRIOCA : ${ETAPES[10]}`;
      chip.innerHTML = `<img src="${img(10)}" alt=""><span>${ETAPES[10]}</span>`;
      bar.insertBefore(chip, bar.firstChild);
    });
  }

  // --------------------------------------------------------
  // 3. Vue synthétique : frise complète des 10 étapes
  // --------------------------------------------------------
  function installerFrise() {
    const carte = document.getElementById('synth-map');
    if (!carte || carte.querySelector('.prioca-frise')) return;
    const frise = document.createElement('section');
    frise.className = 'prioca-frise';
    frise.innerHTML = `
      <h3 class="prioca-frise-titre">Les étapes du parcours (PRIOCA)</h3>
      <div class="prioca-frise-ligne">
        ${Object.keys(ETAPES).map(n => vignette(+n, 'prioca-frise-item')).join('')}
      </div>`;
    // sous la carte de la vue synthétique
    carte.appendChild(frise);
    // l'étape 1 (Repérer) ouvre la planche Repérer
    const etape1 = frise.querySelector('.prioca-frise-item');
    if (etape1) {
      etape1.dataset.board = 'transversal-reperage';
      etape1.classList.add('prioca-cliquable');
      etape1.setAttribute('role', 'button');
      etape1.setAttribute('tabindex', '0');
      etape1.title = 'Ouvrir la planche Repérer';
    }
  }

  // --------------------------------------------------------
  // 4. « Orienter par besoin » : visuel de l'étape 4 sur l'accueil
  // --------------------------------------------------------
  function decorerAssistant() {
    const box = document.getElementById('wizard-question-box');
    if (!box) return;
    const ajouter = () => {
      const accueil = box.querySelector('.ob-home');
      if (!accueil || accueil.querySelector('.prioca-ob')) return;
      const el = document.createElement('div');
      el.className = 'prioca-ob';
      el.innerHTML = `<img src="${img(4)}" alt=""><span><b>PRIOCA</b> · Orienter</span>`;
      accueil.insertBefore(el, accueil.firstChild);
    };
    new MutationObserver(ajouter).observe(box, { childList: true });
    ajouter();
  }

  // --------------------------------------------------------
  // Démarrage
  // --------------------------------------------------------
  let minuterie = null;
  const replacer = d => { clearTimeout(minuterie); minuterie = setTimeout(placerBandeaux, d || 200); };

  function init() {
    installerAidants();
    installerPastillesTitre();
    installerFrise();
    decorerAssistant();
    installerBandeaux();
    setTimeout(placerBandeaux, 800);
    setTimeout(placerBandeaux, 2000);
    window.addEventListener('resize', () => replacer(300));
    new MutationObserver(() => replacer(350)).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.placerEtapesPrioca = placerBandeaux;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
