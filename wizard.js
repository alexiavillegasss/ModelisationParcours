// ========================================================
// ORIENTER PAR BESOIN
// Écran simple, séparé du schéma :
//   1. De quoi la personne a-t-elle besoin ? (recherche ou 4 grandes tuiles)
//   2. Quel est son besoin précis ? (liste simple)
//   3. Qui contacter ? (structures, dans l'ordre du parcours)
//
// Les besoins et les structures ne sont PAS saisis ici : ils sont lus
// directement dans le schéma (première colonne de chaque planche).
// Quand une ligne est ajoutée ou modifiée dans le schéma, l'assistant se
// met à jour automatiquement.
// ========================================================

(function () {
  'use strict';

  // --------------------------------------------------------
  // 1. Les 4 grands besoins (dans l'ordre du schéma)
  //    "phrase" = texte court affiché sur la tuile, à modifier librement
  // --------------------------------------------------------
  const GRANDS_BESOINS = [
    {
      blockId: 'block-besoin-3',
      titre: 'Maintien à domicile',
      image: 'assets/illustrations/domicile.svg',   // illustration de l'animation Parcours PA
      phrase: 'La personne vit chez elle et souhaite y rester.',
      icone: 'house',
      couleur: '#f8b52f',   // jaune DAC
      texte: '#8a5a00',
      surCouleur: '#3d2a00',
      fond: '#fef6e2'
    },
    {
      blockId: 'block-besoin-1',
      titre: 'Filière gériatrique',
      image: 'assets/illustrations/filiere.svg',   // illustration de l'animation Parcours PA
      phrase: "La personne a besoin d'un avis, d'un bilan ou de soins à l'hôpital.",
      icone: 'cross',
      couleur: '#3766ae',   // bleu foncé DAC
      texte: '#3766ae',
      surCouleur: '#ffffff',
      fond: '#eaf1fa'
    },
    {
      blockId: 'block-besoin-2',
      titre: 'Sortie d\'hospitalisation',
      image: 'assets/illustrations/relais.svg',   // illustration de l'animation Parcours PA
      phrase: "La personne sort de l'hôpital et rentre à domicile.",
      icone: 'house',
      couleur: '#ea5f45',   // rouge DAC
      texte: '#c2412b',
      surCouleur: '#ffffff',
      fond: '#fdece8'
    },
    {
      blockId: 'block-besoin-4',
      titre: 'Entrée en établissement',
      image: 'assets/illustrations/etablissement.svg',   // illustration de l'animation Parcours PA
      phrase: "Rester à domicile n'est plus possible.",
      icone: 'building',
      couleur: '#24467a',   // bleu nuit (dérivé du bleu DAC)
      texte: '#24467a',
      surCouleur: '#ffffff',
      fond: '#eef2f8'
    }
  ];

  // --------------------------------------------------------
  // Pictos : les mêmes que dans l'animation « Parcours Personnes âgées »
  // --------------------------------------------------------
  const PICTOS = {
    house: '<path d="M5 23 24 7l19 16M10 19v22h28V19M20 41V29h8v12" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>',
    cross: '<path d="M18 5h12v13h13v12H30v13H18V30H5V18h13z" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linejoin="round"/>',
    building: '<path d="M4 43h40M9 43V7h22v36M31 17h9v26M15 14h3M22 14h3M15 21h3M22 21h3M15 28h3M22 28h3M17 43v-7h6v7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function picto(nom, classe) {
    return `<svg class="ob-picto ${classe || ''}" viewBox="0 0 48 48" aria-hidden="true">${PICTOS[nom] || ''}</svg>`;
  }

  // --------------------------------------------------------
  // 2. État
  // --------------------------------------------------------
  const state = {
    isOpen: false,
    catalogue: null,
    ecran: 'accueil',   // accueil | liste | reponse
    besoin: null,
    sousBesoin: null,
    boardAffiche: null
  };

  // --------------------------------------------------------
  // 3. Outils texte
  // --------------------------------------------------------
  function nettoyer(str) {
    return (str || '').replace(/\s+/g, ' ').trim();
  }

  function texte(el) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    return nettoyer(clone.textContent);
  }

  // "MAINTIEN À DOMICILE — VOLET SOCIAL" -> "Volet social"
  function joliTexte(str) {
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

  function correspond(sb, recherche) {
    if (!recherche) return true;
    const cible = normaliser(sb.label + ' ' + sb.theme + ' ' + sb.besoin.titre + ' ' + sb.structures.map(s => s.nom + ' ' + s.detail).join(' '));
    return normaliser(recherche).split(' ').filter(Boolean).every(mot => cible.includes(mot));
  }

  function echapper(str) {
    return (str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function varsCss(b) {
    return `--ob-color:${b.couleur}; --ob-text:${b.texte}; --ob-on:${b.surCouleur}; --ob-bg:${b.fond}`;
  }

  // --------------------------------------------------------
  // 4. Lecture du schéma
  // --------------------------------------------------------
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
    // Carte affichée avec un sigle (CCAS, CLIC…) : on garde le nom complet pour l'utilisateur
    if (card.dataset.nomComplet) parts[0] = card.dataset.nomComplet;
    return {
      id: card.dataset.id || '',
      nom: parts[0] || texte(card),
      detail: parts.slice(1).join(' · '),
      el: card
    };
  }

  function structuresDeLigne(ligne, avecCritereB4) {
    const vues = new Set();
    const liste = [];
    ligne.querySelectorAll('.sch-card').forEach(card => {
      const s = lireCarte(card);
      if (!s.nom) return;
      if (avecCritereB4) {
        const piste = card.closest('.b4-track-top, .b4-track-bottom');
        const crit = piste ? texte(piste.querySelector('.b4-track-text-group')) : '';
        if (crit) s.detail = s.detail ? s.detail + ' · ' + crit : crit;
      }
      // Même structure dans deux colonnes = deux étapes différentes : on garde les deux
      const col = card.closest('[style*="grid-column"]');
      const cle = s.id + '|' + s.nom + '|' + s.detail + '|' + (col ? col.style.gridColumn : '');
      if (vues.has(cle)) return;
      vues.add(cle);
      liste.push(s);
    });
    return liste;
  }

  function outilsDeLigne(ligne) {
    const vus = new Set();
    const liste = [];
    ligne.querySelectorAll('.b5-pill:not(.sch-card), .b1-pill:not(.sch-card), .b5-vt-badge, .vt-on-arrow').forEach(p => {
      const t = texte(p);
      if (t && t.length > 3 && !vus.has(t)) { vus.add(t); liste.push(t); }
    });
    return liste;
  }

  function lirePlancheMatrice(block, gb) {
    const themes = [];
    let theme = null;
    block.querySelectorAll('.b5-section-bar, .b1-section-bar, .b5-crit, .b1-crit').forEach(el => {
      if (el.matches('.b5-section-bar, .b1-section-bar')) {
        theme = { nom: joliTexte(texte(el)), sousBesoins: [] };
        themes.push(theme);
        return;
      }
      const label = texte(el);
      const ligne = el.closest('.b5-row, .b1-row') || el.parentElement;

      // Ligne sans libellé = suite de la ligne précédente
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
    return themes;
  }

  function lirePlancheEtablissement(block, gb) {
    const themes = [];
    block.querySelectorAll('.b4-tree-group').forEach(groupe => {
      const nomProfil = texte(groupe.querySelector('.b4-profil-name'));
      const sousProfil = texte(groupe.querySelector('.b4-profil-sub'));
      const theme = {
        nom: nomProfil ? (sousProfil ? `${nomProfil} (${sousProfil})` : nomProfil) : 'Profil',
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
          outils: outilsDeLigne(ligne)
        });
      });
      themes.push(theme);
    });

    const lits = { nom: 'Types de lits en EHPAD', estLits: true, sousBesoins: [] };
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
    themes.push(lits);
    return themes;
  }

  function criteresEtablissement() {
    const block = document.getElementById('block-besoin-4');
    if (!block) return [];
    return Array.from(block.querySelectorAll('.eval-titre')).map(texte).filter(Boolean);
  }

  // --------------------------------------------------------
  // 4 bis. Classement des besoins du domicile par catégories
  //    (Maintien à domicile, et partie « Relais à domicile » de la Sortie d'hospitalisation)
  //    - besoins : début du libellé (sans accents ni ponctuation) des lignes du schéma
  //    - sections : nom de la thématique du schéma dont on prend toutes les lignes
  //    - fusion : besoins rattachés à un autre (leurs structures s'ajoutent)
  //    - libellé/source : un même besoin du schéma affiché sous un autre nom
  //    Pour changer le classement, modifier ce tableau.
  // --------------------------------------------------------
  const CATEGORIES_DOMICILE = [
    { titre: 'Lien social', besoins: ["lutte contre l isolement"] },
    { titre: 'Accès aux droits', besoins: ['problematiques sociales', 'sante acces aux droits', 'perte d autonomie demande d aide', 'aides financieres demande d aides'] },
    { titre: 'Accès aux soins', besoins: ['recherche de medecin traitant', 'recherche de professionnels de sante', { libelle: 'Dépistage', source: 'bilan de sante' }, { libelle: 'Bilan de santé', source: 'bilan de sante' }, 'soins non programmes'] },
    { titre: 'Aides et soins à domicile', besoins: ['securisation du domicile', 'renforcement des aides', 'hospitalisation a domicile'],
      fusion: { 'renforcement des aides': ['aides et services a domicile', 'aides a domicile', 'aides et soins a domicile'] } },
    { titre: "Maladie d'Alzheimer et apparentée", sections: ['maladie d alzheimer'] },
    { titre: 'Addiction', sections: ['addictologie'] },
    { titre: "Protection d'un majeur vulnérable", sections: ['protection d un majeur'] },
    { titre: 'Précarité', sections: ['precarite'] },
    { titre: 'Soins palliatifs', sections: ['soins palliatifs'] },
    { titre: 'Oncogériatrie', sections: ['oncogeriatrie'] },
    { titre: 'Handicap', sections: ['handicap'] },
    { titre: 'Santé mentale', sections: ['sante mentale'] },
    { titre: 'Aidants', sections: ['aidants'] }
  ];

  function classerParCategories(themes, aClasser) {
    const gardes = [];
    const pool = [];
    themes.forEach(t => {
      const reste = [];
      t.sousBesoins.forEach(sb => (aClasser(sb) ? pool : reste).push(sb));
      if (reste.length) gardes.push(Object.assign({}, t, { sousBesoins: reste }));
    });
    const commence = (sb, motif) => normaliser(sb.label).startsWith(motif);
    const utilises = new Set();
    const categories = CATEGORIES_DOMICILE.map(cat => {
      const liste = [];
      (cat.besoins || []).forEach(b => {
        const motif = typeof b === 'string' ? b : b.source;
        pool.filter(sb => commence(sb, motif)).forEach(sb => {
          utilises.add(sb);
          let copie = Object.assign({}, sb, { theme: cat.titre });
          if (typeof b !== 'string') copie = Object.assign(copie, { label: b.libelle });
          const aFusionner = (cat.fusion || {})[motif] || [];
          aFusionner.forEach(f => pool.filter(x => commence(x, f) && !commence(x, motif)).forEach(x => {
            utilises.add(x);
            copie.lignes = copie.lignes.concat(x.lignes);
            copie.structures = copie.structures.concat(x.structures.filter(s => !copie.structures.some(y => y.el === s.el)));
            copie.outils = copie.outils.concat(x.outils.filter(o => !copie.outils.includes(o)));
          }));
          liste.push(copie);
        });
      });
      (cat.sections || []).forEach(sec => {
        pool.filter(sb => !utilises.has(sb) && normaliser(sb.theme).includes(sec)).forEach(sb => {
          utilises.add(sb);
          liste.push(Object.assign({}, sb, { theme: cat.titre }));
        });
      });
      return { nom: cat.titre, sousBesoins: liste };
    }).filter(c => c.sousBesoins.length);
    // Besoins du schéma qui ne sont dans aucune catégorie : on les garde sous leur thématique d'origine
    const autres = {};
    pool.filter(sb => !utilises.has(sb)).forEach(sb => {
      (autres[sb.theme] = autres[sb.theme] || { nom: sb.theme, sousBesoins: [] }).sousBesoins.push(sb);
    });
    return gardes.concat(categories, Object.values(autres));
  }

  function construireCatalogue() {
    return GRANDS_BESOINS.map(gb => {
      const besoin = Object.assign({}, gb, { themes: [] });
      const block = document.getElementById(gb.blockId);
      if (block) {
        besoin.themes = (gb.blockId === 'block-besoin-4'
          ? lirePlancheEtablissement(block, besoin)
          : lirePlancheMatrice(block, besoin))
          // Pour l'utilisateur, on ne montre que les besoins qui ont au moins une structure
          .map(t => Object.assign(t, { sousBesoins: t.sousBesoins.filter(sb => sb.structures.length > 0) }))
          .filter(t => t.sousBesoins.length > 0);
        // Classement par catégories : tout le Maintien à domicile, et la partie Relais à domicile de la Sortie
        if (gb.blockId === 'block-besoin-3') besoin.themes = classerParCategories(besoin.themes, () => true);
        if (gb.blockId === 'block-besoin-2') besoin.themes = classerParCategories(besoin.themes, sb => (sb.lignes || []).some(l => l && l.closest('#rad-relais')));
      }
      return besoin;
    });
  }

  function catalogue() {
    if (!state.catalogue) {
      state.catalogue = construireCatalogue();
      tousLesSousBesoins().forEach((sb, i) => { sb._index = i; });
    }
    return state.catalogue;
  }

  function tousLesSousBesoins() {
    const liste = [];
    (state.catalogue || []).forEach(b => b.themes.forEach(t => t.sousBesoins.forEach(sb => liste.push(sb))));
    return liste;
  }

  // --------------------------------------------------------
  // 5. Étapes du parcours (colonnes du schéma) pour ranger la réponse
  // --------------------------------------------------------
  function colonnesEtapes(block, ligne) {
    // Une planche peut avoir plusieurs en-têtes (ex. Sortie d'hospitalisation) : on prend celui situé juste au-dessus de la ligne
    const entetes = [...block.querySelectorAll('.b5-col-headers, .b1-col-headers')];
    let entete = entetes[0];
    if (ligne && entetes.length > 1) {
      const y = ligne.getBoundingClientRect().top;
      entetes.forEach(e => { const r = e.getBoundingClientRect(); if (r.height && r.top <= y) entete = e; });
    }
    if (!entete) return [];
    const feuilles = [];
    entete.querySelectorAll('.b5-ch-pill, .b1-ch-pill, .b5-sub-pill, .b1-sub-pill').forEach(el => {
      const estSous = el.matches('.b5-sub-pill, .b1-sub-pill');
      let nom = joliTexte(texte(el));
      if (estSous) {
        // "Programmées" seul n'est pas clair : on le préfixe par l'en-tête parent s'il est court
        const parent = el.closest('.b5-ch-green-wrap, .b5-ch-red-wrap, .b1-ch-blue-wrap');
        const titreParent = parent ? joliTexte(texte(parent.querySelector('.b5-ch-pill, .b1-ch-pill'))) : '';
        if (titreParent && titreParent.length <= 20) nom = `${titreParent} – ${nom}`;
      } else {
        const wrap = el.parentElement;
        if (wrap && wrap !== entete && wrap.querySelector('.b5-sub-pill, .b1-sub-pill')) return;
      }
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      feuilles.push({ nom, gauche: r.left, droite: r.right });
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

  // Structures triées dans l'ordre du parcours, chacune avec son étape
  function structuresOrdonnees(sb) {
    // Thème replié dans le schéma : on le déplie pour pouvoir mesurer les colonnes
    if (window.lisibilite) window.lisibilite.deplierPour(sb.lignes);
    const block = document.getElementById(sb.besoin.blockId);
    // Les cartes doivent être visibles pour mesurer leur position : on déplie la planche si besoin
    if (block && block.classList.contains('is-collapsed') && typeof window.toggleBoardCollapse === 'function') {
      try { window.toggleBoardCollapse(sb.besoin.blockId, false); } catch (e) { /* sans gravité */ }
    }
    const colonnes = block && sb.besoin.blockId !== 'block-besoin-4' ? colonnesEtapes(block, (sb.lignes || [])[0]) : [];
    return sb.structures
      .map((s, ordreSchema) => {
        const idx = etapeDeCarte(s.el, colonnes);
        return Object.assign({}, s, {
          etape: idx === null ? '' : colonnes[idx].nom,
          rang: idx === null ? 999 : idx,
          ordreSchema
        });
      })
      .sort((a, b) => a.rang - b.rang || a.ordreSchema - b.ordreSchema);
  }

  // --------------------------------------------------------
  // 6. Lien avec le schéma (bouton « Voir sur le schéma »)
  // --------------------------------------------------------
  function allerSurPlanche(blockId) {
    if (!blockId) return;
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

  function montrerSurSchema(sb) {
    fermerPanneau(false);
    if (window.lisibilite) window.lisibilite.deplierPour(sb.lignes);
    effacerSurbrillance();
    allerSurPlanche(sb.besoin.blockId);
    const lignes = (sb.lignes || []).filter(Boolean);
    lignes.forEach(l => l.classList.add('wizard-row-highlight'));
    const canvas = document.getElementById('poster-canvas');
    if (canvas) canvas.classList.add('canvas-focused-mode');
    sb.structures.forEach(s => s.el && s.el.classList.add('wizard-highlight'));
    if (lignes.length) {
      setTimeout(() => {
        try { lignes[0].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' }); } catch (e) { /* sans gravité */ }
      }, 450);
    }
  }

  // --------------------------------------------------------
  // 7. Affichage
  // --------------------------------------------------------
  function boite() {
    return document.getElementById('wizard-question-box');
  }

  function filAriane() {
    const morceaux = [`<button class="ob-crumb" data-action="accueil">Accueil</button>`];
    if (state.besoin) {
      morceaux.push(state.ecran === 'liste'
        ? `<span class="ob-crumb-current">${echapper(state.besoin.titre)}</span>`
        : `<button class="ob-crumb" data-action="liste">${echapper(state.besoin.titre)}</button>`);
    }
    if (state.ecran === 'reponse' && state.sousBesoin) {
      morceaux.push(`<span class="ob-crumb-current">${echapper(state.sousBesoin.label)}</span>`);
    }
    return `<nav class="ob-breadcrumb" aria-label="Fil d'Ariane">${morceaux.join('<span class="ob-crumb-sep">›</span>')}</nav>`;
  }

  function ligneBesoin(sb, avecGrandBesoin) {
    return `
      <button class="ob-row" data-sb="${sb._index}" style="${varsCss(sb.besoin)}">
        <span class="ob-row-dot"></span>
        <span class="ob-row-texts">
          <span class="ob-row-label">${echapper(sb.label)}</span>
          ${avecGrandBesoin ? `<span class="ob-row-sub">${picto(sb.besoin.icone, 'ob-picto-inline')} ${echapper(sb.besoin.titre)} · ${echapper(sb.theme)}</span>` : ''}
        </span>
        <span class="ob-row-arrow" aria-hidden="true">›</span>
      </button>`;
  }

  function brancher(conteneur) {
    conteneur.querySelectorAll('[data-sb]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sb = tousLesSousBesoins()[parseInt(btn.dataset.sb, 10)];
        if (sb) afficherReponse(sb);
      });
    });
    conteneur.querySelectorAll('[data-gb]').forEach(btn => {
      btn.addEventListener('click', () => afficherListe(catalogue()[parseInt(btn.dataset.gb, 10)]));
    });
    conteneur.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.action;
        if (a === 'accueil') afficherAccueil();
        if (a === 'liste' && state.besoin) afficherListe(state.besoin);
        if (a === 'schema' && state.sousBesoin) montrerSurSchema(state.sousBesoin);
      });
    });
  }

  function haut() {
    const corps = document.querySelector('#pathway-wizard .wizard-body');
    if (corps) corps.scrollTop = 0;
  }

  // ---------- Écran 1 : accueil ----------
  function afficherAccueil() {
    const box = boite();
    if (!box) return;
    state.ecran = 'accueil';
    state.besoin = null;
    state.sousBesoin = null;
    catalogue();

    box.innerHTML = `
      <div class="ob-screen ob-home">
        <h2 class="ob-question">De quoi la personne a-t-elle besoin ?</h2>
        <div class="ob-search-big">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>
          <input id="ob-search" type="search" placeholder="Tapez un mot : chute, aidant, tutelle, Alzheimer, sortie d'hôpital…" autocomplete="off">
        </div>
        <div id="ob-search-results" class="ob-list ob-search-results"></div>

        <div id="ob-tiles-zone">
          <p class="ob-or">ou choisissez une situation</p>
          <div class="ob-tiles">
            ${catalogue().map((b, i) => `
              <button class="ob-tile" data-gb="${i}" style="${varsCss(b)}">
                <span class="ob-tile-illu"><img src="${b.image}" alt=""></span>
                <span class="ob-tile-texts">
                  <span class="ob-tile-title">${echapper(b.titre)}</span>
                  <span class="ob-tile-text">${echapper(b.phrase)}</span>
                </span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    brancher(box);
    haut();

    const input = document.getElementById('ob-search');
    const res = document.getElementById('ob-search-results');
    const tuiles = document.getElementById('ob-tiles-zone');
    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (q.length < 2) {
        res.innerHTML = '';
        tuiles.style.display = '';
        return;
      }
      tuiles.style.display = 'none';
      const trouves = tousLesSousBesoins().filter(sb => correspond(sb, q));
      res.innerHTML = trouves.length
        ? trouves.slice(0, 25).map(sb => ligneBesoin(sb, true)).join('')
        : `<p class="ob-empty">Aucun résultat pour « ${echapper(q)} ». Essayez un autre mot, ou choisissez une situation.</p>`;
      brancher(res);
    });
    setTimeout(() => input.focus(), 250);
  }

  // ---------- Écran 2 : besoins précis ----------
  function afficherListe(besoin) {
    const box = boite();
    if (!box || !besoin) return;
    state.ecran = 'liste';
    state.besoin = besoin;
    state.sousBesoin = null;

    const themes = besoin.themes.filter(t => !t.estLits);
    const multiThemes = themes.length > 1;

    box.innerHTML = `
      ${filAriane()}
      <div class="ob-screen" style="${varsCss(besoin)}">
        <div class="ob-screen-head">
          <span class="ob-head-illu"><img src="${besoin.image}" alt=""></span>
          <div>
            <h2 class="ob-question">Quel est le besoin précis ?</h2>
            <p class="ob-hint">${echapper(besoin.titre)} · ${echapper(besoin.phrase)}</p>
          </div>
        </div>
        ${themes.map(t => `
          <section class="ob-group">
            ${multiThemes ? `<h3 class="ob-group-title">${echapper(t.nom)}</h3>` : ''}
            <div class="ob-list">${t.sousBesoins.map(sb => ligneBesoin(sb, false)).join('')}</div>
          </section>
        `).join('')}
      </div>
    `;
    brancher(box);
    haut();
  }

  // ---------- Écran 3 : qui contacter ----------
  function afficherReponse(sb) {
    const box = boite();
    if (!box) return;
    state.ecran = 'reponse';
    state.besoin = sb.besoin;
    state.sousBesoin = sb;

    const structures = structuresOrdonnees(sb);
    const estEtablissement = sb.besoin.blockId === 'block-besoin-4';
    const versEhpad = estEtablissement && sb.structures.some(s => /^ehpad-permanent/.test(s.id));
    const themeLits = versEhpad ? sb.besoin.themes.find(t => t.estLits) : null;
    const criteres = estEtablissement ? criteresEtablissement() : [];

    box.innerHTML = `
      ${filAriane()}
      <div class="ob-screen" style="${varsCss(sb.besoin)}">
        <div class="ob-answer-head">
          <span class="ob-answer-kicker">${picto(sb.besoin.icone, 'ob-picto-inline')} ${echapper(sb.besoin.titre)}</span>
          <h2 class="ob-answer-title">${echapper(sb.label)}</h2>
        </div>

        <h3 class="ob-section-title">Qui contacter ?</h3>
        ${structures.length > 1 ? '<p class="ob-hint">Dans l\'ordre du parcours. Cliquez sur une structure pour voir sa fiche et ses contacts.</p>' : '<p class="ob-hint">Cliquez sur la structure pour voir sa fiche et ses contacts.</p>'}
        <ol class="ob-steps">
          ${structures.map((s, i) => `
            <li>
              <button class="ob-struct" data-struct="${sb.structures.indexOf(sb.structures.find(x => x.el === s.el))}">
                <span class="ob-struct-num">${i + 1}</span>
                <span class="ob-struct-body">
                  ${s.etape && (i === 0 || structures[i - 1].etape !== s.etape) ? `<span class="ob-struct-step">${echapper(s.etape)}</span>` : ''}
                  <span class="ob-struct-name">${echapper(s.nom)}</span>
                  ${s.detail ? `<span class="ob-struct-detail">${echapper(s.detail)}</span>` : ''}
                </span>
                <span class="ob-struct-cta">Voir la fiche</span>
              </button>
            </li>
          `).join('')}
        </ol>

        ${themeLits && themeLits.sousBesoins.length ? `
          <h3 class="ob-section-title">Préciser le type de lit en EHPAD</h3>
          <div class="ob-list">${themeLits.sousBesoins.map(x => ligneBesoin(x, false)).join('')}</div>
        ` : ''}

        ${sb.outils.length ? `
          <div class="ob-tools"><span class="ob-tools-label">Outils utiles :</span>${sb.outils.map(o => `<span class="ob-chip">${echapper(o)}</span>`).join('')}</div>
        ` : ''}

        ${criteres.length ? `
          <div class="ob-tools"><span class="ob-tools-label">À évaluer avant toute entrée :</span>${criteres.map(c => `<span class="ob-chip">${echapper(c)}</span>`).join('')}</div>
        ` : ''}

        <div class="ob-actions">
          <button class="ob-btn ob-btn-ghost" data-action="liste">‹ Autre besoin</button>
          <button class="ob-btn ob-btn-ghost" data-action="schema">Voir sur le schéma</button>
          <button class="ob-btn ob-btn-primary" data-action="accueil">Nouvelle recherche</button>
        </div>
      </div>
    `;

    box.querySelectorAll('[data-struct]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = sb.structures[parseInt(btn.dataset.struct, 10)];
        if (s && s.el) s.el.click();
      });
    });
    brancher(box);
    haut();
  }

  // --------------------------------------------------------
  // 8. Ouverture / fermeture
  // --------------------------------------------------------
  function fermerPanneau(effacer) {
    const wizardContainer = document.getElementById('pathway-wizard');
    const toggleBtn = document.getElementById('btn-toggle-wizard');
    const floatBtn = document.getElementById('btn-float-wizard');
    if (!wizardContainer) return;
    state.isOpen = false;
    wizardContainer.classList.remove('open', 'collapsed');
    document.body.classList.remove('ob-is-open');
    if (toggleBtn) toggleBtn.classList.remove('active');
    if (floatBtn) floatBtn.style.display = 'flex';
    if (effacer !== false) effacerSurbrillance();
  }

  function openWizard() {
    const wizardContainer = document.getElementById('pathway-wizard');
    const toggleBtn = document.getElementById('btn-toggle-wizard');
    const floatBtn = document.getElementById('btn-float-wizard');
    if (!wizardContainer) return;

    state.isOpen = true;
    wizardContainer.classList.add('open', 'ob-fullscreen');
    wizardContainer.classList.remove('collapsed');
    document.body.classList.add('ob-is-open');
    if (toggleBtn) toggleBtn.classList.add('active');
    if (floatBtn) floatBtn.style.display = 'none';
    effacerSurbrillance();

    // Si on revient du schéma, on retrouve la même réponse ; sinon on repart de l'accueil
    if (state.ecran === 'accueil' || !state.besoin) {
      state.catalogue = null; // relecture du schéma
      afficherAccueil();
    }
  }

  function closeWizard() {
    fermerPanneau(true);
  }

  let dernierBasculement = 0;
  function toggleWizard() {
    const maintenant = Date.now();
    if (maintenant - dernierBasculement < 300) return;
    dernierBasculement = maintenant;
    if (state.isOpen) closeWizard(); else openWizard();
  }

  function resetWizard() {
    state.catalogue = null;
    afficherAccueil();
  }

  function initPathwayWizard() {
    const wizardContainer = document.getElementById('pathway-wizard');
    if (!wizardContainer) return;
    wizardContainer.classList.add('ob-fullscreen');

    const closeBtn = document.getElementById('wizard-btn-close');
    const resetBtn = document.getElementById('wizard-btn-reset');
    const toggleBtn = document.getElementById('btn-toggle-wizard');
    const floatBtn = document.getElementById('btn-float-wizard');

    if (toggleBtn && !toggleBtn.getAttribute('onclick')) toggleBtn.addEventListener('click', toggleWizard);
    if (floatBtn && !floatBtn.getAttribute('onclick')) floatBtn.addEventListener('click', openWizard);
    if (closeBtn) closeBtn.addEventListener('click', closeWizard);
    if (resetBtn) resetBtn.addEventListener('click', resetWizard);

    // Échap ferme l'écran d'orientation
    // Échap : ferme d'abord la fiche si elle est ouverte, sinon l'écran d'orientation
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const fiche = document.querySelector('#pdf-modal.open');
      if (fiche) {
        const fermer = document.getElementById('pdf-modal-close');
        if (fermer) fermer.click();
        return;
      }
      if (state.isOpen) closeWizard();
    });

    afficherAccueil();
  }

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
