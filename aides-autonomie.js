// ========================================================
// MAINTIEN À DOMICILE — « Aides financières : demande d'aides autonomie »
// Dessine les flèches du bloc (#b5-row-aides) entre les cartes.
// Pour ajouter / retirer une flèche : modifier le tableau FLECHES.
// ========================================================
(function () {
  'use strict';

  // [de, vers, options]  (options.label = petit texte sur la flèche, options.pointilles = flèche en pointillés)
  const FLECHES = [
    // (le crochet « besoin → 4 lieux » et l'éventail « 4 lieux → Cerfa » sont dessinés à part)
    // Le Cerfa est orienté selon les réponses à la question (se lever, s'habiller…)
    ['aides-cerfa', 'aides-rec-caisses', { label: 'OUI : 3 fois ou +', fourche: true }],
    ['aides-cerfa', 'aides-rec-apad', { label: 'NON : 2 fois ou +', fourche: true }],
    // Le CLIC reçoit aussi directement les demandes
    ['aides-info-clic', 'aides-rec-clic'],
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
    ['aides-eval-clic3', 'aides-inst-struct'],   // étiquette GIR posée sur la carte (data-gir)
    ['aides-eval-clic3', 'aides-inst-apad']
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

    const sources = ['aides-info-caisses', 'aides-info-ccas', 'aides-info-uts', 'aides-info-clic'].map(R).filter(Boolean);
    // Crochet : le besoin (1re colonne) mène aux 4 lieux d'information
    const crit = R('b5-crit-aides');
    if (crit && sources.length) {
      const x0 = crit.r + 10;
      const y0 = Math.min(...sources.map(s => s.cy)), y1 = Math.max(...sources.map(s => s.cy));
      const yc = Math.min(Math.max(crit.cy, y0), y1);
      morceaux.push(`<path d="M${crit.r + 2} ${yc} H${x0 - 5} M${x0} ${y0} V${y1}"/>`);
      morceaux.push(`<path d="M${x0 - 5} ${yc} L${x0} ${yc - 5} M${x0 - 5} ${yc} L${x0} ${yc + 5}"/>`);
      sources.forEach(s => morceaux.push(`<path d="M${x0} ${s.cy} H${s.l - 2}" marker-end="url(#aides-pointe)"/>`));
    }
    const point = (x, y) => morceaux.push(`<circle cx="${x}" cy="${y}" r="3" fill="${COULEUR}" stroke="none"/>`);

    // Collecteur : les 4 lieux d'information se rejoignent sur une barre verticale, une seule flèche entre dans le Cerfa
    if (cerfa && sources.length) {
      const xb = (Math.max(...sources.map(s => s.r)) + cerfa.l) / 2;
      const ys = sources.map(s => s.cy).concat(cerfa.cy);
      sources.forEach(s => morceaux.push(`<path d="M${s.r} ${s.cy} H${xb}"/>`));
      morceaux.push(`<path d="M${xb} ${Math.min(...ys)} V${Math.max(...ys)}"/>`);
      morceaux.push(`<path d="M${xb} ${cerfa.cy} H${cerfa.l - 2}" marker-end="url(#aides-pointe)"/>`);
    }

    // Hauteur de passage des flèches : on garde la même ligne d'une carte à l'autre (flèches droites)
    const arrivee = {};
    const dans = (y, a, b) => Math.min(Math.max(y, Math.max(a.t, b.t) + 6), Math.min(a.b, b.b) - 6);
    const recouvre = (a, b) => Math.min(a.b, b.b) - Math.max(a.t, b.t) > 14;

    // Fourche à la sortie du Cerfa (OUI / NON)
    const fourches = FLECHES.filter(f => f[2] && f[2].fourche);
    if (cerfa && fourches.length) {
      const xs = cerfa.r + 14;
      const cibles = fourches.map(f => R(f[1])).filter(Boolean);
      const ys = cibles.map(b => b.cy).concat(cerfa.cy);
      morceaux.push(`<path d="M${cerfa.r} ${cerfa.cy} H${xs} M${xs} ${Math.min(...ys)} V${Math.max(...ys)}"/>`);
      fourches.forEach(([, vers, o]) => {
        const b = R(vers); if (!b) return;
        morceaux.push(`<path d="M${xs} ${b.cy} H${b.l - 2}" marker-end="url(#aides-pointe)"/>`);
        arrivee[vers] = b.cy;
        etiquettes.push({ x: xs + 7, y: b.cy, t: o.label, cls: 'aides-lbl-sombre aides-lbl-gauche' });
      });
    }

    FLECHES.forEach(([de, vers, o = {}]) => {
      if (o.fourche) return;
      const a = R(de), b = R(vers);
      if (!a || !b) return;
      let d;
      if (o.retour) {
        // remonte de l'évaluation vers la réception du circuit du dessus, dans l'espace entre les colonnes
        const xm = (b.r + a.l) / 2;
        const y1 = a.t + 10, y2 = Math.min(b.b - 8, b.cy + 12);
        d = `M${a.l} ${y1} H${xm} V${y2} H${b.r + 2}`;
        if (o.label) etiquettes.push({ x: xm, y: (y1 + y2) / 2, t: o.label, cls: 'aides-lbl-retour aides-lbl-sombre' });
      } else if (recouvre(a, b)) {
        // même ligne : flèche bien droite
        const y = dans(arrivee[de] != null ? arrivee[de] : a.cy, a, b);
        d = `M${a.r} ${y} H${b.l - 2}`;
        arrivee[vers] = y;
        if (de === 'aides-info-clic') point((Math.max(...sources.map(s => s.r)) + cerfa.l) / 2, y);
        if (o.label) etiquettes.push({ x: (a.r + b.l) / 2, y, t: o.label, cls: 'aides-lbl-sombre' });
      } else {
        // fourche à angle droit
        const xm = a.r + Math.min(16, (b.l - a.r) / 2);
        d = `M${a.r} ${a.cy} H${xm} V${b.cy} H${b.l - 2}`;
        arrivee[vers] = b.cy;
      }
      morceaux.push(`<path class="${o.retour ? 'pointilles' : ''}" d="${d}" marker-end="url(#aides-pointe)"/>`);
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
