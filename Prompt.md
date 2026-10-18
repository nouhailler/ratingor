# Mission Codex — Développer Ratingor, application gratuite de suivi des notations de crédit

## 1. Objectif

Développer une PWA open source permettant de consulter, comparer et historiser les notations publiques de crédit des entreprises et des banques.

Le projet doit fonctionner sans abonnement à des données financières, sans API payante, sans clé secrète côté navigateur et sans backend obligatoire.

La couverture pourra être partielle. Il est strictement interdit d'inventer des notes, des historiques, des sources, des résultats de collecte ou des fonctionnalités prétendument opérationnelles.

## 2. Règles impératives

1. Travaille par étapes. Termine et vérifie chaque étape avant de commencer la suivante.
2. Commence par examiner le dépôt existant. Ne remplace pas arbitrairement son architecture ou ses fichiers.
3. Avant de coder un connecteur, vérifie la documentation, les conditions d'accès, les formats réellement disponibles, les droits de réutilisation et la faisabilité technique.
4. N'utilise aucune API payante, aucun essai payant et aucune clé commerciale.
5. Ne contourne jamais une authentification, un CAPTCHA, une restriction technique ou une limitation d'accès.
6. Ne suppose jamais qu'un site public possède une API JSON, un flux RSS ou des exports automatisables.
7. Ne publie aucune donnée sans provenance vérifiable.
8. N'écrase pas l'historique des notations : chaque action confirmée doit être conservée.
9. Ne présente pas une date de collecte comme une date de publication.
10. Ne déclare jamais un test réussi sans l'avoir exécuté et vérifié.
11. Si une source ne peut pas être exploitée gratuitement ou légalement, documente cette limite et propose l'import manuel.
12. Ne présente pas une fonctionnalité partielle comme terminée.

## 3. Sources à étudier

Étudie notamment :

- ESMA European Rating Platform : https://registers.esma.europa.eu/publication/
- ESMA CEREP : https://registers.esma.europa.eu/cerep-publication/
- S&P Global Ratings : https://www.spglobal.com/ratings/
- Moody's Ratings : https://ratings.moodys.com/
- Fitch Ratings : https://www.fitchratings.com/
- Scope Ratings : https://www.scoperatings.com/
- Morningstar DBRS : https://dbrs.morningstar.com/
- SEC EDGAR : https://data.sec.gov/

Ces URLs sont des points de départ, pas la preuve qu'une API gratuite ou un accès automatisé existe.

Pour chaque source, établis un registre contenant :
- nom et URL ;
- catégories de données accessibles ;
- formats réellement testés ;
- nécessité éventuelle d'un compte ;
- conditions de réutilisation et d'attribution ;
- possibilité de collecte automatisée ;
- CORS et contraintes réseau si pertinents ;
- limites de fréquence et d'historique ;
- méthode de collecte retenue ;
- état : opérationnel, partiel, manuel uniquement ou bloqué ;
- preuve du test réalisé ;
- date de vérification.

## 4. Étape 1 — Audit et faisabilité

Avant de développer l'application :

- inspecte le dépôt, les dépendances et les conventions existantes ;
- vérifie les sources de données et leur documentation ;
- identifie les formats d'import possibles ;
- définis un schéma de données normalisé ;
- prépare un registre des sources ;
- identifie les risques juridiques et techniques ;
- distingue les faits vérifiés des hypothèses.

Livrables :
- `docs/source-audit.md`
- `docs/data-model.md`
- `docs/architecture.md`
- `docs/implementation-plan.md`

Ne commence pas l'automatisation d'une source dont l'accès et les droits ne sont pas suffisamment établis. Si une source ne peut pas être testée, indique explicitement pourquoi.

## 5. Étape 2 — Socle fonctionnel

Utilise React, TypeScript et Vite si le dépôt ne possède pas déjà une architecture adaptée.

Implémente :
- tableau de bord ;
- catalogue des entreprises et banques ;
- recherche par nom, alias, pays et identifiant ;
- filtres par agence, type de notation, note, perspective et date ;
- fiche détaillée d'une entreprise ;
- liens vers les sources officielles ;
- affichage des données absentes ;
- état vide explicite lorsqu'aucune donnée n'est disponible.

Chaque note doit avoir une provenance. Une note non vérifiée ne doit pas être présentée comme officielle.

## 6. Étape 3 — Modèle de données et historique

Prévois des entités distinctes pour les entreprises, les agences, les notations, les événements de notation et les sources.

Chaque notation doit pouvoir contenir :
- identifiant stable ;
- entreprise concernée ;
- agence ;
- type de notation ;
- note officielle ;
- perspective ;
- action de notation ;
- date de publication ;
- date de collecte ;
- URL source ;
- état de vérification ;
- statut des droits de réutilisation.

Conserve les événements historiques. Traite explicitement les retraits, corrections, doublons et dates inconnues.

Ne convertis pas les échelles des agences en une note unique sans méthodologie documentée. Le MVP doit afficher les notes d'origine.

## 7. Étape 4 — Import et qualité

Implémente un import JSON/CSV avec :
- validation stricte du schéma ;
- aperçu avant confirmation ;
- détection des doublons ;
- rapport des lignes rejetées ;
- validation des dates, identifiants et URLs ;
- contrôle de provenance ;
- gestion des imports partiels ;
- historique des modifications.

Un fichier invalide ne doit jamais corrompre les données déjà présentes.

Ajoute des exemples de données explicitement fictives pour les tests et les maquettes. Ces exemples ne doivent pas être intégrés au catalogue de production comme des notations réelles.

## 8. Étape 5 — PWA et stockage

Implémente :
- manifeste PWA ;
- Service Worker ;
- cache des ressources de l'application ;
- consultation hors ligne des données déjà disponibles ;
- IndexedDB pour les données locales et les préférences ;
- favoris et listes de surveillance ;
- indicateurs de fraîcheur des données.

Aucun backend ne doit être requis pour le MVP. La synchronisation doit être déclenchée par l'utilisateur ou par un mécanisme compatible avec l'hébergement retenu.

Ne promets pas des notifications en arrière-plan permanentes si la plateforme ne les garantit pas.

## 9. Étape 6 — Connecteurs

Pour chaque source, développe un adaptateur indépendant.

Ordre de priorité :
1. imports officiels et fichiers publics réutilisables ;
2. interfaces de données documentées et gratuites ;
3. publications officielles dont l'exploitation automatisée est autorisée ;
4. import manuel lorsqu'aucune autre méthode fiable n'est possible.

Un connecteur doit gérer :
- erreurs réseau ;
- données manquantes ;
- réponses inattendues ;
- changements de format ;
- limitations d'accès ;
- dédoublonnage ;
- journal de collecte ;
- date de dernière réussite ;
- provenance de chaque donnée.

Si le connecteur n'est pas vérifiable ou fiable, désactive-le par défaut et documente son état. Ne crée pas de données de démonstration pour simuler son succès.

## 10. Étape 7 — Tests obligatoires

Ajoute des tests unitaires, d'intégration et de parcours utilisateur.

Vérifie au minimum :
- build de production ;
- recherche et filtres ;
- import valide et invalide ;
- détection des doublons ;
- conservation de l'historique ;
- affichage des dates inconnues ;
- absence de source ;
- retrait d'une note ;
- distinction des types de dette ;
- comparaison des agences ;
- fonctionnement hors ligne ;
- persistance des favoris ;
- sécurité de l'affichage des contenus importés ;
- export conforme aux droits de réutilisation ;
- comportement en cas d'indisponibilité d'une source.

Exécute réellement les tests. Enregistre les commandes, résultats, échecs et limites. Ne masque aucun test en échec.

## 11. Étape 8 — Interface et documentation

L'interface doit être claire, responsive, accessible et adaptée à un outil financier documentaire.

Prévois :
- tableau de bord ;
- catalogue ;
- fiche entreprise ;
- comparaison ;
- historique ;
- favoris ;
- gestion des imports ;
- statut des sources ;
- page méthodologie et limites ;
- paramètres locaux.

Le design doit distinguer visuellement les données vérifiées, anciennes, inconnues et expérimentales sans faire croire qu'une absence de données représente un risque faible.

Documente l'installation, les commandes de développement, les tests, le build, le déploiement et la mise à jour des données.

## 12. Étape 9 — Déploiement gratuit

Prépare le projet pour un hébergement statique gratuit compatible avec la PWA.

Vérifie :
- commande de build ;
- répertoire de sortie ;
- routes et rechargement des pages ;
- HTTPS ;
- manifeste ;
- Service Worker ;
- fonctionnement hors ligne ;
- absence de secrets dans le bundle ;
- absence de dépendance à un service payant.

Ne déclare pas le déploiement opérationnel si tu n'as pas pu le tester sur la plateforme concernée.

## 13. Rapport final obligatoire

Produis `docs/implementation-report.md` avec un tableau comportant :

| Fonctionnalité | État | Preuve | Limite restante |
|---|---|---|---|

Utilise uniquement les états :
- Implémenté et testé ;
- Implémenté, test incomplet ;
- Partiellement implémenté ;
- Non implémenté ;
- Bloqué par une source externe.

Le rapport doit aussi présenter :
- les sources réellement opérationnelles ;
- les sources accessibles manuellement uniquement ;
- les licences et restrictions identifiées ;
- les formats testés ;
- les tests exécutés et leurs résultats ;
- les fonctionnalités manquantes ;
- les problèmes connus ;
- les commandes de build et de test ;
- les instructions de déploiement ;
- les étapes recommandées ensuite.

## 14. Critère final de réussite

Le projet est considéré comme livrable lorsque l'application permet de consulter des données vérifiées ou importées, de rechercher des entreprises, d'afficher leurs notes avec leurs sources, de conserver l'historique disponible et de fonctionner hors ligne avec les données déjà enregistrées.

L'absence d'une source gratuite ne constitue pas un échec si elle est documentée et si l'application continue de fonctionner.

La priorité est la fiabilité, la traçabilité, le respect des licences et la transparence sur les limites — jamais le nombre de notations affichées.
