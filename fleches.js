// ========================================================
// NETTOYAGE DES FLÈCHES DES PLANCHES
// Une flèche de ligne (.b5-arrow-cell / .b1-arrow-cell) qui n'aboutit sur
// aucune structure (ex. ligne « Oncogériatrie » encore vide) est masquée :
// sinon elle traverse la planche et pointe dans le vide.
// Dès qu'une structure est ajoutée au bout de la ligne, la flèche réapparaît.
// ========================================================
(function () {
  'use strict';

  const CIBLES = '.sch-card, .b5-pill, .b1-pill, .b5-col-stack, .b5-inline-pills, .b5-pill-flow, .b1-pill-flow, .b1-stack, .b5-vt-badge, .b1-vt-badge, .dual-struct-block';

  function nettoyer() {
    document.querySelectorAll('.b5-arrow-cell, .b1-arrow-cell').forEach(cellule => {
      const ligne = cellule.closest('.b5-row, .b1-row');
      if (!ligne) return;

      // On réaffiche d'abord la flèche pour pouvoir la mesurer
      cellule.classList.remove('fleche-sans-cible');
      const r = cellule.getBoundingClientRect();
      if (!r.width || !r.height) return; // planche repliée ou masquée : on ne touche à rien

      const tolerance = Math.max(6, r.height * 0.5);
      const aUneCible = Array.from(ligne.querySelectorAll(CIBLES)).some(el => {
        if (cellule.contains(el) || el.contains(cellule)) return false;
        const c = el.getBoundingClientRect();
        if (!c.width) return false;
        // La cible commence juste au bout de la flèche
        return c.left >= r.right - tolerance && c.left <= r.right + 40;
      });

      if (!aUneCible) cellule.classList.add('fleche-sans-cible');
    });
  }

  // Entrée en établissement : fourches « profil → critères » recalculées pour que
  // chaque branche arrive exactement à hauteur de sa ligne (quel que soit le nombre de lignes)
  function alignerFourchesB4() {
    document.querySelectorAll('#block-besoin-4 .b4-tree-group').forEach(groupe => {
      const svg = groupe.querySelector('.b4-fork-icon svg');
      const profil = groupe.querySelector('.b4-profil-card');
      const lignes = Array.from(groupe.querySelectorAll('.b4-branches-col > .b4-branch-row'));
      if (!svg || !profil || !lignes.length) return;
      const rs = svg.getBoundingClientRect();
      if (!rs.height || !rs.width) return;
      const ech = rs.width / 24;                       // échelle écran de la fourche
      const y = el => { const r = el.getBoundingClientRect(); return (r.top + r.height / 2 - rs.top) / ech; };
      const H = rs.height / ech;
      const yProfil = Math.min(Math.max(y(profil), 2), H - 2);
      const ys = lignes.map(y);
      const yMin = Math.min(yProfil, ...ys), yMax = Math.max(yProfil, ...ys);
      let d = `M0 ${yProfil.toFixed(1)} H12`;
      if (ys.length > 1 || Math.abs(ys[0] - yProfil) > 1) d += ` M12 ${yMin.toFixed(1)} V${yMax.toFixed(1)}`;
      ys.forEach(v => { d += ` M12 ${v.toFixed(1)} H21`; });
      const pointes = ys.map(v => `<polygon points="19,${(v - 3).toFixed(1)} 24,${v.toFixed(1)} 19,${(v + 3).toFixed(1)}" fill="#334155"/>`).join('');
      svg.setAttribute('viewBox', `0 0 24 ${H.toFixed(1)}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.innerHTML = `<path d="${d}" stroke="#334155" stroke-width="2.5" stroke-linecap="round" fill="none" vector-effect="non-scaling-stroke"/>${pointes}`;
    });
  }

  function toutRecalculer() {
    nettoyer();
    alignerFourchesB4();
  }

  let minuterie = null;
  function planifier(delai) {
    clearTimeout(minuterie);
    minuterie = setTimeout(toutRecalculer, delai || 150);
  }

  function init() {
    planifier(600);
    setTimeout(toutRecalculer, 1800);
    window.addEventListener('resize', () => planifier(300));
    // Repasser quand on quitte la vue synthétique ou qu'une planche est dépliée / mise en plein écran
    new MutationObserver(() => planifier(400)).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.nettoyerFleches = toutRecalculer;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
