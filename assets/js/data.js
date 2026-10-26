/* ==========================================================================
   DIVENIÉ — « Terre Bénie »
   Module de données du District de Divenié (Département du Niari, Congo).
   Script classique (pas de module ES) pour rester compatible file://
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     Utilitaires de dates — précision : 'j' (jj/mm/aaaa) | 'm' (mm/aaaa) | 'a'
     ---------------------------------------------------------------------- */
  function precision(valeur) {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valeur)) return 'j';
    if (/^\d{2}\/\d{4}$/.test(valeur)) return 'm';
    if (/^\d{4}$/.test(valeur)) return 'a';
    return 'x'; // mention libre (« 1960 », « depuis … »)
  }

  function versMois(valeur) {
    var p = precision(valeur);
    if (p === 'j') {
      var j = valeur.split('/');
      return (+j[2]) * 12 + (+j[1] - 1);
    }
    if (p === 'm') {
      var m = valeur.split('/');
      return (+m[1]) * 12 + (+m[0] - 1);
    }
    if (p === 'a') return (+valeur) * 12 + 6; // médiane de l'année
    return null;
  }

  /* durée fiable uniquement si les deux bornes sont datées au mois près au moins */
  function dureeMois(debut, fin) {
    var pa = precision(debut), pf = precision(fin);
    if ((pa !== 'j' && pa !== 'm') || (pf !== 'j' && pf !== 'm')) return null;
    var a = versMois(debut), b = versMois(fin);
    if (a === null || b === null || b < a) return null;
    return b - a;
  }

  /* ----------------------------------------------------------------------
     Époques administratives
     ---------------------------------------------------------------------- */
  var epoques = [
    { id: 'independance', periode: '1934 — 1960', titre: "Avant l'indépendance",
      chapeau: "Les années de garnison : Divenié naît comme poste de contrôle administratif." },
    { id: 'avant-populaires', periode: '1960 — 1973', titre: 'Avant les pouvoirs populaires',
      chapeau: "L'indépendance acquise, la circonscription vit ses premières années congolaises." },
    { id: 'populaires', periode: '1973 — 1991', titre: 'Pouvoirs populaires',
      chapeau: "Près de deux décennies d'administration révolutionnaire." },
    { id: 'transition', periode: '1991 — 1995', titre: 'Période de transition',
      chapeau: "Une seule main aura porté la transition." },
    { id: 'democratie', periode: '1995 — 1998', titre: 'Démocratie et guerre',
      chapeau: "Les années troubles, jusqu'à la guerre de 1997." },
    { id: 'apres-guerre', periode: '1998 — 2009', titre: 'Après la guerre',
      chapeau: "La reconstruction, confiée à trois administrateurs." },
    { id: 'actuel', periode: '2009 — aujourd’hui', titre: 'Depuis 2009',
      chapeau: "L'ère contemporaine du district." }
  ];

  /* ----------------------------------------------------------------------
     Administrateurs — tels que transmis par la source communautaire.
     Les chevauchements de mandats sont conservés sans correction.
     ---------------------------------------------------------------------- */
  var a = function (nom, debut, fin, epoque, options) {
    var o = options || {};
    return {
      nom: nom, debut: debut, fin: fin, epoque: epoque,
      mois: dureeMois(debut, fin),
      enCours: !!o.enCours,
      note: o.note || null
    };
  };

  var administrations = [
    /* Avant l'indépendance — 1934-1960 */
    a('Sabatier Trezmen', '10/01/1934', '04/12/1936', 'independance'),
    a('Robaglia', '04/12/1936', '22/01/1939', 'independance'),
    a('Delarminat', '22/01/1939', '10/05/1939', 'independance'),
    a('Jacques Pech', '10/05/1939', '21/10/1939', 'independance'),
    a('Flavier', '01/11/1939', '09/02/1940', 'independance'),
    a('Maillet', '01/07/1940', '01/07/1941', 'independance'),
    a('Flavier', '01/07/1941', '09/12/1942', 'independance', { note: 'second passage' }),
    a('Paul Laurent', '09/12/1942', '11/06/1944', 'independance'),
    a('Dacosta', '11/06/1944', '09/04/1945', 'independance'),
    a('Cossurel', '09/04/1945', '31/10/1945', 'independance'),
    a('Rouhier Paul', '31/10/1945', '31/12/1945', 'independance'),
    a('Gardain Joseph', '31/12/1945', '31/01/1946', 'independance'),
    a('Rouhier Paul', '31/01/1946', '04/08/1947', 'independance', { note: 'second passage' }),
    a('Berger Philippe', '04/08/1947', '30/01/1950', 'independance'),
    a('Lejoli Robert', '30/01/1950', '28/02/1952', 'independance'),
    a('Millet Claude', '28/02/1952', '15/10/1957', 'independance', { note: 'plus long mandat colonial' }),
    a('Pignol Paul', '15/10/1957', '26/12/1957', 'independance'),
    a('Poujoula Fernand', '26/12/1957', '1960', 'independance', { note: "jusqu'à l'indépendance" }),

    /* Avant les pouvoirs populaires — 1960-1973 */
    a('Kibongui Saminou Placide', '1960', '20/12/1962', 'avant-populaires'),
    a('Nzakete', '20/12/1962', '21/12/1962', 'avant-populaires', { note: 'un seul jour' }),
    a('Badouemouna Martin', '21/12/1962', '18/02/1963', 'avant-populaires'),
    a('Nkoua Pierre Félicien', '18/02/1963', '05/07/1963', 'avant-populaires'),
    a('Adampot J. Vivien', '05/07/1963', '18/09/1963', 'avant-populaires'),
    a('Nzonzolo Jasmin', '18/09/1963', '26/08/1964', 'avant-populaires'),
    a('Makouézi Grégoire', '26/08/1964', '24/01/1965', 'avant-populaires'),
    a('Massengo Henri', '24/01/1965', '29/06/1966', 'avant-populaires'),
    a('Voucenas Boniface', '29/06/1966', '04/05/1970', 'avant-populaires'),
    a('Mboumba Prosper', '04/05/1970', '04/11/1971', 'avant-populaires'),
    a('Manounou Félix', '04/11/1971', '04/05/1972', 'avant-populaires'),
    a('Ondze Pierre', '04/05/1972', '14/04/1973', 'avant-populaires'),

    /* Pouvoirs populaires — 1973-1991 */
    a('Massimba Rigobert', '14/04/1973', '28/05/1977', 'populaires'),
    a('Dicket Paul', '28/05/1977', '30/11/1977', 'populaires'),
    a('Moussiamana J. Norbert', '30/11/1977', '04/09/1979', 'populaires'),
    a('Doha Daniel', '04/09/1979', '05/06/1981', 'populaires'),
    a('Mboumba Nzihou J. Bernard', '05/06/1981', '30/10/1984', 'populaires'),
    a('Tono-Ibouily Nziengui', '30/10/1984', '31/10/1989', 'populaires'),
    a('Milandou Mathieu', '31/10/1989', '20/09/1991', 'populaires'),

    /* Transition — 1991-1995 */
    a('Nkodia Jean Louis', '20/09/1991', '20/07/1995', 'transition'),

    /* Démocratie et guerre — 1995-1998 */
    a('Boungouanza Romuald', '20/07/1995', '28/03/1998', 'democratie', { note: 'premier passage' }),

    /* Après la guerre — 1998-2009 */
    a('Bilesset Clément', '28/03/1998', '30/10/2000', 'apres-guerre'),
    a('Ibouanga Kanga Marcel', '30/10/2000', '01/12/2003', 'apres-guerre'),
    a('Boungouanza Romuald', '01/12/2003', '20/01/2009', 'apres-guerre', { note: 'second passage' }),

    /* Depuis 2009 */
    a('Ndinga Jean Pierre', '01/2009', '01/2025', 'actuel', { note: 'mandat concomitant avec le suivant (source communautaire)' }),
    a('Dzenguele Maurice', '01/2024', '05/2025', 'actuel', { note: 'mandat concomitant avec le précédent (source communautaire)' }),
    a('Osseka Pierre Nestor', '05/2025', '08/2026', 'actuel'),
    a('Mbani Grégoire', '09/2026', '', 'actuel', { enCours: true, note: 'en fonction' })
  ];

  /* ----------------------------------------------------------------------
     Axes, villages, hameaux + gabarit de carte schématique
     ---------------------------------------------------------------------- */
  var axes = [
    {
      id: 'nyanga', nom: 'Nyanga – Paysannat', cap: 'O',
      de: [48, 30], vers: [15, 20],
      villages: ['Dimani', 'Nzambi Kalla', 'Kamba', 'Dikoukou', 'Nzanza',
        'Nyanga – Paysannat', 'Dounguila', 'Souangui 1', 'Mila Mila', 'Souangui 2']
    },
    {
      id: 'moupitou', nom: 'Moupitou', cap: 'SO',
      de: [48, 30], vers: [19, 45],
      villages: ['Dibola', 'Lemboumbou', 'Moudouma', 'Mouloundou', 'Moupitou',
        'Iloumboussiaweka', 'Ngongo Village', 'Moutsengany']
    },
    {
      id: 'moukondo', nom: 'Moukondo', cap: 'S',
      de: [48, 30], vers: [45, 57],
      hameaux: ['Moubiya', 'Mateba'],
      villages: ['Vanga', 'Biloungou', 'Doubila', 'Itabi', 'Issiengui', 'Inguebi',
        'Mouyingou Bengo', 'Moukondo', 'Mollo', 'Moussamou']
    },
    {
      id: 'kouyi', nom: 'Kouyi', cap: 'SE',
      de: [48, 30], vers: [81, 45],
      villages: ['Bouali', 'Ingueli', 'Moufoubou', 'Divenié Village', 'Pemo-Kb',
        'Mouhala', 'Mambouana', 'Moungoutou', 'Moudounga', 'Kouyi']
    },
    {
      id: 'kalla', nom: 'Kalla', cap: 'NE',
      de: [48, 30], vers: [78, 11],
      villages: ['Carrefour', 'Bitimba', 'Ignounga', 'Midouma', 'Kalla']
    }
  ];

  var limites = [
    { cap: 'Nord', voisin: 'République du Gabon', detail: 'frontière internationale' },
    { cap: 'Sud', voisin: 'Sous-préfecture de Kibangou', detail: '' },
    { cap: 'Ouest', voisin: 'District de Nyanga', detail: '' },
    { cap: 'Est', voisin: 'District de Moungoundou-sud', detail: '' },
    { cap: 'Sud-est', voisin: 'Moutamba', detail: '' }
  ];

  /* ----------------------------------------------------------------------
     Cité urbaine, ethnies
     ---------------------------------------------------------------------- */
  var cite = {
    quartiers: ['4 Chemins', 'Bibaka', 'Yala', 'Boundza', 'Hôpital', 'Milimba', 'Mayoukou'],
    blocs: ['Makaha', 'Makengueni', 'Massabou', 'Moussabou'],
    note: "Communauté urbaine placée sous l'autorité d'un administrateur maire."
  };

  var ethnies = [
    { nom: 'Vumbu', note: '' },
    { nom: 'Nzebi', note: '' },
    { nom: 'Tsangui', note: '' },
    { nom: 'Babongo', note: 'peuple autochtone' },
    { nom: 'Punu', note: '' }
  ];

  /* ----------------------------------------------------------------------
     Élus et desservants
     ---------------------------------------------------------------------- */
  var deputes = ['Pierre François Batchy', 'Justin Kessy', 'Daniel Doha',
    'Edmond Mayombo', 'Jules Voumbidi', 'Rigobert Massimba',
    'Claude Étienne Massimba', 'Marianne Nkouka Yogo Maganga'];

  var maires = ['Marcel Ibouanga Kanga', 'Jean Maurice Kouanzi',
    'Emile Mabioko Moukala', 'Jean Paul Massamba'];

  var clerge = [
    ['Père', 'Johannes Molager'], ['Frère', 'Hermes Van Eckert'], ['Frère', 'Éloi Jaouen'],
    ['Père', 'Jules Bitaud'], ['Père', 'Eugène Ferrand'], ['Père', 'Philippe Mahé'],
    ['Père', 'Jacques Commandeur'], ['Père', 'Georges Laloux'], ['Père', 'Jean Berdsen'],
    ['Père', 'Joseph Gottard'], ['Sœur', 'Marcelle Poulain'], ['Sœur', 'Germaine Lecuyer'],
    ['Sœur', 'Monique Bazin'], ['Abbé', 'François de Paul M-Ibeni'], ['Abbé', 'Roger Chemin'],
    ['Abbé', 'Pierre Akabandziami'], ['Abbé', 'Yan'], ['Abbé', 'Marianne Podzam'],
    ['Abbé', 'Adolphe Mboukou'], ['Abbé', 'Gaston G. Boukoumou'], ['Abbé', 'Robert Loukanga'],
    ['Sœur', 'Berthe Luzolo'], ['Sœur', 'Dorothée Kabusu'], ['Sœur', 'Marie-Josée Matondo'],
    ['Sœur', 'Julie Luvunu'], ['Sœur', 'Pélagie Wumba'], ['Sœur', 'Joséphine Mumpompa'],
    ['Sœur', 'Suzanne Mayamba'], ['Sœur', 'Micheline Mambulu'], ['Abbé', 'Alexis Ndamba'],
    ['Abbé', 'Hilaire Berri'], ['Abbé', 'Albert Ndiatu'], ['Abbé', 'Firmin Ihoula'],
    ['Abbé', 'Lebruné Kouène'], ['Abbé', 'Jules B. Mabounda'], ['Abbé', 'Serge'],
    ['Abbé', 'Richard'], ['Abbé', 'François de Paul Moundanga Ibéni'],
    ['Monseigneur', 'Godefroy Émile Mpwati']
  ].map(function (e) { return { qualite: e[0], nom: e[1] }; });

  var laics = ['Ernest Tsokodo', 'Hermann Doba', 'Charden Kombia',
    'Barbe Rose Moussavou', 'Thimothée Boussouhou', 'Jean Claude Moukala',
    'Albert Moungala', 'Constantine Mouelet', 'Constante Boussouhou',
    'Lydie Ignoumba', 'Nadège Foueras', 'Martine Makanga', 'Josty Makounga',
    'Mathieu Bililou Matsieri', 'Marie Suzanne Dianga', 'Croisé Ngoma', 'Daniel Pahala',
    'Crémieux Christel Moussoyi', 'Christian Kouené Mouanda', 'Renaud Nzamba',
    'Jean Lucien Dembele Kombila', 'Télésphore Bourandou', 'Yann Honoré Youmounene',
    'Jean François Mbadinga', 'Hilaire Berri', 'Firmin Ihoula', 'Jean Omer Makosso',
    'Paul Ngoma', 'Jean Jacques Makosso', 'Evrad Bipoumba'];

  /* ----------------------------------------------------------------------
     Histoire, exploitation, richesses, marché
     ---------------------------------------------------------------------- */
  var histoire = [
    { annee: '1925', date: '1925', titre: "Subdivision de la Nyanga",
      texte: "Divénié est une subdivision de la circonscription de la Nyanga, au Gabon." },
    { annee: '1928', date: '22 novembre 1928', titre: "Rattachée à la N'Gounié",
      texte: "La circonscription passe sous l'autorité de la N'Gounié." },
    { annee: '1934', date: '15 novembre 1934', titre: 'Poste de contrôle administratif',
      texte: "Par arrêté, Divénié devient poste de contrôle administratif dans le département du Niari-Ogooué, au Moyen-Congo." },
    { annee: '1936', date: '28 décembre 1936', titre: 'Subdivision du Niari',
      texte: "Divénié retrouve le statut de subdivision dans le département du Niari ; elle le conservera jusqu'à l'indépendance, sous forme de district." },
    { annee: '1961', date: '1961', titre: "L'exploitation forestière commence",
      texte: "La SFD (Société Forestière de Divénié) ouvre le paysannat ; le village de Ngouha 1 devient un pôle de spéculations forestière et agricole, avec l'OCC (Office du Café et du Cacao) et l'OCV (Office de Culture Vivrière) pour la collecte et la commercialisation." },
    { annee: '1960s', date: 'Années 60', titre: 'Les premiers permis',
      texte: "Quatre opérateurs obtiennent un permis d'exploitation du bois de Divenié : près de vingt-huit mille hectares contrôlés." },
    { annee: 'aujourd’hui', date: 'Aujourd’hui', titre: 'Nouveaux opérateurs',
      texte: "Le bois est exploité par des opérateurs malaisiens ; les populations rurales et urbaines ne bénéficient pas encore des retombées de cette exploitation." }
  ];

  var permis = [
    { exploitant: 'M. Thomas Costade', ha: 500, essence: 'bois divers' },
    { exploitant: 'M. Francis Della Faille', ha: 10000, essence: 'bois divers' },
    { exploitant: 'Société de l’Okoumé de Sindara (SOS)', ha: 8500, essence: 'okoumé' },
    { exploitant: 'M. René Pech', ha: 8700, essence: 'bois divers' }
  ];

  var richesses = [
    { nom: 'Or vert', texte: 'le bois, richesse quasi-inépuisable depuis les années 60', icone: 'grumes' },
    { nom: 'Diamant', texte: 'pierre précieuse des profondeurs', icone: 'diamant' },
    { nom: 'Bauxite', texte: 'minerai des sols rouges', icone: 'bauxite' },
    { nom: 'Gaz naturel', texte: 'énergie des entrailles de la terre', icone: 'gaz' }
  ];

  var marchands = {
    principaux: ['Pech', 'Pierre Robin', 'Vicente Pinheiro', 'Barbier', 'Georges Mabounda',
      'Lazare Boussougou', 'Congo Malembe', 'André Mackosso', 'Zéphirin Ndoudi',
      'Gilbert Ngongo', 'Philippe Iboungha', 'Marcel Nguekana', 'Vale', 'Massamba',
      'Mbemboura', 'Ngoma Boumbidi', 'Florent Mouloungui', 'Koumba Mandoukou',
      'Victor Bidounda', 'Étienne Bika Moudouma', 'Émile Moutsongo', 'Charles Ngoma',
      'Jean Pierre Makoumbi', 'Yogo Madila', 'Emmanuel Ngoma', 'Niama Boussiengui',
      'Philippe Vimba', 'Albert Ngombo', 'Poha', 'Bernard Lekaha',
      'Sébastien Boungoto', 'Manonza', 'Kehili', 'Imimi', 'Lepegni',
      'Pierre François Batchy'],
    complements: ['Moukarave', 'Djodjo', 'Madoka', 'Anicet', 'Famille Bihoundou', 'Famille Ngongo']
  };

  var citations = [
    { texte: "Le bois de Divenié, une richesse quasi-inépuisable depuis les années 60.", source: 'Chronique locale' },
    { texte: "Divenié était attractif, avec un centre urbain esthétique, beau et propre.", source: 'Chronique locale' },
    { texte: "Les routes furent construites selon les règles de l'art ; des écoles, des ponts durables.", source: 'Chronique locale' }
  ];

  /* ----------------------------------------------------------------------
     Chapitres (pagination) — la navigation est pilotée par ces données
     --------------------------------------------------------------------- */
  var chapitres = [
    { route: 'seing', num: '01', titre: 'Seing', court: 'Seing', kicker: 'Plein ouverture' },
    { route: 'atlas', num: '02', titre: 'Atlas', court: 'Situation', kicker: 'Géographie' },
    { route: 'cite', num: '03', titre: 'Cité', court: 'Cité', kicker: 'Quartiers & ethnies' },
    { route: 'chroniques', num: '04', titre: 'Chroniques', court: 'Chroniques', kicker: 'Les 46 administrateurs' },
    { route: 'voix', num: '05', titre: 'Voix', court: 'Voix', kicker: 'Élus & desservants' },
    { route: 'or-vert', num: '06', titre: 'Or vert', court: 'Or vert', kicker: 'Histoire & forêt' },
    { route: 'kodu', num: '07', titre: 'Kodu maghasi', court: 'Kodu maghasi', kicker: 'Les affairistes' }
  ];

  /* ----------------------------------------------------------------------
     Chiffres dérivés (jamais saisis deux fois)
     --------------------------------------------------------------------- */
  var nbVillages = axes.reduce(function (t, ax) {
    return t + ax.villages.length + (ax.hameaux ? ax.hameaux.length : 0);
  }, 0);

  var stats = [
    { valeur: 5, suffixe: '', label: 'axes routiers' },
    { valeur: nbVillages, suffixe: '', label: 'villages & hameaux' },
    { valeur: cite.quartiers.length, suffixe: '', label: 'quartiers urbains' },
    { valeur: cite.blocs.length, suffixe: '', label: 'blocs' },
    { valeur: ethnies.length, suffixe: '', label: 'ethnies' },
    { valeur: administrations.length, suffixe: '', label: 'administrateurs depuis 1934' },
    { valeur: deputes.length, suffixe: '', label: 'députés' },
    { valeur: maires.length, suffixe: '', label: 'maires' }
  ];

  window.DIVENIE = {
    meta: {
      titre: 'District de Divenié',
      epithete: 'Terre Bénie',
      departement: 'Département du Niari',
      pays: 'République du Congo',
      region: 'Sud-Ouest'
    },
    chapitres: chapitres,
    stats: stats,
    limites: limites,
    axes: axes,
    cite: cite,
    ethnies: ethnies,
    epoques: epoques,
    administrations: administrations,
    deputes: deputes,
    maires: maires,
    religieux: { clerge: clerge, laics: laics },
    histoire: histoire,
    permis: permis,
    richesses: richesses,
    marchands: marchands,
    citations: citations,
    outils: { dureeMois: dureeMois, precision: precision }
  };
})();
