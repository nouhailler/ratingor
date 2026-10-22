# Validation et mise en ligne — 22 octobre 2026

Ce document complète le rapport historique du 18 octobre. Le catalogue reste vide au démarrage ; aucune note réelle et aucun résultat de collecte ne sont simulés.

| Fonctionnalité | État | Preuve | Limite restante |
|---|---|---|---|
| CI GitHub Actions | Implémenté et testé | [Exécution GitHub réussie](https://github.com/nouhailler/ratingor/actions/runs/39783805682), détails `ci-run.json` | Les futurs changements de code doivent rester couverts par la CI |
| Contrôles WCAG automatisés | Implémenté et testé | 28 scans axe sans violation détectée : 9 pages vides, aperçu, catalogue/historique/fiche/comparaison avec données, à 1440 et 390 px | Ce résultat ne constitue pas un audit WCAG exhaustif ni une certification ; les points axe `incomplete` restent à examiner manuellement |
| Navigation clavier | Implémenté et testé | Test du lien de contournement, focus du contenu et du titre après navigation, saisie dans la recherche | Pas de validation lecteur d’écran NVDA/VoiceOver ni de tous les parcours au clavier |
| Contraste et lisibilité | Implémenté et testé | Textes secondaires assombris, labels de statut corrigés, petits textes relevés à 11 px, liens de paragraphe soulignés ; scans sans violation | Revue humaine complémentaire requise, notamment zoom/espacement du texte et contenus exceptionnels |
| PWA locale et stockage | Implémenté et testé | Parcours d’import, favoris, rechargement hors ligne et conservation IndexedDB | Installation iOS/Safari/Firefox non validée |
| Déploiement HTTPS | Implémenté et testé | Sites retourne `succeeded` ; sept ressources HTTPS privées contrôlées, preuve `deployment-check.json` | Parcours navigateur connecté et hors ligne sur cette origine non testés ; voir distinction ci-dessous |
| Réaudit des huit sources | Implémenté, test incomplet | Section datée du 22 octobre dans `source-audit.md`, documents officiels liés | Aucun jeu de données fournisseur téléchargé ; CORS non testé empiriquement |
| Collecteurs de notes et actualisation distante | Bloqué par une source externe | Droits et accès insuffisants ; interdictions explicites Moody’s/DBRS, restrictions S&P/Fitch | Aucun connecteur de notes activé, nouvel import autorisé nécessaire |
| Notifications automatiques | Non implémenté | Aucun mécanisme de collecte activé | Aucun suivi permanent ni notification de changement promis |

## Vérifications locales exécutées

- `npm test` : 14 tests réussis sous Vitest 4.1.12.
- `npm run build` : TypeScript, Vite 6.4.4 et génération de cache réussis ; sortie `dist/`.
- `npm run test:e2e` : 7 tests réussis en 17,6 s, dont 28 scans axe WCAG A/AA avec les règles disponibles jusqu’à 2.2, et un parcours clavier.
- Installation reproductible via le helper Sites (`npm ci`) : réussie après mise à jour du verrou.
- Audit npm après mise à jour : aucune vulnérabilité signalée. Ce contrôle n’est pas un audit de sécurité applicatif exhaustif.

## Échecs rencontrés et réparations

Le premier installateur a refusé le décalage package.json/verrou après ajout d’axe. Mise à jour du verrou puis installation réussie. La résolution standard de la migration Vitest a rencontré une erreur interne npm `edgesOut` ; verrou recalculé avec `--legacy-peer-deps`, puis **npm ci standard sans cette option a réussi**. Aucun contournement permanent de dépendances requis.

L’ancien Vitest 3 entraînait trois signalements d’audit (mocker/tinypool). Migration ciblée vers Vitest 4.1.12, compatible Node 22 et Vite 6 ; tests conservés et exécutés.

Les premiers scans ont échoué sur les contrastes, puis sur la distinction des liens en paragraphe et les couleurs des badges. Corrections du style, sans désactiver les règles axe. Résultat final : 7 tests sur 7 réussis, aucun test ignoré. Les rapports HTML et pièces jointes axe conservent les points à examiner manuellement.

## CI et publication

La CI utilise Node 22, les dépendances verrouillées et Chromium Playwright. Permissions GitHub limitées à la lecture du contenu, sans secret applicatif. Elle s’exécute sur push de main, pull request et déclenchement manuel. Elle ne collecte aucune notation et ne publie aucun fichier d’import utilisateur.

Le déploiement Sites utilise uniquement le build statique, sans backend métier ni clé commerciale. L’identité du site n’est pas une preuve de publication : le résultat de déploiement effectif sera consigné ci-dessous. Le site créé conserve son accès privé par défaut. Les données de localhost ne migrent pas automatiquement vers l’origine HTTPS.

## Compléments manuels restant nécessaires

Audit WCAG humain : lecteurs d’écran, pertinence des intitulés et annonces, ordre de lecture, zoom 200/400 %, espacement du texte, situations d’erreur complètes et différents navigateurs. Les règles automatiques ne couvrent pas tous les critères. Recontrôler aussi l’installation PWA et les mises à jour de cache sur chaque navigateur cible.

## Publication effective et preuve HTTPS

Site : **https://ratingor-credit-register.robertdenero.chatgpt.site**. Accès privé propriétaire, connexion ChatGPT requise. Déploiement Sites `appgdep_6ada0a1bc19881919cf553a22594810b`, état `succeeded` le 22 octobre 2026 à 15:05:47 (Europe/Zurich). Source hébergée : commit `cb4e0ff857b474cd5372f62d4a7d2d48130ebfb1`, version de publication 1. L’archive est construite à partir du source poussé correspondant, sans données d’import utilisateur.

Contrôle HTTP authentifié avec le justificatif temporaire propriétaire fourni par Sites, validation TLS normale : `index.html`, manifeste, Service Worker, deux icônes PNG, JavaScript et CSS retournent **HTTP 200** et les types MIME attendus. Les six ressources hors HTML correspondent exactement au build par empreinte SHA-256. Le HTML est transformé par l’hébergeur ; son point de montage, titre et références aux assets du build ont été vérifiés. Aucune origine de script externe détectée dans ce contrôle. Résultats détaillés sans secret : [`deployment-check.json`](deployment-check.json).

Les premières tentatives HTTP ont reçu 401 puis une redirection, avant correction du format Bearer et prise en charge du cookie d’authentification interne. La vérification finale réussit. Aucun jeton ou cookie n’a été écrit dans le dépôt.

L’ouverture en navigateur a confirmé le portail de connexion privé, puis demandé une connexion OpenAI non disponible dans ce profil. Les tests fonctionnels navigateur, axe et hors ligne concernent la version locale de production ; ils ne sont pas présentés comme des tests navigateur connectés de l’origine publiée. Une connexion utilisateur est nécessaire pour terminer ces vérifications en production. Les politiques de quota/prix de l’hébergement ne sont pas auditées et aucun abonnement payant n’a été souscrit.

## Résultat GitHub Actions

L’[exécution 39783805682](https://github.com/nouhailler/ratingor/actions/runs/39783805682) est terminée avec la conclusion **success** sur le commit `4ff8d191722c8212a350ed10316467a951865604`. Installation npm, tests unitaires, build, installation Chromium, tests fonctionnels et axe, archivage des rapports : toutes les étapes requises ont réussi. La preuve de statut et les étapes se trouvent dans [`ci-run.json`](ci-run.json).

Le commit de documentation qui ajoute les preuves de publication et de CI utilise `[skip ci]` pour éviter une seconde installation des navigateurs sans changement de code ; il ne supprime aucun test de la suite. Le code applicatif et la configuration CI restent ceux de l’exécution réussie ci-dessus.
