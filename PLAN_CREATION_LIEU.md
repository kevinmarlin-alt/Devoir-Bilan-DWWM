# Plan de référence — création d'un lieu

Ce document fixe le périmètre et l'ordre de réalisation de la fonctionnalité de création de lieu.

## Décision de périmètre

Il n'y aura **pas de téléversement de fichiers image** pour ce projet. Lors de la création d'un lieu, l'administrateur sélectionne uniquement des images déjà présentes en base de données.

## Objectif

Permettre à un administrateur de créer un lieu en brouillon, puis de le publier une fois les informations requises complétées.

## Données attendues

Le formulaire envoie à l'API :

- `name`
- `description`
- `categoryId`
- `exploitationTypeIds`
- `imageIds`
- `status` : `draft` ou `published`

Le `slug` est généré côté API afin de préserver l'unicité et d'éviter une logique métier dupliquée dans l'interface.

## Plan d'action

> **Validation obligatoire :** chaque étape ci-dessous doit être validée explicitement par le propriétaire du projet avant le démarrage de l'étape suivante. Cette demande de validation doit être accompagnée de captures d'écran servant de preuve de l'ajout. Avant la validation finale, un test de vérification de bout en bout doit confirmer que la fonctionnalité est ajoutée et fonctionne de manière sûre.

1. Ajouter la route API `POST /api/admin/places`.
2. Valider les données reçues : nom obligatoire ; pour une publication, description, catégorie, au moins un type d'exploitation et une image sont obligatoires.
3. Vérifier l'existence de la catégorie, des types d'exploitation et des images fournis.
4. Créer le lieu dans une transaction SQL/Sequelize.
5. Enregistrer les relations entre le lieu et ses types dans `place_exploitation_type`.
6. Rattacher les images sélectionnées au lieu via `image.place_id`, en définissant si nécessaire une image principale.
7. Côté interface, ajouter le service `createPlace()` et implémenter `createHandler` dans `PlacesCreateView.vue`.
8. Relier le bouton « Enregistrer » à la création/mise à jour d'un brouillon et le bouton « Publier » à la création/mise à jour avec le statut `published`.
9. Afficher les états de chargement, succès et erreur ; empêcher les doubles soumissions.
10. Tester le parcours complet : brouillon, publication, champs manquants, identifiants invalides, associations images/types et apparition du lieu dans la liste.

## Règles fonctionnelles

- Un brouillon requiert au minimum un nom.
- Une publication requiert un nom, une description, une catégorie, au moins un type d'exploitation et au moins une image sélectionnée.
- Les images sont préexistantes : aucune route d'upload ni gestion de fichiers n'est à développer dans ce périmètre.

## Protocole de preuve et de validation

- À la fin de chaque étape, fournir des captures d'écran pertinentes de l'interface ou du résultat attendu.
- Attendre une validation explicite du propriétaire du projet avant de commencer l'étape suivante.
- Après la dernière étape, exécuter un test de bout en bout couvrant le parcours brouillon et publication, les contrôles de validation et la persistance des relations (catégorie, types et images).
- Rapporter les résultats observables de ce test avant de demander la validation finale.

## État constaté au 5 novembre 2026

L'interface du parcours en trois étapes existe et permet de sélectionner catégories, types et images. La persistance n'est pas encore branchée : `createHandler` est absent et l'API n'expose pas encore de route de création de lieu.
