# Rapport d’implémentation — 18 octobre 2026

Le MVP local est construit. Le catalogue démarre vide. Les imports JSON/CSV permettent de consulter des notes, conserver les événements et leurs sources, rechercher, comparer et consulter hors ligne après activation du cache. Aucun enregistrement réel n’a été inventé ou préchargé. Aucun déploiement public effectué.

| Fonctionnalité | État | Preuve | Limite restante |
|---|---|---|---|
| Audit du dépôt et des huit sources | Implémenté, test incomplet | `source-audit.md`, lecture des huit pages de départ et documentation officielle | Pas de contrôle exhaustif des contrats, de CORS distant ni d’export de chaque fournisseur |
| Tableau de bord, catalogue et états vides | Implémenté et testé | Parcours Playwright 1, capture desktop inspectée | Catalogue initial volontairement vide |
| Recherche nom, alias, pays et identifiant | Implémenté et testé | Tests unitaires recherche et parcours 1 | Pays recherché par code ISO, sans géocodage |
| Filtres agence, type, note, perspective, dates | Implémenté et testé | Test unitaire combiné et parcours 1 | Dates inconnues exclues des filtres de dates |
| Fiche entreprise, provenance et liens | Implémenté et testé | Parcours 1 et 2 | URL et vérification déclarées par l’importateur ; pas de contrôle d’authenticité distant |
| Entités et séries de notation | Partiellement implémenté | `core.ts`, clé de série distincte et registres d’agences/sources | Format d’échange plat ; entreprises et séries projetées depuis les événements, pas de CRUD autonome |
| Historique immuable, retraits, corrections, doublons | Implémenté et testé | Tests unitaires dédiés, parcours historique 2 | Corrections ordonnées : cible avant correction ; une correction directe par cible ; renommage entreprise non pris en charge |
| Publication et collecte distinctes, dates inconnues | Implémenté et testé | Tests unitaires et parcours 2 | La vue par série est une convention de tri, pas la garantie de la note actuelle |
| Comparaison des échelles d’origine | Implémenté et testé | Test séries/types/agences et parcours 4 | Présentation tabulaire, aucune équivalence calculée |
| Import JSON et CSV strict | Implémenté et testé | Fixtures JSON/CSV, tests unitaires, parcours 1, 2 et 4 | Schéma Ratingor uniquement, aucun format fournisseur natif pris en charge |
| Aperçu, import partiel, rejets et non-corruption | Implémenté et testé | Parcours 2 et 4, tests d’intégrité | Limites 2 Mo / 10 000 lignes, rapport rejeté téléchargeable pendant l’aperçu |
| Journal des modifications par import | Implémenté et testé | Lots atomiques IndexedDB, tests stockage et parcours 1 | Journal de lots et événements ; pas de journal des changements de préférences |
| Favoris, surveillance et préférences IndexedDB | Implémenté et testé | Test stockage, parcours 1 avec rechargement | Pas de fusion concurrente multi-onglets ; aucune notification distante |
| Fraîcheur et statuts de vérification | Implémenté, test incomplet | Rendu contrôlé, seuil paramétrable et marqueurs dans le tableau | Pas de test navigateur dédié à tous les seuils ; vérification uniquement déclarative |
| Manifeste et icônes PWA | Implémenté, test incomplet | Build, manifeste et PNG 192/512 produits | Installation depuis une plateforme HTTPS et iOS non testées |
| Cache et consultation hors ligne | Implémenté et testé | Parcours 1 : Service Worker actif, réseau coupé, rechargement, favoris conservés | Chromium local ; premier chargement en ligne nécessaire ; liens externes indisponibles hors ligne |
| Adaptateur d’import local | Implémenté et testé | `parseImport`, parcours JSON/CSV | L’utilisateur normalise son fichier et contrôle ses droits |
| Connecteurs distants par fournisseur | Bloqué par une source externe | Audit, registre UI, refus explicite `collect()` testé | Aucun adaptateur de collecte réseau développé/activé, droits ou accès insuffisamment établis |
| Journaux et dernière réussite de collecte réseau | Non implémenté | UI indique aucune collecte | Pas de collecte réseau ; journal d’import local disponible |
| Sécurité d’affichage | Implémenté et testé | URL dangereuses refusées, texte HTML affiché sans élément image en parcours 2 | Pas d’audit de sécurité exhaustif ; fichiers locaux de confiance à privilégier |
| Export conforme aux droits déclarés | Implémenté et testé | Test d’exclusion droits inconnus/personnels et corrections orphelines, téléchargement parcours 2 | Preuve fournie par l’utilisateur, non expertisée ; pas de sauvegarde intégrale des contenus non exportables |
| Interface responsive et accessible | Implémenté, test incomplet | Labels, focus visible, navigation native, contrôle largeur mobile et rendu desktop | Pas d’audit WCAG complet ni de test lecteur d’écran |
| Installation, build et déploiement documentés | Implémenté et testé | `README.md`, compilation TypeScript et Vite | Livraison du dossier `dist/`, hébergement à choisir |
| Déploiement gratuit HTTPS externe | Non implémenté | Aucun appel de publication, aucune URL de production annoncée | Conditions de l’offre, HTTPS, headers, installation et cache à vérifier sur la plateforme retenue |

## Sources réellement opérationnelles

Seul l’import local normalisé JSON/CSV est opérationnel. Il ne constitue pas un connecteur officiel. Aucune source distante de notations opérationnelle. Liens manuels disponibles vers ESMA ERP/CEREP, S&P, Moody’s, Fitch, Scope, Morningstar DBRS et SEC EDGAR. Moody’s et Scope n’ont pas fourni de contenu exploitable à l’outil de lecture ; leur collecte est bloquée. Les autres pages initiales sont lisibles, ce qui ne valide ni l’extraction ni la redistribution.

## Licences, restrictions et formats

Code MIT (`LICENSE`). Fixtures entièrement fictives, MIT. Les droits de chaque publication tierce demeurent indépendants. S&P, Moody’s et DBRS ont des conditions limitant les usages ; l’audit n’a acquis aucune autorisation de republication. La notice générale ESMA exclut ERP de sa portée. Les droits exacts Fitch et les droits sur les données Scope restent non établis. Aucune copie de données tierces distribuée.

Formats réellement testés : lecture HTML des pages indiquées dans l’audit ; fichiers locaux JSON tableau et CSV à en-tête ; sorties JSON export/rejets ; fichiers statiques du build, manifeste et icônes PNG. Aucun export fournisseur CSV/XML/JSON et aucune API de notes n’ont été testés avec succès. Le lien « Export CSV » CEREP a été observé, sans téléchargement ni ingestion.

## Commandes et résultats exécutés

Environnement : Node 22.23.3, npm 10.9.9, Linux, Chromium Playwright. Dépendances verrouillées dans `package-lock.json`.

| Commande / vérification | Résultat observé |
|---|---|
| `npm install --cache /tmp/ratingor-npm --no-audit --no-fund` | Échec réseau DNS `EAI_AGAIN` dans le bac à sable, processus interrompu |
| `npm install --cache /tmp/ratingor-npm-net --no-audit --no-fund --fetch-retries=0 --fetch-timeout=20000` avec accès réseau autorisé | Réussi, 112 paquets installés |
| Premier `npm test` | 14 tests réussis, mais échec de suite : Vitest ramassait les tests Playwright |
| `npm test` après ciblage explicite de `tests/unit.test.ts` | **14 / 14 réussis**, dont stockage transactionnel fake-indexeddb |
| `npm run build` | **Réussi**, TypeScript + Vite + génération du Service Worker, sortie `dist/` |
| Premier serveur/test navigateur en sandbox | Échec `listen EPERM`, permission d’ouverture de serveur local requise |
| Premier `npm run test:e2e` avec accès autorisé | 1 / 3 réussi : label agence ambigu pour le sélecteur du test, date inconnue sans élément textuel propre |
| Deuxième parcours après balisage explicite | 2 / 3 réussis : échec réel de chargement des assets hors ligne avec `Vary: Origin` |
| Cache corrigé | Lecture des ressources statiques précachées avec `ignoreVary`, noms de cache isolés par scope, version incluant le code du générateur |
| `npm run test:e2e` final | **4 / 4 réussis** en 2,7 s : JSON/filtres/fiche/suivi/hors ligne ; import partiel/retraits/date inconnue/sécurité/export ; mobile/sources ; CSV/comparaison/non-corruption |
| Capture du tableau de bord 1440 px | Inspectée visuellement, rendu lisible sans défaut majeur constaté |
| Réseau externe applicatif / secrets | Code sans credentials, sans télémétrie ni appels d’API d’agence ; build statique sans configuration secrète. Ce contrôle de conception n’est pas un scanner de secrets exhaustif |

Aucun échec restant dans les suites finales exécutées. Les échecs intermédiaires sont conservés ci-dessus ; les limites non testées ne sont pas assimilées à des succès.

## Installation et déploiement

`npm ci`, `npm run dev` pour développer. `npm test`, `npm run build`, `npm run test:e2e` pour contrôler. `npm run preview` pour servir la version de production et tester le Service Worker. Publier `dist/` sur un hébergement statique gratuit avec HTTPS. Les chemins relatifs et routes hash évitent les réécritures serveur. Revalider `index.html`/`sw.js` et utiliser le cache long uniquement pour les assets versionnés. Consulter `README.md` pour les instructions détaillées.

Le serveur utilisé pour les tests est local, il ne prouve pas un déploiement sur une plateforme publique. Aucune clé, service payant ou backend requis.

## Problèmes connus et suite recommandée

1. Choisir une plateforme statique, déployer et refaire les tests hors ligne et installation PWA sur HTTPS, puis Safari/iOS et Firefox.
2. Reprendre l’audit des licences et formats fournisseur, notamment ERP, et ne développer un adaptateur distant qu’après confirmation d’accès et de droits suffisants.
3. Ajouter migrations de schéma, contrôle de concurrence multi-onglets et tests de quota IndexedDB avant un usage intensif.
4. Ajouter un audit d’accessibilité et de sécurité indépendant. Le navigateur peut effacer les données ; l’export restreint n’est pas une sauvegarde intégrale.
5. Prévoir des entités d’entreprises éditables, identifiants LEI/ISIN/CIK validés selon leurs référentiels, recherche de pays par nom et adaptateurs natifs lorsque les formats seront établis. Le MVP utilise des identifiants internes stables.
