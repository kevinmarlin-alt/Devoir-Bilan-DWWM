# Devoir-Bilan-DWWM

## Stockage des métriques de lieu

L’API utilise une base MongoDB facultative pour les événements analytiques.
Définir `MONGODB_URI` (chaîne de connexion) et `MONGODB_DB_NAME` (nom de la
base) dans l’environnement de l’API, par exemple dans le fichier local
`api/.env`. Le pilote MongoDB 7 requiert Node.js 20.19 ou une version compatible
plus récente.

Au démarrage de l’API, le compte MongoDB doit pouvoir créer la collection
`place_events` et ses index. Le serveur HTTP démarre même si MongoDB est absent
ou indisponible. Si une variable manque, les métriques sont désactivées. Si
l’initialisation échoue, l’API réessaie après 30 secondes. Une fois la collection
initialisée, le pilote gère la reconnexion.

Un événement reçoit un UUID, un identifiant de lieu publié et le type `view`
ou `inquiry`. L’UUID est normalisé en minuscules pour dédupliquer les reprises.
L’API attribue l’horodatage UTC et calcule l’expiration 24 mois plus tard. Un
événement du 29 février expire le dernier jour de février de l’année cible.
