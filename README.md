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
