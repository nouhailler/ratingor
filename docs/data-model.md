# Modèle v1

Entités : Company (id, nom, alias, pays ISO à deux lettres, entreprise/banque), Agency (id et nom), Source (id, nom, URL et statut), Rating (clé de série companyId/agencyId/type/instrument/currency), RatingEvent (enregistrement immuable), ImportBatch et Preferences.

Chaque ligne JSON/CSV est un événement normalisé plat. Champs exacts : id, companyId, companyName, aliases (tableau JSON ou chaîne séparée par | en CSV), country, sector, agencyId, type, instrument, currency, grade (null si retrait), outlook, action, publishedAt (YYYY-MM-DD ou null), collectedAt (ISO UTC), sourceUrl (HTTPS sans identifiants), verification (imported ou verified, déclaration utilisateur), rights (redistributable, personal-only ou unknown), rightsEvidence (URL HTTPS obligatoire pour redistributable), supersedes (id ou null).

Types : issuer-long-term, issuer-short-term, senior-unsecured, subordinated, deposit. Actions : assigned, affirmed, upgraded, downgraded, withdrawn, corrected. Perspectives : stable, positive, negative, developing, unknown. Les échelles restent celles des agences, aucune conversion.

Retraits : événement conservé avec grade null. Corrections : nouvelle ligne avec supersedes ciblant un événement existant de même série ; cycles et références absentes refusés. Une correction ne supprime rien. Doublons : même id/contenu ignoré ; id différent mais même contenu métier ignoré ; id existant avec contenu différent rejeté. Identité entreprise immuable dans ce MVP ; renommer impose une future migration explicite.

Le courant est l'événement non remplacé de date publiée la plus récente, puis date collectée, puis id ; les événements à date inconnue sont conservés séparément et empêchent de prétendre que le courant daté est certain. Source, publication et collecte sont affichées distinctement. Dates futures refusées ; la fraîcheur mesure le temps depuis collecte, pas l'actualité de l'opinion.

Stockage IndexedDB atomique d'un snapshot v1 (événements, lots, préférences). Un import partiel demande une confirmation explicite après aperçu. Export JSON : uniquement événements redistribuables avec preuve, hors corrections dont la cible est exclue. Aucun export global des données à droits inconnus.
