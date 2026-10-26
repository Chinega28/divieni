/* ==========================================================================
   DIVENIÉ — moteur applicatif (vanilla, sans dépendance)
   Routage par chapitres (hash), rendus dynamiques, frise administrative,
   carte schématique interactive, parallax, révélations au défilement.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.DIVENIE;
  var outils = D.outils;
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  /* ------------------------------------------------------------- utilitaires */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function ech(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(v) {
    if (!v) return '';
    var p = outils.precision(v);
    if (p === 'j') { var j = v.split('/'); return (+j[0]) + ' ' + MOIS[(+j[1]) - 1] + ' ' + j[2]; }
    if (p === 'm') { var m = v.split('/'); return MOIS[(+m[0]) - 1] + ' ' + m[1]; }
    return v;
  }
  function periode(e) {
    return e.enCours ? 'depuis ' + fmtDate(e.debut) : fmtDate(e.debut) + ' → ' + fmtDate(e.fin);
  }
  function libelleMois(m) {
    if (m === 0) return 'un jour';
    var a = Math.floor(m / 12), r = m % 12;
    if (a && r) return a + ' an' + (a > 1 ? 's' : '') + ' ' + r + ' mois';
    if (a) return a + ' an' + (a > 1 ? 's' : '');
    return r + ' mois';
  }
  var ihm = { chapitres: D.chapitres, index: 0 };

  /* ================================================================== */
  /* RENDU DES CHAPITRES                                                 */
  /* ================================================================== */

  function cadre(interne) {
    return '<div class="corps"><div class="cadre"><div class="grille">' + interne + '</div></div></div>';
  }
  function entete(num, kicker, classe) {
    return '<div class="' + (classe || '') + '"><p class="chapeau rv">' + ech(num) + ' — ' + ech(kicker) + '</p></div>';
  }

  /* ---------------------------------------------------------- 02 · Atlas */
  function renduAtlas() {
    var limites = D.limites.map(function (l) {
      return '<div class="limite rv"><span class="limite__cap">' + ech(l.cap) + '</span>' +
        '<span class="limite__voisin">' + ech(l.voisin) + '</span>' +
        '<span class="limite__detail">' + ech(l.detail || '—') + '</span></div>';
    }).join('');

    var html = cadre(
      '<div class="atlas__intro">' +
        entete('02', 'Géographie') +
        '<h1 class="titre titre--md rv" style="--d:60">Un district<em> carrefour</em></h1>' +
        '<p class="lead letrine rv" style="--d:120;margin-top:22px">Au sud-ouest du département du Niari, Divenié touche du regard la frontière gabonaise. Cinq axes routiers rayonnent depuis la cité et desservent quarante-cinq villages et hameaux, du paysannat de la Nyanga, à l’ouest, jusqu’aux villages de l’axe Kalla, au nord-est.</p>' +
        '<div class="limites">' + limites + '</div>' +
      '</div>' +
      '<div class="atlas__aside">' +
        '<p class="sous-titre rv" style="--d:180">« Limitée au Nord par le Gabon, au Sud par Kibangou, à l’Ouest par Nyanga, à l’Est par Moungoundou-sud. »</p>' +
        '<p class="mono muet rv" style="--d:220;margin-top:18px">Divenié · District · Niari<br>45 villages &amp; hameaux · 5 axes</p>' +
      '</div>' +
      '<div class="atlas__carte-zone rv">' +
        '<div class="carte" id="carte">' +
          '<span class="carte__titre">Carte schématique — sans échelle</span>' +
          '<div class="filtres" id="filtresAxes"></div>' +
          svgCarte() +
          '<div class="fiche" id="fiche" role="status"></div>' +
          '<div class="carte__legende">● village&nbsp;&nbsp;■ hameau&nbsp;&nbsp;— axe routier<br>Les positions sont indicatives, non géométriques.</div>' +
        '</div>' +
      '</div>' +
      '<div class="mention mention--gauche mention--bas">Chap. 02 — Atlas</div>'
    );
    return html;
  }

  function svgCarte() {
    var s = '';
    s += '<svg viewBox="0 0 100 62" role="img" aria-label="Carte schématique du district de Divenié">';
    s += '<defs><pattern id="hachure" width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">' +
      '<line x1="0" y1="0" x2="0" y2="4" stroke="#101612" stroke-width="0.5" opacity="0.4"/></pattern></defs>';
    s += '<rect x="0" y="0" width="100" height="7.5" fill="url(#hachure)" opacity="0.55"/>';
    s += '<text x="50" y="4.6" text-anchor="middle" class="cap-label">République du Gabon — frontière nord</text>';
    s += '<polygon class="limite-ligne" points="9,13 56,6 87,11 96,29 75,55 51,60 21,56 5,38"/>';
    s += '<text x="2.5" y="26" class="cap-label">OUEST</text>';
    s += '<text x="2.5" y="28.4" class="toponyme">Nyanga</text>';
    s += '<text x="2.5" y="47" class="cap-label">SUD</text>';
    s += '<text x="2.5" y="49.4" class="toponyme">Kibangou</text>';
    s += '<text x="97.5" y="22" text-anchor="end" class="cap-label">EST</text>';
    s += '<text x="97.5" y="24.4" text-anchor="end" class="toponyme">Moungoundou-sud</text>';

    D.axes.forEach(function (ax) {
      var dx = ax.vers[0] - ax.de[0], dy = ax.vers[1] - ax.de[1];
      var n = Math.sqrt(dx * dx + dy * dy);
      var nx = -dy / n, ny = dx / n;
      s += '<g class="groupe-axe" data-axe="' + ech(ax.id) + '">';
      s += '<path class="axe-ligne" d="M' + ax.de[0] + ' ' + ax.de[1] + ' Q' +
        (ax.de[0] + dx * 0.5 + nx * 2.4) + ' ' + (ax.de[1] + dy * 0.5 + ny * 2.4) + ' ' +
        ax.vers[0] + ' ' + ax.vers[1] + '"/>';
      var sites = ax.villages.map(function (v) { return { nom: v, type: 'village' }; })
        .concat((ax.hameaux || []).map(function (v) { return { nom: v, type: 'hameau' }; }));
      var ancre = dx >= 0 ? 'start' : 'end';
      sites.forEach(function (sit, i) {
        var t = (i + 1) / (sites.length + 1);
        var j = (((i * 37) % 9) - 4) * 0.45;
        var x = ax.de[0] + dx * t + nx * j;
        var y = ax.de[1] + dy * t + ny * j;
        var cote = (i % 2 === 0 ? 1.3 : -1.05);
        var px = x + (ancre === 'start' ? 1.05 : -1.05);
        var py = y + cote + 0.35;
        s += '<g class="noeud noeud--' + sit.type + '" data-nom="' + ech(sit.nom) + '" data-axe="' + ech(ax.nom) +
          '" data-rang="' + (i + 1) + '/' + sites.length + '" data-type="' + sit.type + '">';
        /* cible élargie invisible : confort de clic, sans recouvrir les voisins */
        s += '<circle class="noeud__cible" cx="' + x + '" cy="' + y + '" r="1.05"/>';
        if (sit.type === 'hameau') {
          s += '<rect x="' + (x - 0.55) + '" y="' + (y - 0.55) + '" width="1.1" height="1.1" fill="#a84a32" transform="rotate(45 ' + x + ' ' + y + ')"/>';
        } else {
          s += '<circle cx="' + x + '" cy="' + y + '" r="0.62" fill="#1e5b43"/>';
        }
        s += '<text x="' + px + '" y="' + py + '" text-anchor="' + ancre + '" class="toponyme">' + ech(sit.nom) + '</text>';
        s += '</g>';
      });
      s += '<text x="' + (ax.vers[0] + nx * 1.4) + '" y="' + (ax.vers[1] + ny * 1.4 + 0.4) + '" class="toponyme toponyme--cap">' + ech(ax.nom.toUpperCase()) + '</text>';
      s += '</g>';
    });
    s += '<rect x="45.5" y="25.5" width="7" height="7" rx="1.4" fill="#101612"/>';
    s += '<text x="49" y="28.2" text-anchor="middle" class="toponyme" style="font-size:1.3px;fill:#f2ede2;opacity:1;font-weight:700">DIVENIÉ</text>';
    s += '<text x="49" y="30.4" text-anchor="middle" class="toponyme" style="font-size:1px;fill:#f2ede2;opacity:0.8">cité · 7 quartiers</text>';
    s += '</svg>';
    return s;
  }

  /* ----------------------------------------------------------- 03 · Cité */
  function renduCite() {
    var plan = [
      { nom: '4 Chemins', cls: 'grid-column:span 5;grid-row:span 2', type: 'quartier central' },
      { nom: 'Bibaka', cls: 'grid-column:span 4', type: 'quartier' },
      { nom: 'Hôpital', cls: 'grid-column:span 3;grid-row:span 2', type: 'quartier' },
      { nom: 'Milimba', cls: 'grid-column:span 4', type: 'quartier' },
      { nom: 'Yala', cls: 'grid-column:span 4', type: 'quartier' },
      { nom: 'Boundza', cls: 'grid-column:span 4', type: 'quartier' },
      { nom: 'Mayoukou', cls: 'grid-column:span 4', type: 'quartier' }
    ];
    var quartiers = plan.map(function (q, i) {
      return '<div class="quartier rv" data-num="0' + (i + 1) + '" style="' + q.cls + ';--d:' + (i * 55) + '">' +
        '<span class="quartier__nom">' + ech(q.nom) + '</span>' +
        '<span class="quartier__type">' + ech(q.type) + '</span></div>';
    }).join('');

    var blocs = D.cite.blocs.map(function (b) { return '<span class="bloc rv">' + ech(b) + '</span>'; }).join('');

    var ethnies = D.ethnies.map(function (e, i) {
      return '<div class="ethnie rv' + (e.note ? ' ethnie--autoch' : '') + '" style="--d:' + (i * 60) + '">' +
        '<span class="ethnie__num">0' + (i + 1) + '</span>' +
        '<span class="ethnie__nom">' + ech(e.nom) + '</span>' +
        '<span class="ethnie__note">' + ech(e.note || 'présent à Divenié') + '</span></div>';
    }).join('');

    var html = cadre(
      '<div class="cite__tete">' + entete('03', 'Quartiers & ethnies') +
        '<h1 class="titre titre--md rv" style="--d:60">La <em>cité</em> et les peuples</h1>' +
      '</div>' +
      '<p class="cite__note lead rv" style="--d:140">Communauté urbaine placée sous l’autorité d’un administrateur maire : sept quartiers, quatre blocs, cinq ethnies qui cohabitent — dont le peuple autochtone babongo.</p>' +
      '<div class="quartiers-zone rv"><div class="plan-ville"><div class="plan-ville__grille">' + quartiers + '</div>' +
        '<div class="blocs" style="margin-top:18px"><span class="mono muet" style="align-self:center;margin-right:8px">Blocs</span>' + blocs + '</div>' +
      '</div></div>' +
      '<div class="ethnies-zone">' +
        '<p class="chapeau rv">Cinq ethnies</p>' +
        '<h2 class="titre titre--md rv" style="--d:60;font-size:clamp(30px,3.4vw,54px)">Vumbu, Nzebi, Tsangui,<br>Babongo, Punu</h2>' +
        '<div class="ethnies__liste" style="margin-top:22px">' + ethnies + '</div>' +
      '</div>' +
      '<div class="anneau-zone rv" style="--d:200">' + svgAnneau() + '</div>' +
      '<div class="mention mention--gauche mention--bas">Chap. 03 — Cité</div>'
    );
    return html;
  }

  function svgAnneau() {
    var couleurs = ['#1e5b43', '#4b8c6c', '#38677a', '#a84a32', '#c9962f'];
    var s = '<svg class="anneau" viewBox="0 0 300 300" role="img" aria-label="Cercle des cinq ethnies">';
    s += '<circle cx="150" cy="150" r="118" fill="none" stroke="rgba(16,22,18,0.25)" stroke-dasharray="2 3"/>';
    s += '<g class="anneau__poulie">';
    for (var i = 0; i < 24; i++) {
      var a = (i / 24) * Math.PI * 2;
      s += '<line x1="' + (150 + Math.cos(a) * 128) + '" y1="' + (150 + Math.sin(a) * 128) + '" x2="' + (150 + Math.cos(a) * 136) + '" y2="' + (150 + Math.sin(a) * 136) + '" stroke="#a84a32" stroke-width="0.8" opacity="0.6"/>';
    }
    s += '</g>';
    D.ethnies.forEach(function (e, i) {
      var ang = i * 72;
      s += '<g class="anneau__petal" transform="rotate(' + ang + ' 150 150)">' +
        '<ellipse cx="150" cy="44" rx="40" ry="52" fill="' + couleurs[i] + '" opacity="' + (e.note ? 0.95 : 0.82) + '"/>' +
        '<text x="150" y="' + (e.nom.length > 6 ? 52 : 50) + '" text-anchor="middle" transform="rotate(' + (-ang) + ' 150 ' + (e.nom.length > 6 ? 52 : 50) + ')" ' +
        'style="font-family:var(--titre);font-size:15px;fill:#f2ede2;font-weight:500">' + ech(e.nom) + '</text>' +
        (e.note ? '<text x="150" y="66" text-anchor="middle" transform="rotate(' + (-ang) + ' 150 66)" style="font-family:var(--mono);font-size:7.5px;letter-spacing:0.14em;fill:#f2ede2;opacity:0.9">AUTOCHTONE</text>' : '') +
        '</g>';
    });
    s += '<text x="150" y="152" text-anchor="middle" style="font-family:var(--mono);font-size:10px;letter-spacing:0.24em;fill:#101612;opacity:0.6">DIVENIÉ</text>';
    s += '</svg>';
    return s;
  }

  /* ------------------------------------------------------ 04 · Chroniques */
  function renduChroniques() {
    var frise = D.epoques.map(function (ep) {
      var entrees = D.administrations.filter(function (a) { return a.epoque === ep.id; });
      var lignes = entrees.map(function (a, i) {
        return '<div class="entree rv' + (a.enCours ? ' entree--en-cours' : '') + '" style="--d:' + Math.min(i * 26, 320) + '">' +
          '<span class="entree__dates">' + ech(periode(a)) + '</span>' +
          '<span class="entree__nom">' + ech(a.nom) +
          (a.note ? '<span class="entree__note">' + ech(a.note) + '</span>' : '') + '</span></div>';
      }).join('');
      return '<section class="ere"><div class="ere__tete">' +
        '<span class="ere__periode">' + ech(ep.periode) + '</span>' +
        '<h2 class="ere__titre">' + ech(ep.titre) + '</h2>' +
        '<span class="ere__compte">' + entrees.length + ' administrateur' + (entrees.length > 1 ? 's' : '') + '</span>' +
        '<p class="ere__chapeau" style="flex-basis:100%">' + ech(ep.chapeau) + '</p>' +
        '</div><div class="entrees">' + lignes + '</div></section>';
    }).join('');

    var lignesD = D.administrations.map(function (a, i) {
      var w = a.mois === null ? null : Math.max(3, Math.min(100, (a.mois / 96) * 100));
      var html = '<div class="durees__ligne rv" style="--d:' + Math.min(i * 18, 300) + '">' +
        '<span class="durees__nom">' + ech(a.nom) + '</span>' +
        '<span class="durees__piste">';
      html += w === null
        ? '<span class="durees__barre durees__barre--inconnu" style="width:34%"></span>'
        : '<span class="durees__barre" style="width:' + w + '%"></span>';
      html += '</span><span class="durees__mois">' + (a.mois === null ? 'non précisé' : libelleMois(a.mois)) + '</span></div>';
      return html;
    }).join('');

    var html = cadre(
      '<div class="chroniques__tete">' + entete('04', 'Les administrateurs') +
        '<h1 class="titre titre--md rv" style="--d:60">Chronique de <em>quatre-vingt-douze</em> années</h1>' +
        '<p class="lead letrine rv" style="--d:120;margin-top:22px">De 1934 à aujourd’hui, ' + D.administrations.length +
        ' administrateurs se sont succédé à la tête du district. Certains n’ont tenu qu’un jour, d’autres seize ans. La liste ci-dessous est reproduite telle que transmise par la source communautaire, chevauchements compris.</p>' +
      '</div>' +
      '<div class="chroniques__outils">' +
        '<div class="bascule-vue rv" role="group" aria-label="Mode d’affichage">' +
          '<button id="vueFrise" class="est-active" type="button">Frise</button>' +
          '<button id="vueDurees" type="button">Durées</button></div>' +
        '<p class="chroniques__note rv" style="--d:120">Frise non proportionnelle. La vue « durées » compare les longueurs de mandat (échelle plafonnée à 96 mois).</p>' +
      '</div>' +
      '<div class="frise rv" id="frise">' + frise + '</div>' +
      '<div class="durees" id="durees">' + lignesD +
        '<div class="durees__echelle"><span>1934</span><span>24 mois</span><span>48</span><span>72</span><span>96 mois et +</span></div>' +
      '</div>' +
      '<div class="mention mention--gauche mention--bas">Chap. 04 — Chroniques</div>'
    );
    return html;
  }

  /* ------------------------------------------------------------- 05 · Voix */
  function renduVoix() {
    var dep = D.deputes.map(function (n, i) {
      return '<div class="elu rv" style="--d:' + (i * 45) + '"><span class="elu__num">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' +
        '<span class="elu__nom">' + ech(n) + '</span><span class="elu__hint">député</span></div>';
    }).join('');
    var mai = D.maires.map(function (n, i) {
      return '<div class="elu rv" style="--d:' + (i * 45) + '"><span class="elu__num">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' +
        '<span class="elu__nom">' + ech(n) + '</span><span class="elu__hint">maire</span></div>';
    }).join('');

    var personnes = D.religieux.clerge.map(function (p) { return { qualite: p.qualite, nom: p.nom }; })
      .concat(D.religieux.laics.map(function (n) { return { qualite: 'Laïcs', nom: n }; }));
    var qualites = ['Tous'];
    personnes.forEach(function (p) { if (qualites.indexOf(p.qualite) < 0) qualites.push(p.qualite); });
    var puces = qualites.map(function (q, i) {
      return '<button class="puce' + (i === 0 ? ' est-active' : '') + '" type="button" data-qualite="' + ech(q) + '">' + ech(q) + '</button>';
    }).join('');
    var murs = personnes.map(function (p) {
      return '<div class="nom-personne" data-qualite="' + ech(p.qualite) + '">' +
        '<span class="nom-personne__ligne"><span class="nom-personne__q">' + ech(p.qualite) + '</span>' +
        '<span class="nom-personne__n">' + ech(p.nom) + '</span></span></div>';
    }).join('');

    var html = cadre(
      '<div class="voix__tete">' + entete('05', 'Élus & desservants') +
        '<h1 class="titre titre--md rv" style="--d:60">Les <em>voix</em> du district</h1>' +
        '<p class="lead rv" style="--d:120;margin-top:20px;max-width:70ch">Huit députés, quatre maires, puis une communauté de desservants — pères, frères, sœurs, abbés — et les laïcs qui les ont accompagnés. Deux registres, une même fidélité au territoire.</p>' +
      '</div>' +
      '<div class="elus">' +
        '<div><p class="elus__bloc-titre rv">Députés — de l’AEF à nos jours</p><div class="elus__liste">' + dep + '</div></div>' +
        '<div><p class="elus__bloc-titre rv">Maires</p><div class="elus__liste">' + mai + '</div></div>' +
      '</div>' +
      '<div class="mur">' +
        '<p class="chapeau rv">Religieux, religieuses &amp; laïcs</p>' +
        '<h2 class="titre titre--md rv" style="--d:60;font-size:clamp(30px,3.4vw,54px)">Le <em>service</em> de la parole</h2>' +
        '<div class="mur__filtres" id="filtresReligieux">' + puces + '</div>' +
        '<div class="mur__noms" id="murNoms">' + murs + '</div>' +
        '<p class="mono muet rv" style="margin-top:16px">Les listes sources comportent des noms communs aux deux registres ; ils sont conservés dans les deux, tels quels.</p>' +
      '</div>' +
      '<div class="mention mention--gauche mention--bas">Chap. 05 — Voix</div>'
    );
    return html;
  }

  /* --------------------------------------------------------- 06 · Or vert */
  var ICONES = {
    grumes: '<circle cx="11" cy="10" r="8"/><circle cx="11" cy="10" r="3.4"/><circle cx="11" cy="23" r="8"/><circle cx="11" cy="23" r="3.4"/>',
    diamant: '<path d="M16 3 L29 14 L16 30 L3 14 Z"/><path d="M3 14 H29"/><path d="M16 3 L11 14 L16 30 L21 14 Z"/>',
    bauxite: '<path d="M4 26 L9 10 L23 6 L29 20 L20 29 Z"/><path d="M9 10 L14 19 L23 6"/><path d="M14 19 L20 29"/>',
    gaz: '<path d="M16 3 C20 10 26 13 26 20 a10 10 0 0 1 -20 0 C6 14 12 11 16 3 Z"/><path d="M16 16 c2.6 3.4 4 5 4 7 a4 4 0 0 1 -8 0 c0 -2 1.4 -3.6 4 -7 Z"/>'
  };

  function renduOrVert() {
    var jalons = D.histoire.map(function (h, i) {
      return '<div class="jalon rv" style="--d:' + (i * 70) + '">' +
        '<p class="jalon__annee">' + ech(h.annee) + '</p>' +
        '<p class="jalon__date">' + ech(h.date) + '</p>' +
        '<p class="jalon__titre">' + ech(h.titre) + '</p>' +
        '<p class="jalon__texte">' + ech(h.texte) + '</p></div>';
    }).join('');

    var total = D.permis.reduce(function (t, p) { return t + p.ha; }, 0);
    var permis = D.permis.map(function (p) {
      return '<div class="permis__ligne rv">' +
        '<span class="permis__qui">' + ech(p.exploitant) + '<span class="permis__essence">' + ech(p.essence) + '</span></span>' +
        '<span class="permis__ha">' + p.ha.toLocaleString('fr-FR') + ' ha</span>' +
        '<span class="permis__piste"><span class="permis__jauge" style="--w:' + ((p.ha / 10000) * 100).toFixed(1) + '%"></span></span>' +
        '</div>';
    }).join('');

    var richesses = D.richesses.map(function (r, i) {
      return '<div class="richesse rv" style="--d:' + (i * 60) + '">' +
        '<svg class="richesse__icone" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">' + ICONES[r.icone] + '</svg>' +
        '<p class="richesse__nom">' + ech(r.nom) + '</p>' +
        '<p class="richesse__texte">' + ech(r.texte) + '</p></div>';
    }).join('');

    var q = D.citations[0];

    var html = cadre(
      '<div class="orvert__tete">' + entete('06', 'Histoire & forêt') +
        '<h1 class="titre titre--md rv" style="--d:60">L’<em>or vert</em></h1>' +
        '<p class="lead letrine rv" style="--d:120;margin-top:22px">Divenié fut une belle cité forestière : routes bâties selon les règles de l’art, écoles, ponts durables. Le bois, exploité d’abord par des Européens puis par des opérateurs malaisiens, reste le moteur d’une économie dont les populations n’ont pas encore toutes les retombées.</p>' +
      '</div>' +
      '<div class="orvert__chiffre rv" style="--d:180">' +
        '<p class="grand">' + total.toLocaleString('fr-FR') + '</p>' +
        '<p class="legende">hectares concédés<br>dans les années 60</p>' +
      '</div>' +
      '<div class="jalons rv"><div class="jalons__voie"></div><div class="jalons__liste">' + jalons + '</div></div>' +
      '<blockquote class="citation rv">' +
        '<span class="citation__guillemet">“</span>' +
        '<div><p class="citation__texte">' + ech(q.texte) + '</p><p class="citation__source">' + ech(q.source) + '</p></div>' +
      '</blockquote>' +
      '<div class="permis rv"><p class="chapeau">Permis d’exploitation — années 60</p>' +
        '<div class="permis__liste" style="margin-top:16px">' + permis + '</div></div>' +
      '<div class="richesses"><p class="chapeau rv" style="grid-column:1/-1">Principales richesses</p>' + richesses + '</div>' +
      '<div class="mention mention--gauche mention--bas">Chap. 06 — Or vert</div>'
    );
    return html;
  }

  /* ------------------------------------------------------------- 07 · Kodu */
  function renduKodu() {
    var noms = D.marchands.principaux.map(function (n) {
      return '<span data-nom="' + ech(n) + '">' + ech(n) + '</span>';
    }).join('<span class="sep">·</span>');
    var complements = D.marchands.complements.map(function (n) {
      return '<span class="' + (/Famille/.test(n) ? 'famille' : '') + '">' + ech(n) + '</span>';
    }).join('<span class="sep">·</span>');

    var html = cadre(
      '<div class="kodu__tete">' + entete('07', 'Les affairistes') +
        '<h1 class="titre rv" style="--d:60">Kodu <em>maghasi</em></h1>' +
        '<p class="lead letrine rv" style="--d:120;margin-top:22px;max-width:72ch">Divenié fut jadis le centre des affaires et du commerce du pourtour — Portugais, Français, Gabonais et Congolais mêlés. Ces noms, la mémoire du district les conserve : ils ont fait la fierté de la cité.</p>' +
      '</div>' +
      '<div class="mur-noms rv">' +
        '<p class="mono muet" style="margin-bottom:18px">' + (D.marchands.principaux.length + D.marchands.complements.length) + ' noms conservés par la mémoire locale</p>' +
        '<div class="mur-noms__flux">' + noms + '</div>' +
        '<div class="mur-noms__suite"><span class="mono">Sans oublier</span><div class="mur-noms__flux" style="font-size:clamp(18px,2vw,30px)">' + complements + '</div></div>' +
      '</div>' +
      '<div class="clos">' +
        '<p class="chapeau rv">Épilogue</p>' +
        '<p class="clos__mot rv" style="--d:60"><b>Terre</b> Bénie</p>' +
        '<div class="clos__note">' +
          '<div class="colophon rv"><b>Sources</b>Informations communautaires fournies pour ce projet : situation géographique, axes et villages, liste des administrateurs (1934 à nos jours), députés, maires, religieux et laïcs, histoire, exploitation forestière et noms des affairistes.</div>' +
          '<div class="colophon rv" style="--d:80"><b>Notes</b>Les dates sont reproduites telles qu’elles ont été transmises, y compris les chevauchements de mandats. La carte du chapitre 02 est schématique et sans échelle. Aucune information extérieure n’a été ajoutée.</div>' +
          '<div class="colophon colophon--signature rv" style="--d:140"><b>Objet</b>Site dynamique de mise en valeur — pagination en sept chapitres, récit en timelines. Réalisé en HTML, CSS et JavaScript sans dépendance.</div>' +
        '</div>' +
      '</div>' +
      '<div class="mention mention--gauche mention--bas">Chap. 07 — Kodu maghasi</div>'
    );
    return html;
  }

  var RENDU = {
    atlas: renduAtlas, cite: renduCite, chroniques: renduChroniques,
    voix: renduVoix, 'or-vert': renduOrVert, kodu: renduKodu
  };

  /* ================================================================== */
  /* CHROME & ROUTAGE                                                    */
  /* ================================================================== */

  var rail = $('#rail'), pied = $('#pied'), pages = $$('.page'), jauge = $('#jauge');
  var pageNum = $('#pageNum'), bascule = $('#basculeMotion');
  var contenuRendu = {};
  var initFait = {};
  var observateur = null;

  function construitRail() {
    rail.innerHTML = ihm.chapitres.map(function (c, i) {
      return '<a class="rail__lien" href="#/' + c.route + '" data-route="' + c.route + '">' +
        '<span class="trait"></span><span class="num">' + c.num + '</span>' +
        '<span>' + ech(c.court) + '</span></a>';
    }).join('');
  }

  function construitPied(i) {
    var prev = ihm.chapitres[i - 1], suiv = ihm.chapitres[i + 1];
    pied.innerHTML =
      (prev ? '<a class="precedent" href="#/' + prev.route + '"><span class="sens">◀ Précédent — ' + ech(prev.num) + '</span><span class="cible">' + ech(prev.titre) + '</span></a>' : '<span></span>') +
      (suiv ? '<a class="suivant" href="#/' + suiv.route + '"><span class="sens">' + ech(suiv.num) + ' — Suivant ▶</span><span class="cible">' + ech(suiv.titre) + '</span></a>' : '<span></span>');
  }

  function observeRevelations(racine) {
    if (observateur) observateur.disconnect();
    if (!('IntersectionObserver' in window)) {
      $$('.rv', racine).forEach(function (el) { el.classList.add('rv--vue'); });
      return;
    }
    observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('rv--vue'); observateur.unobserve(e.target); }
      });
    }, { root: racine, threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    $$('.rv', racine).forEach(function (el) { observateur.observe(el); });
  }

  function routeCourante() {
    var h = location.hash.replace(/^#\/?/, '');
    return ihm.chapitres.some(function (c) { return c.route === h; }) ? h : 'seing';
  }

  function activerPage(route) {
    var idx = -1;
    ihm.chapitres.forEach(function (c, i) { if (c.route === route) idx = i; });
    if (idx < 0) return;
    ihm.index = idx;
    var ch = ihm.chapitres[idx];

    pages.forEach(function (p) { p.classList.toggle('est-actif', p.dataset.page === route); });

    var page = $('.page[data-page="' + route + '"]');
    if (RENDU[route]) {
      if (!contenuRendu[route]) {
        /* région focalisable : le chapitre est scrollable au clavier (axe) */
        page.innerHTML = '<div class="page__defile" id="defile-' + route + '" tabindex="0" role="region" ' +
          'aria-label="Chapitre ' + ch.num + ' — ' + ech(ch.titre) + '"></div>';
        $('.page__defile', page).innerHTML = RENDU[route]();
        contenuRendu[route] = true;
      }
    }

    var defile = $('.page__defile', page);
    if (defile) {
      defile.scrollTop = 0;
      observeRevelations(defile);
      defile.onscroll = function () {
        var max = defile.scrollHeight - defile.clientHeight;
        jauge.style.width = (max > 0 ? (defile.scrollTop / max) * 100 : 0) + '%';
      };
      defile.onscroll();
    }

    pageNum.textContent = ch.num;
    $$('.rail__lien', rail).forEach(function (l) {
      l.classList.toggle('est-actif', l.dataset.route === route);
    });
    construitPied(idx);

    /* le rail et le pied sont hors des pages : la couleur suit le thème du chapitre */
    var sombre = page.classList.contains('page--sombre') || page.classList.contains('page--foret');
    rail.style.color = pied.style.color = sombre ? 'rgba(242,237,226,0.92)' : 'var(--encre)';
    rail.setAttribute('data-theme', sombre ? 'sombre' : 'clair');

    if (route === 'seing' && !initFait.seing) { initFait.seing = true; initialiseHeros(); }
    if (route === 'atlas' && !initFait.atlas) { initFait.atlas = true; initialiseAtlas(); }
    if (route === 'chroniques' && !initFait.chroniques) { initFait.chroniques = true; initialiseChroniques(); }
    if (route === 'voix' && !initFait.voix) { initFait.voix = true; initialiseVoix(); }
  }

  /* ================================================================== */
  /* HÉROS                                                             */
  /* ================================================================== */
  var heroPret = false;
  function bandeauStats() {
    $('#bandeauStats').innerHTML = D.stats.map(function (s) {
      return '<div class="stat"><p class="stat__val" data-cible="' + s.valeur + '">0</p>' +
        '<p class="stat__lib">' + ech(s.label) + '</p></div>';
    }).join('');
  }
  function compteChiffres() {
    $$('#bandeauStats .stat__val').forEach(function (el) {
      var cible = +el.dataset.cible, t0 = null;
      if (document.body.classList.contains('mode-sobre')) { el.textContent = cible; return; }
      function pas(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 950);
        el.textContent = Math.round(cible * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(pas);
      }
      requestAnimationFrame(pas);
    });
  }
  function initialiseHeros() {
    var hero = $('.hero'), defile = $('#defile-seing');
    if (!hero || heroPret) { compteChiffres(); return; }
    heroPret = true;
    compteChiffres();

    var calques = $$('.hero__calque', hero).map(function (c) {
      return { el: c, prof: parseFloat(c.dataset.prof) };
    });
    var souris = { x: 0, y: 0 }, defil = 0;

    function pose() {
      calques.forEach(function (c) {
        var m = 6 + c.prof * 26;
        c.el.style.transform = 'translate3d(' + (souris.x * m).toFixed(2) + 'px,' +
          (defil * c.prof + souris.y * m * 0.6).toFixed(2) + 'px,0)';
      });
    }
    defile.addEventListener('scroll', function () {
      defil = defile.scrollTop;
      pose();
      var max = defile.scrollHeight - defile.clientHeight;
      jauge.style.width = (max > 0 ? (defil / max) * 100 : 0) + '%';
    }, { passive: true });
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      souris.x = (e.clientX - r.left) / r.width - 0.5;
      souris.y = (e.clientY - r.top) / r.height - 0.5;
      pose();
    });
    hero.addEventListener('mouseleave', function () { souris.x = 0; souris.y = 0; pose(); });
  }

  /* ================================================================== */
  /* ATLAS — carte interactive                                          */
  /* ================================================================== */
  function initialiseAtlas() {
    var carte = $('#carte'), filtres = $('#filtresAxes'), fiche = $('#fiche');
    if (!carte) return;

    var axes = ['Tous'].concat(D.axes.map(function (a) { return { id: a.id, nom: a.nom }; }));
    filtres.innerHTML = axes.map(function (a, i) {
      return '<button class="puce' + (i === 0 ? ' est-active' : '') + '" type="button" data-axe="' + ech(a.id) + '">' +
        (a.id === 'Tous' ? 'Tous les axes' : ech(a.nom)) + '</button>';
    }).join('');

    filtres.addEventListener('click', function (e) {
      var b = e.target.closest('.puce'); if (!b) return;
      $$('.puce', filtres).forEach(function (p) { p.classList.toggle('est-active', p === b); });
      var id = b.dataset.axe;
      $$('.groupe-axe', carte).forEach(function (g) {
        g.classList.toggle('axe--inactif', id !== 'Tous' && g.dataset.axe !== id);
      });
    });

    carte.addEventListener('click', function (e) {
      var n = e.target.closest('.noeud');
      if (!n) { fiche.classList.remove('est-ouverte'); return; }
      $$('.noeud', carte).forEach(function (x) { x.classList.toggle('est-choisi', x === n); });
      fiche.innerHTML =
        '<p class="fiche__kicker">' + ech(n.dataset.type === 'hameau' ? 'Hameau' : 'Village') + '</p>' +
        '<p class="fiche__nom">' + ech(n.dataset.nom) + '</p>' +
        '<p class="fiche__axe">Axe ' + ech(n.dataset.axe) + '</p>' +
        '<p class="fiche__rang"><span>' + ech(n.dataset.rang.split('/')[0]) + ' / ' + ech(n.dataset.rang.split('/')[1]) + '</span><span>Chap. 02</span></p>';
      fiche.classList.add('est-ouverte');
    });

    /* curseur réticule sur la carte */
    var reticule = document.createElement('div');
    reticule.style.cssText = 'position:absolute;width:22px;height:22px;pointer-events:none;opacity:0;transition:opacity 200ms;';
    reticule.innerHTML = '<svg viewBox="0 0 22 22" width="22" height="22"><circle cx="11" cy="11" r="10" fill="none" stroke="#a84a32" stroke-width="1"/><line x1="11" y1="0" x2="11" y2="22" stroke="#a84a32" stroke-width="0.5"/><line x1="0" y1="11" x2="22" y2="11" stroke="#a84a32" stroke-width="0.5"/></svg>';
    carte.appendChild(reticule);
    carte.addEventListener('mousemove', function (e) {
      var r = carte.getBoundingClientRect();
      reticule.style.opacity = 0.8;
      reticule.style.left = (e.clientX - r.left - 11) + 'px';
      reticule.style.top = (e.clientY - r.top - 11) + 'px';
    });
    carte.addEventListener('mouseleave', function () { reticule.style.opacity = 0; });
  }

  /* ================================================================== */
  /* CHRONIQUES — bascule frise / durées                                */
  /* ================================================================== */
  function initialiseChroniques() {
    var frise = $('#frise'), durees = $('#durees'), bF = $('#vueFrise'), bD = $('#vueDurees');
    if (!frise) return;
    function montre(vue) {
      var friseActive = vue === 'frise';
      frise.style.display = friseActive ? '' : 'none';
      durees.classList.toggle('est-active', !friseActive);
      bF.classList.toggle('est-active', friseActive);
      bD.classList.toggle('est-active', !friseActive);
      observeRevelations(friseActive ? frise : durees);
      $$('.rv', friseActive ? frise : durees).forEach(function (el) { el.classList.add('rv--vue'); });
    }
    bF.addEventListener('click', function () { montre('frise'); });
    bD.addEventListener('click', function () { montre('durees'); });
  }

  /* ================================================================== */
  /* VOIX — filtre du mur de noms                                       */
  /* ================================================================== */
  function initialiseVoix() {
    var filtres = $('#filtresReligieux'), mur = $('#murNoms');
    if (!filtres) return;
    filtres.addEventListener('click', function (e) {
      var b = e.target.closest('.puce'); if (!b) return;
      $$('.puce', filtres).forEach(function (p) { p.classList.toggle('est-active', p === b); });
      var q = b.dataset.qualite;
      $$('.nom-personne', mur).forEach(function (n) {
        var vu = q === 'Tous' || n.dataset.qualite === q;
        n.style.display = vu ? '' : 'none';
      });
    });
  }

  /* ================================================================== */
  /* NAVIGATION                                                         */
  /* ================================================================== */
  function va(delta) {
    var i = Math.min(Math.max(ihm.index + delta, 0), ihm.chapitres.length - 1);
    location.hash = '#/' + ihm.chapitres[i].route;
  }
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); va(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); va(-1); }
  });

  var tx = null, ty = null;
  document.addEventListener('touchstart', function (e) {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.6) va(dx < 0 ? 1 : -1);
    tx = ty = null;
  }, { passive: true });

  /* interrupteur de mouvement */
  function mouvement(on) {
    document.body.classList.toggle('mode-sobre', !on);
    bascule.setAttribute('aria-pressed', String(!on));
    bascule.querySelector('span').textContent = on ? 'Animé' : 'Sobre';
  }
  bascule.addEventListener('click', function () {
    mouvement(document.body.classList.contains('mode-sobre'));
  });

  /* ================================================================== */
  /* DÉMARRAGE                                                          */
  /* ================================================================== */
  bandeauStats();
  construitRail();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) mouvement(false);
  else mouvement(true);
  window.addEventListener('hashchange', function () { activerPage(routeCourante()); });
  activerPage(routeCourante());
})();
