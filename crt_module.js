// ========================================================
// MODULE CARTE DES CRT DU VAR & FLYERS OFFICIELS DAC
// Clic sur CRT -> Carte du territoire
// Clic sur la carte -> Flyer officiel au format DAC Var Ouest
// ========================================================

const CRT_DATA_OFFICIAL = {
  "crt-mar-vivo": {
    name: "CRT Mar Vivo",
    porteur: "LNA Santé - Résidence Les Jardins de Mar Vivo (La Seyne-sur-Mer)",
    image: "assets/flyers/CRT_-_Mar_Vivo.png",
    pdf: "assets/flyers/CRT_-_Mar_Vivo.pdf"
  },
  "crt-felix-pey": {
    name: "CRT Félix Pey",
    porteur: "EHPAD Public Félix Pey (Solliès-Pont)",
    image: "assets/flyers/CRT_-_Felix_Pey.png",
    pdf: "assets/flyers/CRT_-_Felix_Pey.pdf"
  },
  "crt-chits": {
    name: "CRT Clémenceau (CHITS)",
    porteur: "CHITS - Hôpital Clemenceau (La Garde)",
    image: "assets/flyers/CRT_-_Clemenceau.png",
    pdf: "assets/flyers/CRT_-_Clemenceau.pdf"
  }
};

function ensureSimpleCrtModal() {
  if (document.getElementById('crt-simple-modal')) return;

  const modalHtml = `
  <div id="crt-simple-modal" class="crt-s-overlay" style="display: none;">
    <div class="crt-s-box">
      
      <!-- Barre supérieure simple -->
      <div class="crt-s-header">
        <div class="crt-s-title-group">
          <h3 id="crt-s-header-title">Carte des CRT du Var</h3>
          <span id="crt-s-header-sub">Cliquez sur l'un des 3 CRT disponibles (Félix Pey, Mar Vivo ou Clémenceau)</span>
        </div>
        <div class="crt-s-header-btns">
          <button id="crt-s-btn-back" class="crt-s-back-btn" style="display: none;">
            &larr; Revenir à la carte
          </button>
          <button id="crt-s-btn-close" class="crt-s-close-btn" title="Fermer">
            &times;
          </button>
        </div>
      </div>

      <!-- Contenu : Vue Carte -->
      <div id="crt-s-map-view" class="crt-s-view active">
        <div class="crt-s-map-container">
          <img src="assets/carte_crt_var_clean.png" alt="Carte des CRT du Var" class="crt-s-map-img" />

          <!-- Uniquement les 3 CRT actifs et cliquables -->
          <!-- 1. Mar Vivo (Rose) -->
          <div class="crt-s-zone zone-marvivo" data-crt="crt-mar-vivo" style="top: 80%; left: 45%; width: 9%; height: 18%;" title="Cliquer pour afficher le flyer : CRT Mar Vivo (La Seyne, Six-Fours, Toulon Ouest...)"></div>
          <div class="crt-s-zone zone-marvivo-inset" data-crt="crt-mar-vivo" style="top: 76%; left: 26%; width: 9%; height: 18%;" title="Cliquer pour afficher le flyer : CRT Mar Vivo"></div>
          <div class="crt-s-zone zone-marvivo-leg" data-crt="crt-mar-vivo" style="top: 10.5%; left: 69%; width: 19%; height: 4.8%;" title="Cliquer pour afficher le flyer : CRT Mar Vivo"></div>

          <!-- 2. Félix Pey (Ocre) -->
          <div class="crt-s-zone zone-felixpey" data-crt="crt-felix-pey" style="top: 62%; left: 52%; width: 15%; height: 24%;" title="Cliquer pour afficher le flyer : CRT Félix Pey (Vallée du Gapeau - 8 communes)"></div>
          <div class="crt-s-zone zone-felixpey-leg" data-crt="crt-felix-pey" style="top: 20.5%; left: 69%; width: 19%; height: 4.8%;" title="Cliquer pour afficher le flyer : CRT Félix Pey"></div>

          <!-- 3. CHITS / Clémenceau (Cyan) -->
          <div class="crt-s-zone zone-chits" data-crt="crt-chits" style="top: 78%; left: 51%; width: 8%; height: 14%;" title="Cliquer pour afficher le flyer : CRT Clémenceau (CHITS Toulon Métropole)"></div>
          <div class="crt-s-zone zone-chits-inset" data-crt="crt-chits" style="top: 80%; left: 31%; width: 9%; height: 15%;" title="Cliquer pour afficher le flyer : CRT Clémenceau (CHITS)"></div>
          <div class="crt-s-zone zone-chits-leg" data-crt="crt-chits" style="top: 25.5%; left: 69%; width: 19%; height: 4.8%;" title="Cliquer pour afficher le flyer : CRT Clémenceau (CHITS)"></div>
        </div>
      </div>

      <!-- Contenu : Vue Flyer -->
      <div id="crt-s-flyer-view" class="crt-s-view">
        <div id="crt-s-flyer-content"></div>
      </div>

    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Événements
  const overlay = document.getElementById('crt-simple-modal');
  const closeBtn = document.getElementById('crt-s-btn-close');
  const backBtn = document.getElementById('crt-s-btn-back');

  if (closeBtn) closeBtn.addEventListener('click', closeCrtMapModal);
  if (backBtn) backBtn.addEventListener('click', backToCrtMap);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCrtMapModal();
    });
  }

  // Clics sur les zones de la carte
  document.querySelectorAll('.crt-s-zone').forEach(zone => {
    zone.addEventListener('click', () => {
      const crtId = zone.dataset.crt;
      if (crtId) openCrtFlyer(crtId);
    });
  });
}

function openCrtMapModal(initialCrtId) {
  ensureSimpleCrtModal();
  const modal = document.getElementById('crt-simple-modal');
  if (!modal) return;

  modal.style.display = 'flex';
  if (initialCrtId && CRT_DATA_OFFICIAL[initialCrtId]) {
    openCrtFlyer(initialCrtId);
  } else {
    backToCrtMap();
  }
}

function closeCrtMapModal() {
  const modal = document.getElementById('crt-simple-modal');
  if (modal) modal.style.display = 'none';
}

function backToCrtMap() {
  const mapView = document.getElementById('crt-s-map-view');
  const flyerView = document.getElementById('crt-s-flyer-view');
  const backBtn = document.getElementById('crt-s-btn-back');
  const title = document.getElementById('crt-s-header-title');
  const sub = document.getElementById('crt-s-header-sub');

  if (mapView) mapView.classList.add('active');
  if (flyerView) flyerView.classList.remove('active');
  if (backBtn) backBtn.style.display = 'none';

  if (title) title.textContent = "Carte des CRT du Var";
  if (sub) sub.textContent = "Cliquez sur l'un des 3 CRT disponibles (Félix Pey, Mar Vivo ou Clémenceau)";
}

function openCrtFlyer(crtId) {
  ensureSimpleCrtModal();
  const crt = CRT_DATA_OFFICIAL[crtId];
  if (!crt) return;

  const mapView = document.getElementById('crt-s-map-view');
  const flyerView = document.getElementById('crt-s-flyer-view');
  const backBtn = document.getElementById('crt-s-btn-back');
  const title = document.getElementById('crt-s-header-title');
  const sub = document.getElementById('crt-s-header-sub');
  const flyerContainer = document.getElementById('crt-s-flyer-content');

  if (mapView) mapView.classList.remove('active');
  if (flyerView) flyerView.classList.add('active');
  if (backBtn) backBtn.style.display = 'inline-flex';

  if (title) title.textContent = crt.name;
  if (sub) sub.textContent = `Plaquette officielle - ${crt.porteur}`;

  if (flyerContainer) {
    if (crt.image) {
      flyerContainer.innerHTML = `
        <div class="cfo-wrapper">
          <div class="cfo-toolbar">
            <div class="cfo-info">
              <strong>${crt.name}</strong> &bull; <span>${crt.porteur}</span>
            </div>
            <div class="cfo-actions">
              <a href="${crt.pdf}?v=${Date.now()}" download class="cfo-btn-download" target="_blank" title="Télécharger le flyer PDF">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Télécharger le Flyer (PDF)</span>
              </a>
              <a href="${crt.pdf}?v=${Date.now()}" target="_blank" class="cfo-btn-open" title="Ouvrir le PDF en pleine page">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                <span>Ouvrir PDF plein écran</span>
              </a>
            </div>
          </div>

          <div class="cfo-img-container" style="padding: 16px; background:#1e293b; display:flex; justify-content:center; overflow-y:auto;">
            <img src="${crt.image}?v=${Date.now()}" alt="Flyer officiel ${crt.name}" style="max-width:100%; width:100%; height:auto; border-radius:8px; box-shadow:0 12px 35px rgba(0,0,0,0.4);" />
          </div>
        </div>
      `;
    } else {
      flyerContainer.innerHTML = `
        <div class="cfo-wrapper" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:480px; text-align:center; padding:40px; background:#f8fafc;">
          <div style="font-size: 3.5rem; margin-bottom: 16px; opacity: 0.75;">📄</div>
          <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 1.3rem; font-weight:700;">Pas de flyer disponible pour le moment</h3>
          <p style="color: #64748b; font-size: 0.95rem; margin: 0 0 24px 0; max-width: 440px; line-height:1.5;">Le flyer officiel pour le territoire de <strong>${crt.name}</strong> n'a pas encore été renseigné.</p>
          <button onclick="window.backToCrtMap()" class="btn btn-sm btn-outline" style="cursor:pointer; padding: 8px 16px; border-radius: 6px; border: 1.5px solid #cbd5e1; background: #fff; font-weight:600; color:#1e293b;">&larr; Revenir à la carte des CRT</button>
        </div>
      `;
    }
    flyerView.scrollTop = 0;
  }
}

// Initialisation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensureSimpleCrtModal);
} else {
  ensureSimpleCrtModal();
}

// Global
window.openCrtMapModal = openCrtMapModal;
window.closeCrtMapModal = closeCrtMapModal;
window.openCrtFlyer = openCrtFlyer;
window.backToCrtMap = backToCrtMap;

// ========================================================
// GENERATEUR DE FICHE MEMO DAC OFFICIELLE (HTML DYNAMIQUE)
// ========================================================
function generateMemoDacHtml(struct) {
  const nom = struct.nom || 'Structure';
  const sigle = struct.sigle || '';
  const role = struct.role || '';
  const desc = struct.description || 'Orientation et accompagnement des personnes âgées et de leurs aidants.';
  const contact = struct.contact || 'DAC Var Ouest - 04 94 00 00 00';
  const horaires = struct.horaires || 'Du lundi au vendredi : 8h30 - 17h30';
  const secteur = struct.secteur || 'Bassin Ouest Toulonnais & Var Ouest';
  const equipe = struct.equipe || 'Équipe pluriprofessionnelle spécialisée';
  const publicCible = struct.public_cible || 'Personnes âgées de 60 ans et +';
  const criteres = struct.criteres && struct.criteres !== '-' ? struct.criteres : 'Perte d\'autonomie, situation complexe, besoin de répit ou de coordination';
  const modeAcces = struct.mode_acces || 'Médecins traitants, spécialistes, DAC, CLIC, services hospitaliers, entourage';
  const actionAidants = struct.action_aidants || 'Information, soutien psychologique, répit et formation des proches aidants.';
  const outil = struct.outil || 'Via Trajectoire / Formulaire d\'orientation DAC';

  return `
    <div class="memo-dac-card">
      <!-- En-tête officiel DAC -->
      <div class="mdc-header">
        <div class="mdc-logo-area">
          <img src="assets/logo_dac_clean.png" alt="DAC Var Ouest" class="mdc-logo" onerror="this.src='assets/logo_dac.png';" />
        </div>
        <div class="mdc-title-area">
          <div class="mdc-title-main">FILIÈRE GÉRIATRIQUE DE TERRITOIRE &bull; <span>BASSIN TOULON & VAR OUEST</span></div>
          <div class="mdc-title-sub">L'offre de services des acteurs de la ville</div>
        </div>
      </div>
      <div class="mdc-tricolor-bar"></div>

      <!-- Corps à 2 colonnes -->
      <div class="mdc-grid">
        <!-- COLONNE GAUCHE -->
        <div class="mdc-col-left">
          <!-- Carte bleue Structure -->
          <div class="mdc-blue-box">
            <div class="mdc-field-label">Structure</div>
            <div class="mdc-field-value bold">${nom} ${sigle && sigle !== nom ? `(${sigle})` : ''}</div>
            
            <div class="mdc-field-label" style="margin-top: 8px;">Nom du service / dispositif porté par la structure</div>
            <div class="mdc-field-value">${role || desc.slice(0, 100)}</div>
          </div>

          <!-- Grille 6 contacts / organisation -->
          <div class="mdc-contacts-grid">
            <div class="mdc-item">
              <span class="mdc-num-badge">1</span>
              <div class="mdc-item-content">
                <strong>Contact</strong>
                <div>${contact}</div>
              </div>
            </div>

            <div class="mdc-item">
              <span class="mdc-num-badge">2</span>
              <div class="mdc-item-content">
                <strong>Référent opérationnel</strong>
                <div>Coordination gérontologique</div>
              </div>
            </div>

            <div class="mdc-item">
              <span class="mdc-num-badge">3</span>
              <div class="mdc-item-content">
                <strong>Site internet</strong>
                <div><a href="https://cassi.sante-paca.fr/recherche?q=${encodeURIComponent(nom)}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: 700;">Consulter sur CASSI &rarr;</a></div>
              </div>
            </div>

            <div class="mdc-item">
              <span class="mdc-num-badge">4</span>
              <div class="mdc-item-content">
                <strong>Horaires</strong>
                <div>${horaires}</div>
              </div>
            </div>

            <div class="mdc-item">
              <span class="mdc-num-badge">5</span>
              <div class="mdc-item-content">
                <strong>Secteur d'intervention</strong>
                <div>${secteur}</div>
              </div>
            </div>

            <div class="mdc-item">
              <span class="mdc-num-badge">6</span>
              <div class="mdc-item-content">
                <strong>Composition de l'équipe</strong>
                <div>${equipe}</div>
              </div>
            </div>
          </div>

          <!-- Badge Public -->
          <div class="mdc-public-bar">
            <span class="mdc-public-pill">PUBLIC</span>
            <label class="mdc-radio-label"><span class="mdc-dot"></span> 60 ans et +</label>
            <label class="mdc-radio-label"><span class="mdc-dot outline"></span> 75 ans et +</label>
            <label class="mdc-radio-label"><span class="mdc-dot outline"></span> Autre</label>
          </div>

          <!-- 7. Type de patient -->
          <div class="mdc-section-box">
            <div class="mdc-box-header">
              <span class="mdc-num-badge cyan">7</span>
              <strong>Type de patient auquel s'adresse ce service / dispositif</strong>
            </div>
            <div class="mdc-box-body">
              ${publicCible}. ${criteres}
            </div>
          </div>
        </div>

        <!-- COLONNE DROITE -->
        <div class="mdc-col-right">
          <!-- 8. Professionnels adresseurs -->
          <div class="mdc-section-box pink">
            <div class="mdc-box-header">
              <span class="mdc-num-badge red">8</span>
              <strong>Professionnels pouvant orienter vers ce service / dispositif</strong>
            </div>
            <div class="mdc-box-body mdc-split-8">
              <div>
                <span class="mdc-sub-label">Professionnels adresseurs</span>
                <p>${modeAcces}</p>
              </div>
              <div class="mdc-modalites">
                <span class="mdc-sub-label">Modalités de contact</span>
                <div><span class="mdc-dot small"></span> ${outil}</div>
                <div><span class="mdc-dot small"></span> Mail / Téléphone</div>
              </div>
            </div>
          </div>

          <!-- 9. Déroulement de la prise en charge -->
          <div class="mdc-section-box yellow">
            <div class="mdc-box-header">
              <span class="mdc-num-badge yellow">9</span>
              <strong>Déroulement d'un accompagnement / une prise en charge</strong>
            </div>
            <div class="mdc-box-body lined">
              <p>${desc}</p>
              
              <div class="mdc-cassi-tags-group">
                <span class="mdc-cassi-title">Tags CASSI :</span>
                <span class="mdc-cassi-tag">${nom}</span>
                ${sigle && sigle !== nom ? `<span class="mdc-cassi-tag">${sigle}</span>` : ''}
                <span class="mdc-cassi-tag">Var Ouest</span>
                <span class="mdc-cassi-tag">Filière Gériatrique</span>
              </div>

              <div class="mdc-partenaires">
                <strong>Partenaires relais :</strong> DAC Var Ouest, CPTS, Équipes Hospitalières, CLIC, Professionnels libéraux.
              </div>
            </div>
          </div>

          <!-- 10. Action pour les aidants -->
          <div class="mdc-section-box yellow-light">
            <div class="mdc-box-header">
              <span class="mdc-num-badge yellow">10</span>
              <strong>Action spécifique pour les aidants</strong>
            </div>
            <div class="mdc-box-body">
              ${actionAidants}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// OUVERTURE UNIFIEE DU MEMO DAC POUR TOUTES LES STRUCTURES
// ========================================================
function openStructureMemoDac(idOrStruct, card) {
  ensureSimpleCrtModal();
  let id = typeof idOrStruct === 'string' ? idOrStruct : (idOrStruct && idOrStruct.id);
  
  let struct = typeof idOrStruct === 'object' ? idOrStruct : null;
  if (!struct && window.appData && window.appData.structures) {
    struct = window.appData.structures.find(s => s.id === id);
  }
  if (!struct && window.APP_INITIAL_DATA && window.APP_INITIAL_DATA.structures) {
    struct = window.APP_INITIAL_DATA.structures.find(s => s.id === id);
  }

  // Si c'est un CRT
  const isCrt = (id && id.startsWith('crt')) || (window.STRUCTURE_DOC_MAPPING && window.STRUCTURE_DOC_MAPPING[id] === 'CRT_MAP');
  if (isCrt) {
    // Par défaut, ouvrir Mar Vivo (ou le CRT spécifique)
    let crtKey = (id && CRT_DATA_OFFICIAL[id]) ? id : 'crt-mar-vivo';
    openCrtFlyer(crtKey);
    return;
  }

  // Titre et informations
  let title = (struct && (struct.nom || struct.sigle)) || '';
  if (!title && card) {
    title = card.querySelector('.card-title')?.textContent.trim() || 
            card.querySelector('.card-sigle')?.textContent.trim() || 
            card.textContent.trim();
  }
  if (!title) title = id || 'Structure';

  const porteur = (struct && struct.role) || 'Acteur de santé du territoire';

  // Flyer PDF de la structure
  let docFile = (struct && struct.pdf_filename) || (window.STRUCTURE_DOC_MAPPING && window.STRUCTURE_DOC_MAPPING[id]);
  if (!docFile && id) {
    docFile = `fiche_${id}.pdf`;
  }
  let docUrl = '';
  if (docFile) {
    docUrl = (docFile.startsWith('http') || docFile.startsWith('assets/')) ? docFile : `assets/flyers/${docFile}`;
  }

  // Image spécifique pré-existante dans assets ?
  const assetImages = {
    'adnp': 'assets/flyer_adnp.png',
    'oncogeriatrie': 'assets/flyer_adnp.png',
    'consult-geriatrie': 'assets/flyer_consultation_geriatrie.png'
  };
  const specificImg = assetImages[id];

  const modal = document.getElementById('crt-simple-modal');
  const mapView = document.getElementById('crt-s-map-view');
  const flyerView = document.getElementById('crt-s-flyer-view');
  const backBtn = document.getElementById('crt-s-btn-back');
  const modalTitle = document.getElementById('crt-s-header-title');
  const modalSub = document.getElementById('crt-s-header-sub');
  const flyerContainer = document.getElementById('crt-s-flyer-content');

  if (!modal) return;
  modal.style.display = 'flex';

  if (mapView) mapView.classList.remove('active');
  if (flyerView) flyerView.classList.add('active');
  if (backBtn) backBtn.style.display = 'none';

  if (modalTitle) modalTitle.textContent = title;
  if (modalSub) modalSub.textContent = `Mémo DAC Var Ouest - ${porteur}`;

  const cassiQuery = encodeURIComponent(title.replace(/\s*\([^)]*\)/g, '').trim());
  const cassiUrl = `https://cassi.sante-paca.fr/recherche?q=${cassiQuery}`;

  if (flyerContainer) {
    flyerContainer.innerHTML = `
      <div class="cfo-wrapper">
        <div class="cfo-toolbar">
          <div class="cfo-info">
            <strong>${title}</strong> &bull; <span>${porteur}</span>
          </div>
          <div class="cfo-actions">
            ${docUrl ? `
              <a href="${docUrl}" target="_blank" download class="cfo-btn-download" title="Télécharger ou afficher le flyer PDF de la structure">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Voir le Flyer (PDF)</span>
              </a>
            ` : `
              <span class="cfo-btn-disabled" title="Aucun flyer spécifique fourni pour cette structure">
                <span>Flyer non disponible</span>
              </span>
            `}
            <a href="${cassiUrl}" target="_blank" rel="noopener noreferrer" class="cfo-btn-cassi" title="Rechercher cette structure sur l'annuaire régional CASSI (ARS PACA)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span>Consulter sur CASSI</span>
            </a>
          </div>
        </div>

        ${specificImg ? `
          <div class="cfo-img-container">
            <img src="${specificImg}" alt="Mémo DAC ${title}" class="cfo-flyer-img" />
          </div>
        ` : `
          <div class="cfo-memo-container">
            ${generateMemoDacHtml(struct || { nom: title, role: porteur, id: id })}
          </div>
        `}
      </div>
    `;
    flyerView.scrollTop = 0;
  }
}

// Exposer globalement
window.openStructureMemoDac = openStructureMemoDac;
