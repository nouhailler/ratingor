# Ratingor

PWA documentaire gratuite de suivi des notations de crédit. React, TypeScript, Vite. Sans backend obligatoire, compte, clé ou abonnement. Interface française et catalogue vide au premier lancement.

Application publiée en accès privé : [ouvrir Ratingor](https://ratingor-credit-register.robertdenero.chatgpt.site) (connexion ChatGPT requise). [CI vérifiée avec succès](https://github.com/nouhailler/ratingor/actions/runs/39783805682).

Voir le [bilan actualisé du 22 octobre](docs/validation-2026-10-22.md) pour la CI, l’accessibilité et la mise en ligne.

## Installer et lancer

Node.js 22 et npm. Depuis la racine :

```sh
npm ci
npm run dev
```

## Vérifier

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Les tests Playwright lancent le serveur de production sur 127.0.0.1:4173. Pour utiliser un Chromium déjà installé : `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`.

## Utiliser

Ouvrir Imports, sélectionner un JSON ou CSV conforme à [docs/data-model.md](docs/data-model.md), examiner l'aperçu, contrôler les droits et confirmer. Un import partiel exige sa propre case de confirmation. Les exemples dans `examples/` sont entièrement fictifs et ne sont jamais intégrés automatiquement. `verified` signifie vérifié par l'importateur, aucune authentification automatique du contenu distant.

Sur une fiche, ajouter aux favoris ou à la liste de surveillance. Les événements et préférences sont conservés dans IndexedDB. L'historique est immuable ; une correction référence son événement précédent. Utiliser Historique pour examiner les publications non datées et les retraits. Comparaison affiche les échelles originales sans conversion.

L'export JSON est filtré sur les droits déclarés redistribuables avec preuve ; il ne constitue pas une sauvegarde complète des données personnelles ou aux droits inconnus. Ne comptez pas sur le stockage du navigateur comme archive unique. Fermez les autres onglets lors de modifications : pas de fusion multi-onglets dans cette version.

## Hors ligne et installation

```sh
npm run build
npm run preview
```

Charger une première fois la version de production, attendre l'activation du Service Worker puis recharger. L'application et les données enregistrées peuvent ensuite être consultées hors ligne. Le mode développement n'enregistre pas le Service Worker. Aucune notification permanente, aucune synchronisation distante. Le manifeste fournit des icônes PNG 192 et 512 pixels ; les critères d'installation diffèrent selon les navigateurs, notamment sur iOS.

## Déployer gratuitement sur un hébergement statique

Commande : `npm ci && npm run build`. Publier le dossier `dist/` sur une offre statique gratuite (par exemple GitHub Pages). Le build utilise des chemins relatifs et des routes `#`, compatibles avec un sous-répertoire et le rechargement sans réécriture serveur. Le serveur doit fournir HTTPS (localhost est accepté pour les tests), les types MIME corrects et ne pas cacher durablement `sw.js` ou `index.html` (revalidation conseillée). Les assets avec hash peuvent être mis en cache longtemps. Aucun secret à configurer.

Après publication, contrôler HTTPS, manifeste, Service Worker, rechargement, import et persistance, puis couper le réseau et recharger. L’état de publication et les vérifications HTTPS sont consignés dans le bilan actualisé lié ci-dessus.

Une mise à jour de l'application crée un nouveau cache versionné ; fermer tous les onglets pour permettre l'activation. Les données ne se mettent pas à jour seules : importer un nouveau fichier autorisé. Le schéma de stockage actuel est v1 ; ne pas changer son format sans migration.

## Sources et limites

[Audit des sources](docs/source-audit.md), [architecture](docs/architecture.md), [plan](docs/implementation-plan.md), [rapport d'implémentation](docs/implementation-report.md).

Aucun connecteur réseau de notations n'est activé. Les documents CEREP sont agrégés, EDGAR expose des dépôts/XBRL, aucun n'est traité comme un flux de notes individuelles. L'accès public ne vaut pas licence de redistribution. Les statuts d'import et droits sont déclaratifs. Cette application n'est pas un conseil financier.

## Licence

Code sous MIT. Les données importées et les publications tierces restent soumises à leurs propres droits. Les fixtures sont fictives, sous MIT.

## Intégration continue et accessibilité

Le workflow `.github/workflows/ci.yml` installe les dépendances, exécute les tests unitaires, construit la PWA et vérifie les parcours Chromium ainsi que l’accessibilité axe sur pages vides et remplies (desktop/mobile). Les rapports HTML, captures et traces d’échec sont conservés 14 jours dans les artefacts GitHub Actions. Un résultat axe sans violation ne certifie pas la conformité WCAG ; les contrôles humains restants sont documentés dans le bilan actualisé.
