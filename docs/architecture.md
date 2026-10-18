# Architecture

React + TypeScript + Vite, application statique sans backend. Modules purs pour parsing/validation, historique, recherche et export ; adaptateur IndexedDB ; registre statique des sources désactivées. Aucun appel automatique à une agence et aucune clé.

Navigation par hash : compatible hébergement statique et rechargement. Service Worker limité à l'origine et au dossier de l'application : précache des fichiers construits et repli index pour navigation. IndexedDB conserve les données indépendamment du cache. Pas de synchronisation/notification en arrière-plan promise. Les changements sont écrits atomiquement avant d'être affichés comme sauvegardés ; erreur de stockage visible.

React échappe les contenus importés ; URLs HTTPS uniquement, aucun HTML importé rendu. CSV via PapaParse, schéma via Zod. Limite import : 2 Mo et 10 000 lignes. Données fictives exclusivement examples/, chargées uniquement par import explicite.
