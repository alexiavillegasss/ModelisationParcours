// ========================================================
// ORIENTER PAR BESOIN
// Assistant d'orientation : grand besoin -> besoin d'entrée -> structures
//
// Les besoins d'entrée (sous-besoins) et les structures ne sont PAS saisis
// ici : ils sont lus directement dans le schéma (première colonne de chaque
// planche). Quand une ligne est ajoutée ou modifiée dans le schéma,
// l'assistant se met à jour automatiquement.
// ========================================================

(function () {
  'use strict';

  // --------------------------------------------------------
  // 1. Les 4 grands besoins (dans l'ordre du schéma)
  // --------------------------------------------------------
  const GRANDS_BESOINS = [
    {
      blockId: 'block-besoin-3',
      dataId: 'besoin-3',
      titre: 'Maintien à domicile',
      icone: '🏠',
      couleur: '#059669',
      fond: '#ecfdf5',
      descParDefaut: "La personne est au domicile et cherche à tout mettre en place pour pouvoir y rester le plus longtemps possible."
    },
    {
      blockId: 'block-besoin-1',
      dataId: 'besoin-1',
      titre: 'Offre de soins de la filière gériatrique',
      icone: '🏥',
      couleur: '#2563eb',
      fond: '#eff6ff',
      descParDefaut: "Filière intra et extra hospitalière en réponse aux différents besoins de santé et de soins."
    },
    {
      blockId: 'block-besoin-2',
      dataId: 'besoin-2',
      titre: 'Relais en ville',
      icone: '🤝',
      couleur: '#ea580c',
      fond: '#fff7ed',
      descParDefaut: "La personne est hospitalisée et cherche un relais, un retour à domicile sécurisé."
    },
    {
      blockId: 'block-besoin-4',
      dataId: 'besoin-4',
      titre: 'Entrée en établissement',
      icone: '🏢',
      couleur: '#334155',
      fond: '#f1f5f9',
      descParDefaut: "Lorsque le maintien à domicile n'est plus possible en sécurité."
    }
  ];

  // --------------------------------------------------------
  // 2. État de l'assistant
  // --------------------------------------------------------
  const state = {
    isOpen: false,
    isCollapsed: false,
    catalogue: null,        // besoins lus dans le schéma
    besoin: null,           // grand besoin sélectionné
    sousBesoin: null,       // besoin d'entrée sélectionné
    filtre: '',
    boardAffiche: null      // planche actuellement zoomée par l'assistant
  };

  // --------------------------------------------------------
  // 3. Outils texte
  // --------------------------------------------------------
  function nettoyer(str) {
    return (str || '').replace(/\s+/g, ' ').trim();
  }

  // Texte d'un élément en remplaçant les <br> par des espaces
  function texte(el) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    return nettoyer(clone.textContent);
  }

  // "MAINTIEN À DOMICILE — VOLET SOCIAL" -> "Volet social"
  function joliTheme(str) {
    let t = nettoyer(str);
    if (t.includes('—')) t = nettoyer(t.split('—').pop());
    if (t === t.toUpperCase()) {
      t = t.toLowerCase();
      t = t.charAt(0).toUpperCase() + t.slice(1);
    }
    return t;
  }

  function normaliser(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/['’]/g, ' ')
      .replace(/[^a-z0-9\s+]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function correspond(sb, filtre) {
    if (!filtre) return true;
    const cible = normaliser(sb.label + ' ' + sb.theme + ' ' + sb.structures.map(s => s.nom + ' ' + s.detail).join(' '));
    return normaliser(filtre).split(' ').filter(Boolean).every(mot => cible.includes(mot));
  }

  function echapper(str) {
    return (str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // --------------------------------------------------------
  // 4. Lecture du schéma
  // --------------------------------------------------------

  // Nom + précision d'une carte structure.
  // Ex : <div class="sch-card"><span>CCAS</span><span>Ateliers collectifs</span></div>
  function lireCarte(card) {
    const parts = [];
    let courant = '';
    card.childNodes.forEach(n => {
      if (n.nodeType === 3) {
        courant += ' ' + n.textContent;
      } else if (n.nodeName === 'BR') {
        courant += ' ';
      } else if (n.nodeType === 1) {
        if (nettoyer(courant)) parts.push(nettoyer(courant));
        courant = '';
        const t = texte(n);
        if (t) parts.push(t);
      }
    });
    if (nettoyer(courant)) parts.push(nettoyer(courant));
    return {
      id: card.dataset.id || '',
      nom: parts[0] || texte(card),
      detail: parts.slice(1).join(' · '),
      el: card
    };
  }

  // Toutes les structures (cartes cliquables) d'une ligne, sans doublon
  function structuresDeLigne(ligne, extraDetail) {
    const vues = new Set();
    const liste = [];
    ligne.querySelectorAll('.sch-card').forEach(card => {
      const s = lireCarte(card);
      if (!s.nom) return;
      if (extraDetail) {
        const piste = card.closest('.b4-track-top, .b4-track-bottom');
        const crit = piste ? texte(piste.querySelector('.b4-track-text-group')) : '';
        if (crit) s.detail = s.detail ? s.detail + ' · ' + crit : crit;
      }
      // Même structure dans deux colonnes différentes = deux étapes différentes : on garde les deux
      const col = card.closest('[style*="grid-column"]');
      const cle = s.id + '|' + s.nom + '|' + s.detail + '|' + (col ? col.style.gridColumn : '');
      if (vues.has(cle)) return;
      vues.add(cle);
      liste.push(s);
    });
    return liste;
  }

  // Outils / étapes non cliquables affichés sur la ligne (ex : "Auto-évaluation : Solitest")
  function outilsDeLigne(ligne) {
    const vus = new Set();
    const liste = [];
    ligne.querySelectorAll('.b5-pill:not(.sch-card), .b1-pill:not(.sch-card), .b5-vt-badge').forEach(p => {
      const t = texte(p);
      // On ignore les petites pastilles "OUI" / "NON"
      if (t && t.length > 3 && !vus.has(t)) { vus.add(t); liste.push(t); }
    });
    return liste;
  }

  // Planches "matrice" (Maintien à domicile, Filière gériatrique, Relais en ville)
  function lirePlancheMatrice(block, gb) {
    const themes = [];
    let theme = null;
    const elements = block.querySelectorAll('.b5-section-bar, .b1-section-bar, .b5-crit, .b1-crit');
    elements.forEach(el => {
      if (el.matches('.b5-section-bar, .b1-section-bar')) {
        theme = { nom: joliTheme(texte(el)), sousBesoins: [] };
        themes.push(theme);
        return;
      }
      const label = texte(el);
      const ligne = el.closest('.b5-row, .b1-row') || el.parentElement;

      // Ligne sans libellé = suite de la ligne précédente (même besoin sur 2 lignes)
      if (!label) {
        const precedent = theme && theme.sousBesoins[theme.sousBesoins.length - 1];
        if (precedent) {
          precedent.lignes.push(ligne);
          structuresDeLigne(ligne).forEach(s => {
            if (!precedent.structures.some(x => x.id === s.id && x.nom === s.nom && x.detail === s.detail)) precedent.structures.push(s);
          });
          outilsDeLigne(ligne).forEach(o => { if (!precedent.outils.includes(o)) precedent.outils.push(o); });
        }
        return;
      }

      if (!theme) {
        theme = { nom: 'Besoins', sousBesoins: [] };
        themes.push(theme);
      }
      theme.sousBesoins.push({
        label,
        theme: theme.nom,
        besoin: gb,
        lignes: [ligne],
        structures: structuresDeLigne(ligne),
        outils: outilsDeLigne(ligne)
      });
    });
    return themes.filter(t => t.sousBesoins.length > 0);
  }

  // Planche "Entrée en établissement" : profils -> niveau d'autonomie -> établissement
  function lirePlancheEtablissement(block, gb) {
    const themes = [];
    block.querySelectorAll('.b4-tree-group').forEach(groupe => {
      const nomProfil = texte(groupe.querySelector('.b4-profil-name'));
      const sousProfil = texte(groupe.querySelector('.b4-profil-sub'));
      const theme = {
        nom: nomProfil ? (sousProfil ? `${nomProfil} — ${sousProfil}` : nomProfil) : 'Profil',
        sousBesoins: []
      };
      groupe.querySelectorAll('.b4-branch-row').forEach(ligne => {
        const label = texte(ligne.querySelector('.b4-crit-tag'));
        if (!label) return;
        theme.sousBesoins.push({
          label,
          theme: theme.nom,
          besoin: gb,
          lignes: [ligne],
          structures: structuresDeLigne(ligne, true),
          outils: Array.from(ligne.querySelectorAll('.vt-on-arrow')).map(texte).filter((v, i, a) => v && a.indexOf(v) === i)
        });
      });
      if (theme.sousBesoins.length) themes.push(theme);
    });

    // Types de lits en EHPAD
    const lits = { nom: 'Types de lits en EHPAD', sousBesoins: [] };
    block.querySelectorAll('.b4-lit-row-unified').forEach(ligne => {
      const label = texte(ligne.querySelector('.b4-lit-crit-text'));
      if (!label) return;
      lits.sousBesoins.push({
        label,
        theme: lits.nom,
        besoin: gb,
        lignes: [ligne],
        structures: structuresDeLigne(ligne),
        outils: Array.from(ligne.querySelectorAll('.b4-decision-med-badge')).map(texte).filter(Boolean)
      });
    });
    if (lits.sousBesoins.length) themes.push(lits);
    return themes;
  }

  // Étapes du parcours (colonnes du haut : Prévention, Informations, Évaluation…)
  // Calculées d'après la position de la carte sous les en-têtes de colonnes.
  function colonnesEtapes(block) {
    const entete = block.querySelector('.b5-col-headers, .b1-col-headers');
    if (!entete) return [];
    const feuilles = [];
    entete.querySelectorAll('.b5-ch-pill, .b1-ch-pill, .b5-sub-pill, .b1-sub-pill').forEach(el => {
      const estSous = el.matches('.b5-sub-pill, .b1-sub-pill');
      // Un en-tête qui a des sous-colonnes n'est pas une feuille
      if (!estSous) {
        const wrap = el.parentElement;
        if (wrap && wrap.querySelector('.b5-sub-pill, .b1-sub-pill') && wrap !== entete) return;
      }
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      feuilles.push({ nom: joliTheme(texte(el)), gauche: r.left, droite: r.right });
    });
    return feuilles.sort((a, b) => a.gauche - b.gauche);
  }

  function etapeDeCarte(card, colonnes) {
    if (!colonnes.length) return null;
    const r = card.getBoundingClientRect();
    if (!r.width) return null;
    const cx = (r.left + r.right) / 2;
    let meilleure = null;
    let distance = Infinity;
    colonnes.forEach((c, i) => {
      const d = cx < c.gauche ? c.gauche - cx : cx > c.droite ? cx - c.droite : 0;
      if (d < distance) { distance = d; meilleure = i; }
    });
    return meilleure;
  }

  // Regroupe les structures d'un besoin par étape du parcours (dans l'ordre des colonnes)
  function grouperParEtape(sb) {
    const block = document.getElementById(sb.besoin.blockId);
    const colonnes = block && sb.besoin.blockId !== 'block-besoin-4' ? colonnesEtapes(block) : [];
    const groupes = [];
    sb.structures.forEach(s => {
      const idx = etapeDeCarte(s.el, colonnes);
      const nom = idx === null ? '' : colonnes[idx].nom;
      const ordre = idx === null ? 999 : idx;
      let g = groupes.find(x => x.nom === nom);
      if (!g) { g = { nom, ordre, structures: [] }; groupes.push(g); }
      g.structures.push(s);
    });
    groupes.sort((a, b) => a.ordre - b.ordre);
    return groupes;
  }

  // Critères à évaluer avant une entrée en établissement
  function criteresEtablissement() {
    const block = document.getElementById('block-besoin-4');
    if (!block) return [];
    return Array.from(block.querySelectorAll('.eval-titre')).map(texte).filter(Boolean);
  }

  function construireCatalogue() {
    const initial = window.APP_INITIAL_DATA && window.APP_INITIAL_DATA.besoins ? window.APP_INITIAL_DATA.besoins : [];
    return GRANDS_BESOINS.map(gb => {
      const data = initial.find(b => b.id === gb.dataId);
      const besoin = Object.assign({}, gb, {
        desc: (data && data.note_contexte) || gb.descParDefaut,
        themes: []
      });
      const block = document.getElementById(gb.blockId);
      if (block) {
        besoin.themes = gb.blockId === 'block-besoin-4'
          ? lirePlancheEtablissement(block, besoin)
          : lirePlancheMatrice(block, besoin);
      }
      return besoin;
    });
  }

  function catalogue() {
    // Relu à chaque ouverture : le schéma peut avoir été modifié
    if (!state.catalogue) state.catalogue = construireCatalogue();
    return state.catalogue;
  }

  function tousLesSousBesoins() {
    const liste = [];
    catalogue().forEach(b => b.themes.forEach(t => t.sousBesoins.forEach(sb => liste.push(sb))));
    return liste;
  }

  function nbSousBesoins(besoin) {
    return besoin.themes.reduce((n, t) => n + t.sousBesoins.length, 0);
  }

  // --------------------------------------------------------
  // 5. Navigation dans le schéma
  // --------------------------------------------------------
  function allerSurPlanche(blockId) {
    if (!blockId) return;
    // Déjà zoomé sur cette planche ? (sinon zoomOnBoard reviendrait à la vue d'ensemble)
    const navActif = document.querySelector('.nav-planche-btn.active');
    const dejaAffichee = navActif ? navActif.dataset.target === blockId : state.boardAffiche === blockId;
    if (dejaAffichee) return;
    state.boardAffiche = blockId;
    if (typeof window.zoomOnBoard === 'function') {
      window.zoomOnBoard(blockId);
      return;
    }
    const el = document.getElementById(blockId);
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
  }

  function effacerSurbrillance() {
    const canvas = document.getElementById('poster-canvas');
    if (canvas) canvas.classList.remove('canvas-focused-mode');
    document.querySelectorAll('.wizard-highlight').forEach(el => el.classList.remove('wizard-highlight'));
    document.querySelectorAll('.wizard-row-highlight').forEach(el => el.classList.remove('wizard-row-highlight'));
  }

  function surlignerLigne(sb) {
    effacerSurbrillance();
    allerSurPlanche(sb.besoin.blockId);
    const lignes = (sb.lignes || []).filter(Boolean);
    if (!lignes.length) return;
    lignes.forEach(l => l.classList.add('wizard-row-highlight'));
    if (sb.structures.length) {
      const canvas = document.getElementById('poster-canvas');
      if (canvas) canvas.classList.add('canvas-focused-mode');
      sb.structures.forEach(s => s.el && s.el.classList.add('wizard-highlight'));
    }
    setTimeout(() => {
      try {
        lignes[0].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
      } catch (e) { /* sans gravité */ }
    }, 450);
  }

  function activerOnglet(blockId) {
    document.querySelectorAll('.wizard-step').forEach(stepEl => {
      const cible = 'block-' + (stepEl.dataset.target || '');
      stepEl.classList.remove('completed');
      stepEl.classList.toggle('active', cible === blockId);
    });
  }

  // --------------------------------------------------------
  // 6. Affichage
  // --------------------------------------------------------
  function boite() {
    return document.getElementById('wizard-question-box');
  }

  function enTete(etape, question, retour) {
    return `
      <div class="wizard-prompt-row">
        <span class="wizard-step-badge">Étape ${etape} sur 3</span>
        <h4 class="wizard-prompt-text">${question}</h4>
        ${retour ? `<button class="wizard-back-link" data-action="${retour.action}">&larr; ${retour.texte}</button>` : ''}
      </div>`;
  }

  function puceSousBesoin(sb, avecPlanche) {
    const vide = sb.structures.length === 0;
    return `
      <button class="ob-sb-btn${vide ? ' ob-sb-empty' : ''}" data-sb="${sb._index}" style="--ob-color:${sb.besoin.couleur}">
        <span class="ob-sb-label">${echapper(sb.label)}</span>
        <span class="ob-sb-meta">
          ${avecPlanche ? `<span class="ob-sb-planche">${sb.besoin.icone} ${echapper(sb.besoin.titre)} · ${echapper(sb.theme)}</span>` : ''}
          ${vide
            ? '<span class="ob-sb-count ob-count-empty">À compléter</span>'
            : `<span class="ob-sb-count">${sb.structures.length} structure${sb.structures.length > 1 ? 's' : ''}</span>`}
        </span>
      </button>`;
  }

  function indexer() {
    tousLesSousBesoins().forEach((sb, i) => { sb._index = i; });
  }

  function brancherClics(conteneur) {
    conteneur.querySelectorAll('[data-sb]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sb = tousLesSousBesoins()[parseInt(btn.dataset.sb, 10)];
        if (sb) afficherResultat(sb);
      });
    });
    conteneur.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.action;
        if (a === 'accueil') afficherAccueil();
        if (a === 'liste' && state.besoin) afficherSousBesoins(state.besoin);
        if (a === 'schema') replierAssistant(true);
        if (a === 'recommencer') resetWizard();
      });
    });
  }

  // ---------- Étape 1 : choix du grand besoin ----------
  function afficherAccueil() {
    const box = boite();
    if (!box) return;
    state.besoin = null;
    state.sousBesoin = null;
    effacerSurbrillance();
    activerOnglet(null);
    indexer();

    box.innerHTML = `
      ${enTete(1, 'Quel est le grand besoin de la personne ?')}
      <div class="wizard-options-grid starter-grid">
        ${catalogue().map((b, i) => `
          <button class="wizard-option-btn starter-btn ob-gb-btn" data-gb="${i}" style="--ob-color:${b.couleur}; --ob-bg:${b.fond}">
            <span class="btn-scenario-icon">${b.icone}</span>
            <div class="btn-scenario-texts">
              <strong>${echapper(b.titre)}</strong>
              <small>${echapper(b.desc)}</small>
              <span class="ob-gb-count">${nbSousBesoins(b)} besoins d'entrée</span>
            </div>
            <span class="btn-arrow">&rarr;</span>
          </button>
        `).join('')}
      </div>
      <div class="ob-search-zone">
        <label class="ob-search-label" for="ob-search-all">Ou cherchez directement un besoin, dans les 4 grands besoins :</label>
        <input id="ob-search-all" class="ob-search-input" type="search" placeholder="Ex : isolement, chute, Alzheimer, tutelle, aidant…" autocomplete="off">
        <div id="ob-search-results" class="ob-sb-grid"></div>
      </div>
    `;

    box.querySelectorAll('[data-gb]').forEach(btn => {
      btn.addEventListener('click', () => afficherSousBesoins(catalogue()[parseInt(btn.dataset.gb, 10)]));
    });

    const input = document.getElementById('ob-search-all');
    const res = document.getElementById('ob-search-results');
    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (q.length < 2) { res.innerHTML = ''; return; }
      const trouves = tousLesSousBesoins().filter(sb => correspond(sb, q));
      res.innerHTML = trouves.length
        ? trouves.slice(0, 30).map(sb => puceSousBesoin(sb, true)).join('')
        : '<p class="ob-empty-msg">Aucun besoin ne correspond à cette recherche.</p>';
      brancherClics(res);
    });
  }

  // ---------- Étape 2 : besoins d'entrée du grand besoin ----------
  function afficherSousBesoins(besoin) {
    const box = boite();
    if (!box || !besoin) return;
    state.besoin = besoin;
    state.sousBesoin = null;
    effacerSurbrillance();
    activerOnglet(besoin.blockId);
    allerSurPlanche(besoin.blockId);
    indexer();

    box.innerHTML = `
      ${enTete(2, `${besoin.icone} ${echapper(besoin.titre)} : quel est le besoin de la personne ?`, { action: 'accueil', texte: 'Changer de grand besoin' })}
      <input id="ob-search-board" class="ob-search-input" type="search" placeholder="Filtrer les besoins de cette planche…" autocomplete="off" value="${echapper(state.filtre)}">
      <div id="ob-themes" class="ob-themes"></div>
    `;

    const zone = document.getElementById('ob-themes');
    const input = document.getElementById('ob-search-board');

    const dessiner = () => {
      const q = input.value.trim();
      state.filtre = q;
      const html = besoin.themes.map(t => {
        const sbs = t.sousBesoins.filter(sb => correspond(sb, q));
        if (!sbs.length) return '';
        return `
          <section class="ob-theme" style="--ob-color:${besoin.couleur}; --ob-bg:${besoin.fond}">
            <h5 class="ob-theme-title">${echapper(t.nom)}</h5>
            <div class="ob-sb-grid">${sbs.map(sb => puceSousBesoin(sb, false)).join('')}</div>
          </section>`;
      }).join('');
      zone.innerHTML = html || '<p class="ob-empty-msg">Aucun besoin ne correspond à ce filtre.</p>';
      brancherClics(zone);
    };

    input.addEventListener('input', dessiner);
    dessiner();
    brancherClics(box.querySelector('.wizard-prompt-row'));
  }

  // ---------- Étape 3 : structures ----------
  function afficherResultat(sb) {
    const box = boite();
    if (!box) return;
    state.besoin = sb.besoin;
    state.sousBesoin = sb;
    activerOnglet(sb.besoin.blockId);
    surlignerLigne(sb);

    const groupes = grouperParEtape(sb);
    const avecEtapes = groupes.some(g => g.nom);
    let numero = 0;
    const carteStructure = s => {
      const i = sb.structures.indexOf(s);
      numero += 1;
      return `
              <button class="ob-struct-btn" data-struct="${i}">
                <span class="ob-struct-num">${numero}</span>
                <span class="ob-struct-texts">
                  <strong>${echapper(s.nom)}</strong>
                  ${s.detail ? `<small>${echapper(s.detail)}</small>` : ''}
                </span>
                <span class="ob-struct-cta">Voir la fiche &rarr;</span>
              </button>`;
    };
    const listeStructures = avecEtapes
      ? groupes.map(g => `
          <div class="ob-etape">
            <h6 class="ob-etape-title">${g.nom ? echapper(g.nom) : 'Autres'}</h6>
            <div class="ob-struct-list">${g.structures.map(carteStructure).join('')}</div>
          </div>`).join('')
      : `<div class="ob-struct-list">${sb.structures.map(carteStructure).join('')}</div>`;

    const estEtablissement = sb.besoin.blockId === 'block-besoin-4';
    const criteres = estEtablissement ? criteresEtablissement() : [];
    const ouvreEhpad = estEtablissement && sb.structures.some(s => /^ehpad-permanent/.test(s.id));
    const themeLits = ouvreEhpad ? sb.besoin.themes.find(t => t.nom === 'Types de lits en EHPAD') : null;

    box.innerHTML = `
      ${enTete(3, 'Les structures à mobiliser', { action: 'liste', texte: `Autres besoins : ${echapper(sb.besoin.titre)}` })}
      <div class="ob-result" style="--ob-color:${sb.besoin.couleur}; --ob-bg:${sb.besoin.fond}">
        <div class="ob-result-head">
          <span class="ob-result-path">${sb.besoin.icone} ${echapper(sb.besoin.titre)} &rsaquo; ${echapper(sb.theme)}</span>
          <h3 class="ob-result-title">${echapper(sb.label)}</h3>
        </div>

        ${sb.structures.length ? `
          <p class="ob-result-hint">Cliquez sur une structure pour ouvrir sa fiche ou son flyer.${avecEtapes ? " Elles sont rangées par étape du parcours, dans l'ordre des colonnes du schéma." : ''}</p>
          ${listeStructures}
        ` : `
          <p class="ob-empty-msg">Aucune structure n'est encore renseignée dans le schéma pour ce besoin.</p>
        `}

        ${sb.outils.length ? `
          <div class="ob-tools">
            <span class="ob-tools-label">Outils et étapes repérés sur cette ligne :</span>
            ${sb.outils.map(o => `<span class="ob-tool-chip">${echapper(o)}</span>`).join('')}
          </div>` : ''}

        ${themeLits ? `
          <div class="ob-followup">
            <span class="ob-tools-label">Préciser le type de lit en EHPAD :</span>
            <div class="ob-sb-grid">${themeLits.sousBesoins.map(x => puceSousBesoin(x, false)).join('')}</div>
          </div>` : ''}

        ${criteres.length ? `
          <div class="ob-tools">
            <span class="ob-tools-label">Critères à évaluer avant toute entrée en établissement :</span>
            ${criteres.map(c => `<span class="ob-tool-chip">${echapper(c)}</span>`).join('')}
          </div>` : ''}

        <div class="result-actions ob-result-actions">
          <button class="result-cta-btn" data-action="schema">Voir la ligne sur le schéma</button>
          <button class="result-sec-btn" data-action="recommencer">↺ Nouvelle orientation</button>
        </div>
      </div>
    `;

    box.querySelectorAll('[data-struct]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = sb.structures[parseInt(btn.dataset.struct, 10)];
        if (s && s.el) s.el.click();
      });
    });
    brancherClics(box);
  }

  // --------------------------------------------------------
  // 7. Ouverture / fermeture du panneau
  // --------------------------------------------------------
  function replierAssistant(replier) {
    const wizardContainer = document.getElementById('pathway-wizard');
    const icone = document.getElementById('wizard-collapse-icon');
    if (!wizardContainer) return;
    state.isCollapsed = typeof replier === 'boolean' ? replier : !state.isCollapsed;
    wizardContainer.classList.toggle('collapsed', state.isCollapsed);
    if (icone) {
      icone.innerHTML = state.isCollapsed
        ? '<polyline points="18 15 12 9 6 15"/>'
        : '<polyline points="6 9 12 15 18 9"/>';
    }
  }

  function openWizard() {
    const wizardContainer = document.getElementById('pathway-wizard');
    const toggleBtn = document.getElementById('btn-toggle-wizard');
    const floatBtn = document.getElementById('btn-float-wizard');
    if (!wizardContainer) return;

    state.isOpen = true;
    wizardContainer.classList.add('open');
    replierAssistant(false);
    if (toggleBtn) toggleBtn.classList.add('active');
    if (floatBtn) floatBtn.style.display = 'none';

    if (!state.besoin) {
      state.catalogue = null; // relecture du schéma
      afficherAccueil();
    }
  }

  function closeWizard() {
    const wizardContainer = document.getElementById('pathway-wizard');
    const toggleBtn = document.getElementById('btn-toggle-wizard');
    const floatBtn = document.getElementById('btn-float-wizard');
    if (!wizardContainer) return;

    state.isOpen = false;
    wizardContainer.classList.remove('open', 'collapsed');
    if (toggleBtn) toggleBtn.classList.remove('active');
    if (floatBtn) floatBtn.style.display = 'flex';
    effacerSurbrillance();
  }

  // Petite protection : certains boutons appellent la fonction deux fois
  // (attribut onclick + écouteur), ce qui ouvrait puis refermait aussitôt.
  let dernierBasculement = 0;
  function toggleWizard() {
    const maintenant = Date.now();
    if (maintenant - dernierBasculement < 300) return;
    dernierBasculement = maintenant;
    if (state.isOpen) closeWizard(); else openWizard();
  }

  function resetWizard() {
    state.catalogue = null;
    state.besoin = null;
    state.sousBesoin = null;
    state.filtre = '';
    state.boardAffiche = null;
    afficherAccueil();
    if (typeof window.zoomOnBoard === 'function') window.zoomOnBoard('all');
  }

  function initPathwayWizard() {
    const wizardContainer = document.getElementById('pathway-wizard');
    if (!wizardContainer) return;

    const collapseBtn = document.getElementById('wizard-btn-collapse');
    const closeBtn = document.getElementById('wizard-btn-close');
    const resetBtn = document.getElementById('wizard-btn-reset');
    const toggleBtn = document.getElementById('btn-toggle-wizard');
    const floatBtn = document.getElementById('btn-float-wizard');

    // Les boutons qui ont déjà un onclick dans le HTML ne reçoivent pas d'écouteur en plus
    if (toggleBtn && !toggleBtn.getAttribute('onclick')) toggleBtn.addEventListener('click', toggleWizard);
    if (floatBtn && !floatBtn.getAttribute('onclick')) floatBtn.addEventListener('click', openWizard);
    if (collapseBtn) collapseBtn.addEventListener('click', () => replierAssistant());
    if (closeBtn) closeBtn.addEventListener('click', closeWizard);
    if (resetBtn) resetBtn.addEventListener('click', resetWizard);

    // Les 4 onglets colorés = accès direct à un grand besoin
    document.querySelectorAll('.wizard-step').forEach(stepEl => {
      stepEl.addEventListener('click', () => {
        const blockId = 'block-' + (stepEl.dataset.target || '');
        const besoin = catalogue().find(b => b.blockId === blockId);
        if (besoin) {
          state.filtre = '';
          afficherSousBesoins(besoin);
        }
      });
    });

    afficherAccueil();
  }

  // --------------------------------------------------------
  // 8. Démarrage + fonctions accessibles depuis le HTML
  // --------------------------------------------------------
  window.initPathwayWizard = initPathwayWizard;
  window.openWizard = openWizard;
  window.closeWizard = closeWizard;
  window.toggleWizard = toggleWizard;
  window.resetWizard = resetWizard;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPathwayWizard);
  } else {
    initPathwayWizard();
  }
})();
