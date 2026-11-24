// ========================================================
// LISIBILITÉ DES PLANCHES
//  - thèmes repliables (Soins palliatifs, Oncogériatrie, Précarité…)
//  - sigles sur les cartes, nom complet au survol
//  - légende : bande compacte au lieu de la fenêtre flottante
// (les en-têtes fixes, le survol des lignes et l'aération sont dans lisibilite.css)
// ========================================================
(function () {
  'use strict';

  // --------------------------------------------------------
  // 1. Thèmes repliables
  // --------------------------------------------------------
  // Thèmes repliés à l'ouverture (les volets social / soin et le parcours
  // hospitalier restent toujours ouverts)
  const THEMES_REPLIES_PAR_DEFAUT = ['soinspalliatifs', 'oncogeriatrie', 'precarite', 'handicap', 'addicto', 'psychogeriatrie', 'aidants'];

  function cleTheme(wrapper) {
    const m = /(?:b5|b1)-theme-([a-z]+)/.exec(wrapper.className);
    return m ? m[1] : null;
  }

  function wrappersDuTheme(cle) {
    return document.querySelectorAll(`.b5-theme-${cle}, .b1-theme-${cle}`);
  }

  function apresChangement() {
    if (typeof window.syncThematicsAlignment === 'function') window.syncThematicsAlignment();
    if (typeof window.alignB3Connectors === 'function') window.alignB3Connectors();
    if (typeof window.nettoyerFleches === 'function') window.nettoyerFleches();
  }

  // Replie / déplie un thème sur TOUTES les planches (pour garder l'alignement)
  function basculerTheme(cle, replier) {
    wrappersDuTheme(cle).forEach(w => {
      const etat = typeof replier === 'boolean' ? replier : !w.classList.contains('theme-replie');
      w.classList.toggle('theme-replie', etat);
      const bar = w.querySelector('.b5-section-bar, .b1-section-bar');
      if (bar) bar.setAttribute('aria-expanded', String(!etat));
    });
  }

  function installerThemes() {
    document.querySelectorAll('[class*="b5-theme-"], [class*="b1-theme-"]').forEach(w => {
      const cle = cleTheme(w);
      const bar = w.querySelector(':scope > .b5-section-bar, :scope > .b1-section-bar');
      if (!cle || !bar || bar.dataset.repliable) return;
      bar.dataset.repliable = '1';
      w.classList.add('theme-repliable');

      const nb = Array.from(w.querySelectorAll('.b5-crit, .b1-crit')).filter(c => c.textContent.trim()).length;
      const info = document.createElement('span');
      info.className = 'theme-toggle-info';
      info.innerHTML = `<span class="theme-chevron" aria-hidden="true">▾</span><span class="theme-count">${nb ? nb + ' besoin' + (nb > 1 ? 's' : '') : 'aucun besoin'}</span>`;
      bar.appendChild(info);
      bar.setAttribute('role', 'button');
      bar.setAttribute('tabindex', '0');
      bar.title = 'Cliquer pour afficher ou masquer ce thème';

      const agir = e => {
        e.preventDefault();
        e.stopPropagation();
        basculerTheme(cle);
        apresChangement();
      };
      bar.addEventListener('click', agir);
      bar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') agir(e); });
      // ne pas déclencher le glisser-déplacer du schéma depuis un bandeau
      bar.addEventListener('mousedown', e => e.stopPropagation());
    });
    THEMES_REPLIES_PAR_DEFAUT.forEach(cle => basculerTheme(cle, true));
  }

  // Déplie les thèmes qui contiennent ces éléments (utilisé par l'assistant)
  function deplierPour(elements) {
    let change = false;
    (elements || []).forEach(el => {
      const w = el && el.closest && el.closest('.theme-replie');
      if (w) { basculerTheme(cleTheme(w), false); change = true; }
    });
    if (change) apresChangement();
    return change;
  }

  // Recherche dans le schéma : on déplie tout pendant une recherche
  function brancherRecherche() {
    const input = document.getElementById('schema-search');
    if (!input) return;
    let toutDeplie = false;
    input.addEventListener('input', () => {
      const actif = input.value.trim().length >= 2;
      if (actif && !toutDeplie) {
        document.querySelectorAll('.theme-repliable').forEach(w => basculerTheme(cleTheme(w), false));
        toutDeplie = true;
        apresChangement();
      } else if (!actif && toutDeplie) {
        THEMES_REPLIES_PAR_DEFAUT.forEach(cle => basculerTheme(cle, true));
        toutDeplie = false;
        apresChangement();
      }
    });
  }

  // --------------------------------------------------------
  // 2. Sigles sur les cartes (nom complet au survol)
  // --------------------------------------------------------
  const SIGLES = {
    "Centre communal d'action sociale": 'CCAS',
    "Centre local d'information et de coordination": 'CLIC',
    'Communauté professionnelle territoriale de santé': 'CPTS',
    'Département du Var : Centre médico-social': 'CMS (Département)',
    'Service autonomie à domicile - Aide': 'SAD Aide',
    'Service autonomie à domicile - Aide et soins': 'SAD Aide et soins',
    'Centre de ressources territorial : Volet 1': 'CRT – Volet 1',
    'Centre de ressources territorial : Volet 2': 'CRT – Volet 2',
    'Centre de ressources territorial : Ateliers de prévention': 'CRT – Ateliers de prévention',
    'CPAM : Mission accompagnement en santé': 'CPAM – MISAS',
    "Centre de Soins, d'Accompagnement et de Prévention en Addictologie": 'CSAPA',
    "Centre d'Accueil et d'Accompagnement à la Réduction des risques pour Usagers de Drogues": 'CAARUD',
    "Service d'Accompagnement à la Vie Sociale": 'SAVS',
    "Service d'accompagnement médico-social pour adultes handicapés": 'SAMSAH',
    'Établissements et services sociaux et médico-sociaux': 'ESMS',
    "Centre d'hébergement et de réinsertion sociale": 'CHRS',
    'Maison de santé pluriprofessionnelle': 'MSP',
    'Pôle de Compétences et de Prestations Externalisées': 'PCPE',
    'Équipe territoriale soins palliatifs': 'ETSP',
    'Plateforme de répit : Accueil de jour': 'PFR – Accueil de jour',
    'Plateforme de répit': 'PFR',
    'Mandataire judiciaire à la protection des majeurs individuel': 'MJPM individuel'
  };

  const norm = s => (s || '').replace(/[’']/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
  const TABLE = {};
  Object.keys(SIGLES).forEach(k => { TABLE[norm(k)] = SIGLES[k]; });

  function texteSansBr(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll('br').forEach(b => b.replaceWith(' '));
    return c.textContent;
  }

  function appliquerSigles() {
    document.querySelectorAll('.block-besoin .sch-card, .transversal-block .sch-card').forEach(card => {
      if (card.dataset.nomComplet) return;
      // Cas 1 : la carte ne contient que du texte (avec éventuellement des <br>)
      const elementsNonBr = Array.from(card.children).filter(c => c.tagName !== 'BR');
      if (!elementsNonBr.length) {
        const complet = texteSansBr(card).replace(/\s+/g, ' ').trim();
        const sigle = TABLE[norm(complet)];
        if (sigle) {
          card.dataset.nomComplet = complet;
          card.title = complet;
          card.textContent = sigle;
        }
        return;
      }
      // Cas 2 : le nom est dans le premier <span> (ex. CCAS + « Ateliers collectifs »)
      const premier = card.firstElementChild;
      if (premier && premier.tagName === 'SPAN') {
        const complet = texteSansBr(premier).replace(/\s+/g, ' ').trim();
        const sigle = TABLE[norm(complet)];
        if (sigle) {
          card.dataset.nomComplet = complet;
          card.title = complet;
          premier.textContent = sigle;
        }
      }
    });
  }

  // --------------------------------------------------------
  // 3. Légende : bande compacte, fenêtre flottante fermée au démarrage
  // --------------------------------------------------------
  function legendeCompacte() {
    document.body.classList.add('legende-en-bande');
    if (typeof window.toggleLegendSideWindow === 'function') window.toggleLegendSideWindow(false);
  }

  // --------------------------------------------------------
  // 4. Planches toujours ouvertes : plus de bouton « Fermer »
  //    (le bouton est masqué dans lisibilite.css ; ici on rouvre toute
  //    planche restée repliée, par exemple en quittant la vue synthétique)
  // --------------------------------------------------------
  function toutDeplier() {
    if (document.body.classList.contains('mode-synthetic-view')) return;
    const repliees = document.querySelectorAll('.block-besoin.is-collapsed, .transversal-block.is-collapsed');
    if (!repliees.length) return;
    repliees.forEach(el => {
      if (typeof window.toggleBoardCollapse === 'function') window.toggleBoardCollapse(el.id, false);
      else el.classList.remove('is-collapsed');
    });
    setTimeout(apresChangement, 120);
  }

  function garderPlanchesOuvertes() {
    toutDeplier();
    let etaitSynthese = document.body.classList.contains('mode-synthetic-view');
    new MutationObserver(() => {
      const estSynthese = document.body.classList.contains('mode-synthetic-view');
      if (etaitSynthese && !estSynthese) setTimeout(toutDeplier, 50);
      etaitSynthese = estSynthese;
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // --------------------------------------------------------
  // Démarrage
  // --------------------------------------------------------
  function init() {
    appliquerSigles();
    installerThemes();
    brancherRecherche();
    garderPlanchesOuvertes();
    setTimeout(apresChangement, 300);
  }

  window.lisibilite = { deplierPour, basculerTheme };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  // La légende flottante est ouverte par app.js au démarrage : on la referme ensuite
  window.addEventListener('load', () => setTimeout(legendeCompacte, 200));
})();
