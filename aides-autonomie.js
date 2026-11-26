// ========================================================
// MAINTIEN À DOMICILE — « Aides financières : demande d'aides autonomie »
// Dessine les flèches du bloc (#b5-row-aides) entre les cartes.
// Pour ajouter / retirer une flèche : modifier le tableau FLECHES.
// ========================================================
(function () {
  'use strict';

  // [de, vers, options]  (options.label = petit texte sur la flèche, options.pointilles = flèche en pointillés)
  const FLECHES = [
    // Les 4 lieux d'information mènent à la demande (Cerfa)
    ['aides-info-caisses', 'aides-cerfa', { bus: true }],
    ['aides-info-ccas', 'aides-cerfa', { bus: true }],
    ['aides-info-uts', 'aides-cerfa', { bus: true }],
    ['aides-info-clic', 'aides-cerfa', { bus: true }],
    // La demande est orientée selon le GIR
    ['aides-cerfa', 'aides-rec-caisses', { depart: 'droite' }],
    ['aides-cerfa', 'aides-rec-apad', { depart: 'droite' }],
    ['aides-cerfa', 'aides-rec-clic', { depart: 'droite' }],
    // Circuit GIR 5-6
    ['aides-rec-caisses', 'aides-eval-struct'],
    ['aides-eval-struct', 'aides-pap'],
    // Circuit GIR 1 à 4
    ['aides-rec-apad', 'aides-eval-ems'],
    ['aides-eval-ems', 'aides-apa', { label: 'GIR 1 à 4' }],
    ['aides-apa', 'aides-ss-apa'],
    ['aides-eval-ems', 'aides-rec-caisses', { label: 'GIR 5-6', retour: true }],
    // Circuit CLIC
    ['aides-rec-clic', 'aides-eval-clic3'],
    ['aides-eval-clic3', 'aides-inst-struct', { label: 'GIR 5-6' }],
    ['aides-eval-clic3', 'aides-inst-apad', { label: 'GIR 1 à 4' }]
  ];

  const COULEUR = '#24467a';

  function dessiner() {
    const bloc = document.getElementById('b5-row-aides');
    if (!bloc) return;
    const rb = bloc.getBoundingClientRect();
    if (!rb.width || !bloc.offsetWidth) return;
    const ech = rb.width / bloc.offsetWidth;
    const R = id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (!r.width) return null;
      return {
        l: (r.left - rb.left) / ech, r: (r.right - rb.left) / ech,
        t: (r.top - rb.top) / ech, b: (r.bottom - rb.top) / ech,
        cy: (r.top + r.height / 2 - rb.top) / ech, cx: (r.left + r.width / 2 - rb.left) / ech
      };
    };

    let svg = bloc.querySelector('svg.aides-fleches');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'aides-fleches');
      svg.setAttribute('aria-hidden', 'true');
      bloc.appendChild(svg);
    }
    const W = bloc.offsetWidth, H = bloc.offsetHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.width = W + 'px';
    svg.style.height = H + 'px';

    const morceaux = [`<defs><marker id="aides-pointe" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="${COULEUR}"/></marker></defs>`];
    const etiquettes = [];
    const cerfa = R('aides-cerfa');

    // « Bus » vertical qui rassemble les 4 lieux d'information vers le Cerfa
    const sources = ['aides-info-caisses', 'aides-info-ccas', 'aides-info-uts', 'aides-info-clic'].map(R).filter(Boolean);
    if (cerfa && sources.length) {
      const xBus = Math.max(...sources.map(s => s.r)) + 9;
      sources.forEach(s => morceaux.push(`<path d="M${s.r} ${s.cy} H${xBus}"/>`));
      const yMin = Math.min(...sources.map(s => s.cy), cerfa.t), yMax = Math.max(...sources.map(s => s.cy));
      morceaux.push(`<path d="M${xBus} ${yMin} V${yMax}"/>`);
      morceaux.push(`<path d="M${xBus} ${cerfa.t + 2} V${cerfa.t + 2}" />`);
    }

    FLECHES.forEach(([de, vers, o = {}]) => {
      if (o.bus) return;
      const a = R(de), b = R(vers);
      if (!a || !b) return;
      let d;
      if (o.retour) {
        // remonte de l'évaluation vers la réception du circuit du dessus
        // part du bord gauche de la carte, remonte dans l'espace entre les deux colonnes
        const xm = (b.r + a.l) / 2 - 4;
        const y1 = a.t + 10, y2 = Math.min(b.b - 8, b.cy + 14);
        d = `M${a.l} ${y1} H${xm} V${y2} H${b.r + 2}`;
        if (o.label) etiquettes.push({ x: xm, y: y1 - 22, t: o.label, cls: 'aides-lbl-retour' });
      } else if (o.depart === 'droite') {
        // du Cerfa vers chaque circuit : sort à droite, puis à l'horizontale
        const xs = a.r, xm = a.r + Math.max(6, (b.l - a.r) / 2);
        const ys = Math.min(Math.max(b.cy, a.t + 6), a.b - 6);
        d = `M${xs} ${ys} H${xm} V${b.cy} H${b.l - 2}`;
      } else if (Math.abs(a.cy - b.cy) < 4) {
        d = `M${a.r} ${b.cy} H${b.l - 2}`;
      } else {
        const xm = (a.r + b.l) / 2;
        d = `M${a.r} ${a.cy} H${xm} V${b.cy} H${b.l - 2}`;
      }
      morceaux.push(`<path class="${o.retour ? 'pointilles' : ''}" d="${d}" marker-end="url(#aides-pointe)"/>`);
      if (o.label && !o.retour) {
        const x = (a.r + b.l) / 2, y = (Math.abs(a.cy - b.cy) < 4 ? b.cy : b.cy) - 1;
        etiquettes.push({ x, y, t: o.label });
      }
    });

    svg.innerHTML = `<g fill="none" stroke="${COULEUR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${morceaux.join('')}</g>`;

    // Étiquettes GIR (HTML, plus nettes)
    bloc.querySelectorAll('.aides-lbl').forEach(e => e.remove());
    etiquettes.forEach(e => {
      const span = document.createElement('span');
      span.className = 'aides-lbl ' + (e.cls || '');
      span.textContent = e.t;
      span.style.left = e.x + 'px';
      span.style.top = e.y + 'px';
      bloc.appendChild(span);
    });
  }

  let minuterie = null;
  const planifier = d => { clearTimeout(minuterie); minuterie = setTimeout(dessiner, d || 120); };

  function init() {
    planifier(300);
    setTimeout(dessiner, 1200);
    setTimeout(dessiner, 2500);
    window.addEventListener('resize', () => planifier(250));
    const bloc = document.getElementById('b5-row-aides');
    if (bloc && typeof ResizeObserver !== 'undefined') new ResizeObserver(() => planifier(80)).observe(bloc);
    new MutationObserver(() => planifier(350)).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.dessinerFlechesAides = dessiner;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
