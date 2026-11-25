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

Le site vitrine peut envoyer les événements JSON à `POST /api/public/place-events`.
La charge utile est limitée à 1 Kio. Une insertion ou un doublon reçoit `204`.
Configurer `SHOWCASE_ORIGIN` avec son origine HTTP ou HTTPS exacte, port compris
si nécessaire, sans chemin ni barre oblique finale. En l’absence de configuration,
les requêtes qui présentent une origine sont refusées. Une origine refusée reçoit
`403`. Les appels sans en-tête `Origin` restent publics. CORS ne constitue pas
une authentification.

Les plafonds par IP sont de 60 consultations par minute
(`PLACE_EVENT_VIEW_LIMIT`) et de 10 demandes par tranche de 10 minutes
(`PLACE_EVENT_INQUIRY_LIMIT`). Les valeurs doivent être des entiers positifs.
Les compteurs restent en mémoire dans chaque instance de l’API. Si un proxy inverse
est utilisé, la résolution de l’IP cliente dépend de la configuration Express du
proxy de confiance. L’adresse IP ne figure pas dans les événements enregistrés.
