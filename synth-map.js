// ========================================================
// VUE SYNTHÉTIQUE : carte d'ensemble (reprise de l'animation Parcours PA)
// Un clic sur une carte ouvre la planche correspondante, comme les boutons
// de la barre « Planches ».
// ========================================================
(function () {
  'use strict';

  function ouvrirPlanche(boardId) {
    const bouton = document.querySelector(`.nav-planche-btn[data-target="${boardId}"]`);
    if (bouton) {
      bouton.click();
    } else if (typeof window.zoomOnBoard === 'function') {
      document.body.classList.remove('mode-synthetic-view');
      window.zoomOnBoard(boardId);
    }
  }

  function init() {
    const carte = document.getElementById('synth-map');
    if (!carte) return;

    carte.addEventListener('click', e => {
      const cible = e.target.closest('[data-board]');
      if (!cible) return;
      e.preventDefault();
      e.stopPropagation();
      ouvrirPlanche(cible.dataset.board);
    });

    carte.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const cible = e.target.closest('[data-board]');
      if (!cible) return;
      e.preventDefault();
      ouvrirPlanche(cible.dataset.board);
    });

    // Empêche le glisser-déplacer du schéma de démarrer depuis la carte
    carte.addEventListener('mousedown', e => e.stopPropagation());
    carte.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
