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
Les champs acceptés sont `eventId`, `placeId` et `type`.

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "placeId": 12,
  "type": "view"
}
```

`view` correspond à un chargement réussi de la page publique. Envoyer
`inquiry` après un traitement réussi du formulaire et réutiliser l’identifiant
de soumission comme UUID pour les reprises. Un corps invalide reçoit `400`, un
lieu absent ou non publié `404`, un dépassement de quota `429` et une panne
du stockage `503`.

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

`GET /api/admin/places/:placeId/metrics` requiert une session admin. Pour un
lieu existant, quel que soit son statut, la réponse contient `placeId`,
`periodDays` (90), `from`, `to`, `views`, `inquiries` et `conversionRate`.
La période est fixe et les deux bornes UTC sont incluses. Le taux correspond
au pourcentage de demandes par consultation, arrondi à l’entier et plafonné à
100. Il vaut 0 en l’absence de consultation. La route répond `404` pour un
lieu absent et `503` si le stockage des métriques est indisponible.

L’archivage conserve les métriques. Lors d’une suppression définitive, l’API
valide la suppression dans MariaDB, puis tente de retirer les événements
associés dans MongoDB. Ces opérations ne forment pas une transaction unique.
Si le nettoyage échoue, l’API journalise l’échec. La route de lecture renvoie
`404` pour le lieu supprimé et les événements restants expirent via l’index TTL.

Les métriques sont des indicateurs d’usage. Un client peut simuler une origine
ou envoyer de nouveaux événements. L’origine et les quotas réduisent les abus
courants, et un UUID unique évite le double comptage des reprises.

### Vérifier les métriques

- Dans `api/`, exécuter `npm test`.
- Dans `admin/`, exécuter `npm test` et `npm run build`.
- Pour la recette, utiliser des instances MariaDB et MongoDB dédiées au test,
  un compte admin de test, un lieu publié et un brouillon. Démarrer l’API et
  l’admin avec ces bases et leur configuration de développement.
- Envoyer deux vues d’UUID différents, rejouer l’un des UUID, puis envoyer
  une demande. La route admin authentifiée et les cartes doivent afficher
  2 consultations, 1 demande et 50 %. Le brouillon doit afficher 0, 0 et 0 %
  et refuser les nouveaux événements.
- Archiver un lieu ayant des événements, vérifier qu’ils restent lisibles
  et supprimer ce lieu. La lecture doit répondre `404` et la collection
  ne doit plus contenir ses événements.
- Arrêter le MongoDB de test. Pour un lieu encore publié, l’ingestion et
  la lecture répondent `503`. La fiche existante affiche l’indisponibilité
  des métriques et conserve l’accès à la modification du lieu.
