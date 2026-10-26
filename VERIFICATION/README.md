# VÉRIFICATION — preuves des audits réellement exécutés

Ce dossier conserve la trace des contrôles **réellement exécutés** sur le site
(référentiel Web Quality System v2.0, §16 : « ne présente jamais une vérification comme
réussie si elle n'a pas réellement été effectuée »).

## Ce qui a été exécuté, le 26 octobre 2026

| Contrôle | Outil réellement installé et lancé | Portée |
|---|---|---|
| Audit navigateur : accessibilité, interactions, mesures | **Playwright 1.49.1** (pilote le Chrome installé sur la machine) + **axe-core 4.10.2** injecté dans la page | 7 chapitres × bureau 1440×900 + 5 chapitres × mobile 390×844 |
| Contrôle visuel **mesuré** | script dédié dans le navigateur (pas d'inspection d'images) | contraste WCAG sur couleurs rendues, longueur de ligne, tailles de police, tailles de cibles |
| Non-régression fonctionnelle | **jsdom 30.1.3** (exécution réelle de `data.js` + `app.js`) | 28 assertions : comptages, clavier, filtres, fiche, bascule de vue, mode sobre |
| Syntaxe | `node --check` | `data.js`, `app.js` |

## Résultats du contrôle final

- **axe-core : 0 violation** sur les 7 chapitres (était 30 avant corrections).
- **0 erreur console · 0 erreur de page** (bureau et mobile).
- **0 débordement horizontal** (bureau et mobile ; était 136 px sur mobile, ch. 07).
- **Interactions réelles vérifiées** : fiche village (Dimani) et hameau (Moubiya), filtre
  d'axes, vue « durées » (46 lignes), filtre religieux (11 abbés visibles), navigation
  clavier → `#/or-vert`, bascule animé/sobre, cible tactile de village 27×27 px.
- **Performance mesurée** : ~92 Ko de ressources par chapitre (HTML+CSS+JS), 0 ressource
  inutile ; polices Fraunces + Space Grotesk effectivement chargées.
- **Non-régression jsdom : 28 ✓ / 0 ✗.**

## Problèmes détectés puis corrigés (sélection)

| Constat | Correction |
|---|---|
| Débordement 136 px sur mobile (ch. 07) | `overflow-wrap: anywhere` + justification désactivée ≤ 720 px |
| Régions de défilement non focalisables au clavier | `tabindex="0"` + `role="region"` + `aria-label` sur les 7 chapitres |
| Chapitres 02–07 sans `h1` | un `h1` par chapitre, hiérarchie corrigée |
| Contraste 2,28:1 (ocre sur papier) | jetons AA : `--ocre-sombre #8a6316` (clair), `--dore #f5d089` (sombre) |
| Cibles de clic trop petites / qui se recouvraient | cible 27 px sans recouvrement + libellés de villages cliquables |
| Textes minuscules (9–9,5 px) | tous ≥ 10 px |

Le détail chronologique est consigné dans `../MEMOIRE.md` (§4bis).
Le rapport brut (JSON) produit par l'auditeur est dans `audit.json`.
