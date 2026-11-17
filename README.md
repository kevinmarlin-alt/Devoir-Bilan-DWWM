# Private Place

Application web d'administration d'un catalogue de lieux destinés à différents usages (shooting, tournage, événementiel, réception, etc.). Ce projet a été réalisé dans le cadre d'une formation au métier de développeur web et web mobile (DWWM).

Le dépôt réunit une interface d'administration en Vue.js, une API REST Express et une base de données MariaDB. L'administrateur peut se connecter, gérer les catégories et les types d'exploitation, puis créer, consulter, publier ou supprimer des lieux avec leurs photographies.

## Fonctionnalités

- authentification d'un administrateur par JWT stocké dans un cookie `httpOnly` ;
- routes d'administration protégées côté API et garde de navigation côté Vue Router ;
- gestion des catégories : liste, création, modification, activation et suppression ;
- gestion des types d'exploitation : liste, création, modification, activation et suppression ;
- gestion des lieux : liste filtrable, détail, création en plusieurs étapes, brouillon, publication et suppression ;
- association d'un lieu à une catégorie, à plusieurs types d'exploitation et à plusieurs images ;
- sélection d'une photographie principale ;
- validation métier avant la publication d'un lieu ;
- transactions SQL lors de la création et de la modification d'un lieu.

## Technologies utilisées

| Partie | Technologies principales |
| --- | --- |
| Interface d'administration | Vue 3, Vue Router 5, Vite 8, CSS |
| API | Node.js, Express 5, Sequelize 6 |
| Authentification | JSON Web Token, bcryptjs, cookie-parser |
| Base de données | MariaDB |
| Tests | module natif `node:test` |

## Architecture du projet

```text
.
├── admin/                  # application Vue et ressources statiques
│   ├── public/             # styles, polices et images du catalogue
│   └── src/
│       ├── components/     # composants d'interface réutilisables
│       ├── hooks/          # logique réutilisable côté Vue
│       ├── layouts/        # mises en page de l'administration
│       ├── router/         # routes et garde d'authentification
│       ├── services/       # appels HTTP vers l'API
│       └── views/          # pages de connexion et de gestion
├── api/                    # API REST Express
│   ├── src/
│   │   ├── controllers/    # adaptation des requêtes et réponses HTTP
│   │   ├── db/             # connexion Sequelize
│   │   ├── errors/         # erreur applicative commune
│   │   ├── middlewares/    # authentification et gestion des erreurs
│   │   ├── models/         # modèles et associations Sequelize
│   │   ├── repositories/   # accès aux données
│   │   ├── routes/         # déclaration des endpoints
│   │   ├── services/       # logique métier
│   │   └── validators/     # validation des données entrantes
│   └── test/               # tests unitaires de l'API
└── database/               # création du schéma et données de démonstration
```

Le flux principal de l'API suit la séparation suivante :

```text
Route → Controller → Service → Repository → Modèle Sequelize → MariaDB
```

## Modèle de données

- `app_user` contient les comptes d'administration ;
- `category` classe les lieux ; une catégorie peut être associée à plusieurs lieux ;
- `place` représente un lieu et porte un statut `draft`, `published` ou `archived` ;
- `exploitation_type` décrit un usage possible du lieu ;
- `place_exploitation_type` matérialise la relation plusieurs-à-plusieurs entre les lieux et leurs usages ;
- `image` appartient au maximum à un lieu et peut être définie comme son image principale.

## Prérequis

- Node.js `22.18.x` ou `>= 24.12.0` (contrainte déclarée par l'application Vue) ;
- npm ;
- MariaDB et un compte autorisé à créer une base et un utilisateur ;
- deux terminaux pour exécuter l'API et l'interface en parallèle.

## Installation

### 1. Récupérer le projet

```bash
git clone <url-du-depot>
cd Devoir-Bilan-DWWM
```

### 2. Installer les dépendances

```bash
cd api
npm ci

cd ../admin
npm ci
cd ..
```

### 3. Préparer la base de données

Le fichier `database/01_pp_database.sql` supprime puis recrée la base `private_place_db` ainsi que l'utilisateur local `pp_admin`. Il est donc **destructif** pour une installation existante portant ces noms.

Avant de l'exécuter, remplacer le mot de passe `******` présent dans ce fichier par un mot de passe local robuste. La même valeur devra ensuite être utilisée dans `DB_PWD`.

```bash
mariadb -u root -p < database/01_pp_database.sql
mariadb -u root -p private_place_db < database/02_pp_seed.sql
```

Le second script ajoute un administrateur, des catégories, des types d'exploitation, des lieux et une bibliothèque d'images de démonstration. Il n'est pas idempotent : ne pas le rejouer sur une base déjà alimentée sans la réinitialiser.

### 4. Configurer les variables d'environnement

Créer `api/.env` :

```dotenv
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=private_place_db
DB_USER=pp_admin
DB_PWD=mot_de_passe_defini_dans_le_script_sql

JWT_SECRET=une_longue_valeur_aleatoire_et_secrete
```

Créer `admin/.env` :

```dotenv
VITE_API_URL=http://localhost:3000/
```

La barre oblique finale de `VITE_API_URL` est nécessaire : les services du front ajoutent des chemins comme `api/auth/login` sans barre oblique initiale.

### 5. Lancer le projet en développement

Dans un premier terminal :

```bash
cd api
npm run dev
```

Dans un second terminal :

```bash
cd admin
npm run dev
```

L'interface est alors disponible sur [http://localhost:5173](http://localhost:5173). L'API écoute sur `http://localhost:3000` ; sa route racine n'expose actuellement aucun contenu, les endpoints utiles sont préfixés par `/api`.

## Compte de démonstration

Le jeu de données crée le compte `admin@private-place.fr`. Seul le hash bcrypt de son mot de passe est versionné.

Pour choisir un mot de passe connu avant l'import du jeu de données, générer un nouveau hash depuis le dossier `api` après `npm ci`, puis remplacer la valeur `password_hash` de l'utilisateur dans `database/02_pp_seed.sql` :

```bash
node --input-type=module -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('votre-mot-de-passe', 10))"
```

Ne jamais utiliser ce compte ou les secrets de développement tels quels en production.

## Commandes utiles

### API

À exécuter depuis `api/` :

| Commande | Description |
| --- | --- |
| `npm run dev` | démarre l'API avec rechargement automatique de Node.js |
| `npm start` | démarre l'API sans surveillance des fichiers |
| `node --test` | exécute les tests unitaires présents dans `api/test/` |

### Administration

À exécuter depuis `admin/` :

| Commande | Description |
| --- | --- |
| `npm run dev` | démarre le serveur Vite de développement |
| `npm run build` | produit le bundle de production dans `admin/dist/` |
| `npm run preview` | sert localement le bundle de production |
| `npm run format` | formate les fichiers du dossier `admin/src/` avec Prettier |

## API REST

Toutes les routes `/api/admin/*` nécessitent le cookie d'authentification `pp_token`. Le navigateur doit envoyer les requêtes avec les credentials, ce que fait le service `admin/src/services/api.service.js`.

### Authentification

| Méthode | Endpoint | Description | Accès |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | connecte un utilisateur et crée le cookie JWT | public |
| `GET` | `/api/auth/me` | retourne l'utilisateur authentifié | authentifié |
| `POST` | `/api/auth/logout` | supprime le cookie de session | authentifié |

### Ressources d'administration

| Ressource | Endpoints |
| --- | --- |
| Catégories | `GET /api/admin/categories`, `GET /api/admin/categories/:categoryId`, `POST /api/admin/categories/add`, `PATCH /api/admin/categories/:categoryId`, `DELETE /api/admin/categories/:categoryId` |
| Types d'exploitation | `GET /api/admin/exploitation-types`, `GET /api/admin/exploitation-types/:id`, `POST /api/admin/exploitation-types/add`, `PATCH /api/admin/exploitation-types/:id`, `DELETE /api/admin/exploitation-types/:id` |
| Lieux | `GET /api/admin/places`, `GET /api/admin/places/:id`, `POST /api/admin/places`, `PATCH /api/admin/places/:id`, `DELETE /api/admin/places/:id` |
| Images disponibles | `GET /api/admin/images` |

Exemple de corps attendu pour créer ou modifier un lieu :

```json
{
  "name": "Villa des Pins",
  "description": "Une villa lumineuse proche de la mer.",
  "categoryId": 1,
  "exploitationTypeIds": [1, 3],
  "imageIds": [2, 4],
  "mainImageId": 2,
  "status": "published"
}
```

Un brouillon requiert uniquement un nom. Une publication requiert également une description, une catégorie, au moins un type d'exploitation, au moins une image et une image principale comprise dans `imageIds`.

Les erreurs applicatives suivent ce format :

```json
{
  "error": {
    "code": "INVALID_PLACE_DATA",
    "message": "Description lisible de l'erreur"
  }
}
```

## Authentification et sécurité

- le mot de passe est comparé à un hash bcrypt et n'est jamais renvoyé par l'API ;
- le JWT expire après 8 heures ;
- le cookie est `httpOnly`, `sameSite=strict` et devient `secure` lorsque `NODE_ENV=production` ;
- CORS n'accepte que l'origine définie dans `CORS_ORIGIN` et autorise l'envoi du cookie ;
- `JWT_SECRET`, les identifiants MariaDB et les fichiers `.env` ne doivent pas être versionnés.

En production, l'interface et l'API doivent être servies en HTTPS, les secrets doivent être renouvelés et le compte de démonstration doit être remplacé.

## État actuel et limites connues

- le dépôt contient uniquement l'espace d'administration, pas de site public de consultation ;
- les images sont des ressources statiques préchargées : il n'existe pas encore d'upload de fichier ;
- le statut `archived` existe dans le schéma et dans les filtres, mais le validateur de création/modification accepte actuellement seulement `draft` et `published` ;
- les tests automatisés couvrent actuellement la validation des données d'un lieu ;
- aucun script de déploiement ni aucune licence ne sont fournis dans le dépôt.

## Repères pour les contributeurs et les agents IA

- considérer le présent `README.md` racine comme la documentation de référence ;
- conserver la séparation `route / controller / service / repository / model` lors d'une évolution de l'API ;
- utiliser les noms camelCase dans le code JavaScript et les noms snake_case dans MariaDB ; Sequelize réalise le mapping via l'attribut `field` des modèles ;
- charger `api/src/models/associations.js` avant d'utiliser les relations Sequelize ; c'est actuellement fait par `api/index.js` ;
- préserver l'envoi de `credentials: 'include'` côté front et l'option `credentials: true` côté CORS pour l'authentification par cookie ;
- garder cohérents les modèles Sequelize, `database/01_pp_database.sql` et `database/02_pp_seed.sql` lors d'une modification du schéma ;
- valider les références d'un lieu et effectuer ses écritures associées dans une transaction ;
- les images physiques se trouvent dans `admin/public/assets/images/`, tandis que leurs métadonnées sont enregistrées dans la table `image` ;
- vérifier les changements avec `node --test` dans `api/` et `npm run build` dans `admin/`.

## Auteur

Kevin Marlin — projet de formation DWWM.
