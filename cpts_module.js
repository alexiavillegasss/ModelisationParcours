// ========================================================
// MODULE CARTE DES CPTS DU VAR & FLYERS OFFICIELS
// Clic sur CPTS -> Carte du territoire du Var
// Seules les 5 CPTS demandées sont cliquables :
// 1. CPTS Vallée du Gapeau
// 2. CPTS Var Provence Méditerranée
// 3. CPTS Toulon Littoral
// 4. CPTS LSTO (Littoral Sud Toulon Ouest)
// 5. CPTS Var Ouest
// ========================================================

const CPTS_DATA_OFFICIAL = {
  "cpts-vallee-gapeau": {
    name: "CPTS Vallée du Gapeau",
    territoire: "Solliès-Pont, Solliès-Toucas, Solliès-Ville, Belgentier, La Farlède",
    image: null,
    pdf: null
  },
  "cpts-var-provence-med": {
    name: "CPTS Var Provence Méditerranée",
    territoire: "La Garde, Le Pradet, Carqueiranne, La Crau, etc.",
    image: null,
    pdf: null
  },
  "cpts-toulon-littoral": {
    name: "CPTS Toulon Littoral",
    territoire: "Toulon et communes littorales",
    image: null,
    pdf: null
  },
  "cpts-lsto": {
    name: "CPTS Littoral Sud Toulon Ouest (LSTO)",
    territoire: "La Seyne-sur-Mer, Six-Fours-les-Plages, Saint-Mandrier-sur-Mer, Ollioules",
    image: null,
    pdf: null
  },
  "cpts-var-ouest": {
    name: "CPTS Var Ouest",
    territoire: "Bandol, Sanary, Saint-Cyr, Le Beausset, Le Castellet, Signes, Evenos, Riboux",
    image: null,
    pdf: null
  }
};

function ensureSimpleCptsModal() {
  let modal = document.getElementById('cpts-simple-modal');
  
  if (!modal) {
    const modalHtml = `
    <div id="cpts-simple-modal" class="crt-s-overlay" style="display: none;" onclick="if (event.target === this) window.closeCptsMapModal()">
      <div class="crt-s-box">
        
        <!-- Barre supérieure simple -->
        <div class="crt-s-header">
          <div class="crt-s-title-group">
            <h3 id="cpts-s-header-title">Carte des CPTS du Var</h3>
            <span id="cpts-s-header-sub">Cliquez sur l'une des 5 CPTS disponibles (Vallée du Gapeau, Var Provence Méditerranée, Toulon Littoral, LSTO, Var Ouest)</span>
          </div>
          <div class="crt-s-header-btns">
            <button id="cpts-s-btn-back" class="crt-s-back-btn" style="display: none;" onclick="window.backToCptsMap()">
              &larr; Revenir à la carte
            </button>
            <button id="cpts-s-btn-close" class="crt-s-close-btn" title="Fermer" onclick="window.closeCptsMapModal()">
              &times;
            </button>
          </div>
        </div>

        <!-- Contenu : Vue Carte -->
        <div id="cpts-s-map-view" class="crt-s-view active">
          <div class="crt-s-map-container">
            <img src="assets/carte_cpts_var.png" alt="Carte des CPTS du Var" class="crt-s-map-img" />

            <!-- Uniquement les 5 CPTS actives et cliquables -->
            <!-- 1. Var Ouest -->
            <div class="cpts-s-zone zone-cpts-varouest" onclick="window.openCptsFlyer('cpts-var-ouest')" data-cpts="cpts-var-ouest" style="top: 46%; left: 23%; width: 16%; height: 29%;" title="Cliquer pour afficher le flyer : CPTS Var Ouest (Bandol, Sanary, Saint-Cyr, Le Beausset, Le Castellet, Signes...)"></div>
            <div class="cpts-s-zone zone-cpts-varouest-leg" onclick="window.openCptsFlyer('cpts-var-ouest')" data-cpts="cpts-var-ouest" style="top: 24.0%; left: 74.0%; width: 23.5%; height: 3.4%;" title="Cliquer pour afficher le flyer : CPTS Var Ouest"></div>

            <!-- 2. LSTO -->
            <div class="cpts-s-zone zone-cpts-lsto" onclick="window.openCptsFlyer('cpts-lsto')" data-cpts="cpts-lsto" style="top: 67%; left: 30%; width: 6.5%; height: 13%;" title="Cliquer pour afficher le flyer : CPTS LSTO (La Seyne-sur-Mer, Six-Fours, Saint-Mandrier, Ollioules...)"></div>
            <div class="cpts-s-zone zone-cpts-lsto-leg" onclick="window.openCptsFlyer('cpts-lsto')" data-cpts="cpts-lsto" style="top: 27.65%; left: 74.0%; width: 23.5%; height: 3.4%;" title="Cliquer pour afficher le flyer : CPTS LSTO"></div>

            <!-- 3. Toulon Littoral -->
            <div class="cpts-s-zone zone-cpts-toulon" onclick="window.openCptsFlyer('cpts-toulon-littoral')" data-cpts="cpts-toulon-littoral" style="top: 71%; left: 34.5%; width: 3.8%; height: 7%;" title="Cliquer pour afficher le flyer : CPTS Toulon Littoral (Toulon)"></div>
            <div class="cpts-s-zone zone-cpts-toulon-leg" onclick="window.openCptsFlyer('cpts-toulon-littoral')" data-cpts="cpts-toulon-littoral" style="top: 31.3%; left: 74.0%; width: 23.5%; height: 3.4%;" title="Cliquer pour afficher le flyer : CPTS Toulon Littoral"></div>

            <!-- 4. Var Provence Méditerranée -->
            <div class="cpts-s-zone zone-cpts-vpm" onclick="window.openCptsFlyer('cpts-var-provence-med')" data-cpts="cpts-var-provence-med" style="top: 65.5%; left: 36.5%; width: 7.5%; height: 13%;" title="Cliquer pour afficher le flyer : CPTS Var Provence Méditerranée (La Garde, Le Pradet, Carqueiranne, La Crau...)"></div>
            <div class="cpts-s-zone zone-cpts-vpm-leg" onclick="window.openCptsFlyer('cpts-var-provence-med')" data-cpts="cpts-var-provence-med" style="top: 34.95%; left: 74.0%; width: 23.5%; height: 3.4%;" title="Cliquer pour afficher le flyer : CPTS Var Provence Méditerranée"></div>

            <!-- 5. Vallée du Gapeau -->
            <div class="cpts-s-zone zone-cpts-gapeau" onclick="window.openCptsFlyer('cpts-vallee-gapeau')" data-cpts="cpts-vallee-gapeau" style="top: 60.5%; left: 35.0%; width: 7.0%; height: 10.0%;" title="Cliquer pour afficher le flyer : CPTS Vallée du Gapeau (Solliès-Pont, Solliès-Toucas, Belgentier, La Farlède...)"></div>
            <div class="cpts-s-zone zone-cpts-gapeau-leg" onclick="window.openCptsFlyer('cpts-vallee-gapeau')" data-cpts="cpts-vallee-gapeau" style="top: 42.3%; left: 74.0%; width: 23.5%; height: 3.4%;" title="Cliquer pour afficher le flyer : CPTS Vallée du Gapeau"></div>

          </div>
        </div>

        <!-- Contenu : Vue Flyer -->
        <div id="cpts-s-flyer-view" class="crt-s-view">
          <div id="cpts-s-flyer-content"></div>
        </div>

      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById('cpts-simple-modal');
  }

  // Événements boutons
  const closeBtn = document.getElementById('cpts-s-btn-close');
  const backBtn = document.getElementById('cpts-s-btn-back');

  if (closeBtn) closeBtn.onclick = closeCptsMapModal;
  if (backBtn) backBtn.onclick = backToCptsMap;

  // Clics sur les zones de la carte
  document.querySelectorAll('.cpts-s-zone').forEach(zone => {
    zone.onclick = () => {
      const cptsId = zone.dataset.cpts;
      if (cptsId) openCptsFlyer(cptsId);
    };
  });
}

function openCptsMapModal(initialCptsId) {
  ensureSimpleCptsModal();
  const modal = document.getElementById('cpts-simple-modal');
  if (!modal) return;

  modal.style.display = 'flex';
  if (initialCptsId && CPTS_DATA_OFFICIAL[initialCptsId]) {
    openCptsFlyer(initialCptsId);
  } else {
    backToCptsMap();
  }
}

function closeCptsMapModal() {
  const modal = document.getElementById('cpts-simple-modal');
  if (modal) modal.style.display = 'none';
}

function backToCptsMap() {
  const mapView = document.getElementById('cpts-s-map-view');
  const flyerView = document.getElementById('cpts-s-flyer-view');
  const backBtn = document.getElementById('cpts-s-btn-back');
  const title = document.getElementById('cpts-s-header-title');
  const sub = document.getElementById('cpts-s-header-sub');

  if (mapView) mapView.classList.add('active');
  if (flyerView) flyerView.classList.remove('active');
  if (backBtn) backBtn.style.display = 'none';

  if (title) title.textContent = "Carte des CPTS du Var";
  if (sub) sub.textContent = "Cliquez sur l'une des 5 CPTS disponibles (Vallée du Gapeau, Var Provence Méditerranée, Toulon Littoral, LSTO, Var Ouest)";
}

function openCptsFlyer(cptsId) {
  ensureSimpleCptsModal();
  const cpts = CPTS_DATA_OFFICIAL[cptsId];
  if (!cpts) return;

  const mapView = document.getElementById('cpts-s-map-view');
  const flyerView = document.getElementById('cpts-s-flyer-view');
  const backBtn = document.getElementById('cpts-s-btn-back');
  const title = document.getElementById('cpts-s-header-title');
  const sub = document.getElementById('cpts-s-header-sub');
  const flyerContainer = document.getElementById('cpts-s-flyer-content');

  if (mapView) mapView.classList.remove('active');
  if (flyerView) flyerView.classList.add('active');
  if (backBtn) backBtn.style.display = 'inline-flex';

  if (title) title.textContent = cpts.name;
  if (sub) sub.textContent = `Plaquette officielle — ${cpts.territoire}`;

  if (flyerContainer) {
    if (cpts.image) {
      flyerContainer.innerHTML = `
        <div class="cfo-wrapper">
          <div class="cfo-toolbar">
            <div class="cfo-info">
              <strong>${cpts.name}</strong> &bull; <span>${cpts.territoire}</span>
            </div>
            <div class="cfo-actions">
              <a href="${cpts.pdf}" download class="cfo-btn-download" target="_blank" title="Télécharger le flyer PDF">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Télécharger le Flyer (PDF)</span>
              </a>
              <a href="${cpts.pdf}" target="_blank" class="cfo-btn-open" title="Ouvrir le PDF en pleine page">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                <span>Ouvrir PDF plein écran</span>
              </a>
            </div>
          </div>

          <div class="cfo-img-container" style="padding: 16px; background:#1e293b; display:flex; justify-content:center; overflow-y:auto;">
            <img src="${cpts.image}" alt="Flyer officiel ${cpts.name}" style="max-width:100%; width:100%; height:auto; border-radius:8px; box-shadow:0 12px 35px rgba(0,0,0,0.4);" />
          </div>
        </div>
      `;
    } else {
      flyerContainer.innerHTML = `
        <div class="cfo-wrapper" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:480px; text-align:center; padding:40px; background:#f8fafc;">
          <div style="font-size: 3.5rem; margin-bottom: 16px; opacity: 0.75;">📄</div>
          <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 1.3rem; font-weight:700;">Pas de flyer disponible pour le moment</h3>
          <p style="color: #64748b; font-size: 0.95rem; margin: 0 0 24px 0; max-width: 480px; line-height:1.5;">Le flyer officiel pour la <strong>${cpts.name}</strong> (${cpts.territoire}) n'a pas encore été renseigné.</p>
          <button onclick="window.backToCptsMap()" class="btn btn-sm btn-outline" style="cursor:pointer; padding: 8px 16px; border-radius: 6px; border: 1.5px solid #cbd5e1; background: #fff; font-weight:600; color:#1e293b;">&larr; Revenir à la carte des CPTS</button>
        </div>
      `;
    }
    flyerView.scrollTop = 0;
  }
}

// Exposition immédiate sur window
window.openCptsMapModal = openCptsMapModal;
window.closeCptsMapModal = closeCptsMapModal;
window.backToCptsMap = backToCptsMap;
window.openCptsFlyer = openCptsFlyer;
window.ensureSimpleCptsModal = ensureSimpleCptsModal;

// Initialisation dès que possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensureSimpleCptsModal);
} else {
  ensureSimpleCptsModal();
}
