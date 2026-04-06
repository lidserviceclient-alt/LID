# Références - Valeurs statiques / mocks frontend

Périmètre frontend :
- `/Users/jeanemmanuel/Desktop/company-projects/lid/backoffice/LID`
- `/Users/jeanemmanuel/Desktop/company-projects/lid/frontend/LID`
- `/Users/jeanemmanuel/Desktop/company-projects/lid/delivery/LID/Delivery`

Date de mise à jour : 2026-04-04

## Synthèse

Le fichier précédent n’était plus totalement à jour.

État actuel :
- `Analytics` côté backoffice utilise encore des fallbacks et blocs visuels statiques.
- `Customers` côté backoffice n’est plus alimenté par le mock `customers` principal ; la page est maintenant branchée au backend.
- `Partners` backoffice est branché au backend.
- `Tracking` frontend public est branché au backend.
- `Notifications count` côté backoffice/delivery est branché au backend.

## Analytics

La page est partiellement branchée au backend, mais conserve encore des valeurs statiques ou de secours.

- `src/pages/Analytics.jsx:7`
  - import de mocks encore présent : `analyticsSeriesMock`, `channelMix` depuis `data/mockData.js`.
- `src/pages/Analytics.jsx:69`
  - état initial `channelMixState` initialisé sur le mock `channelMix`.
- `src/pages/Analytics.jsx:91-94`
  - fallback sur `channelMix` mock si l’API `analytics/collection` ne renvoie pas de mix exploitable.
- `src/pages/Analytics.jsx:101`
  - fallback sur `channelMix` mock en cas d’erreur API.
- `src/pages/Analytics.jsx:115`
  - fallback sur `analyticsSeriesMock` si `overview.analyticsSeries` est absent.
- `src/pages/Analytics.jsx:140-148`
  - funnel encore partiellement reconstruit avec ratios statiques (`0.52`, `0.62`, `0.13`) si certaines valeurs backend manquent.
- `src/pages/Analytics.jsx:235`
  - cohortes visuelles encore statiques : `Array.from({ length: 8 })`.

Points désormais dynamiques :
- `src/services/api.js:179`
  - appel backend `GET /api/v1/backoffice/analytics/collection`.
- `src/pages/Analytics.jsx:84-96`
  - chargement réel de `channelMix` et `conversionFunnel` depuis l’API.
- `src/pages/Analytics.jsx:113-117`
  - lecture réelle de `overview.analyticsSeries` depuis le backend.
- `src/pages/Analytics.jsx:247-264`
  - chargement réel des notifications via le backend.

## Customers

Le constat précédent sur les mocks `customers` n’est plus vrai pour la page principale.

Points désormais dynamiques :
- `src/pages/Customers.jsx:12`
  - la page utilise `useCustomersResolver`.
- `src/pages/Customers.jsx:59`
  - la source principale est désormais `customersEntry`, donc le backend.
- `src/pages/Customers.jsx:62-83`
  - `segments`, `summary` et `customersPage.content` proviennent du backend.

Points encore statiques / locaux :
- `src/pages/Customers.jsx:27-33`
  - segmentation locale `getTier(...)` utilisée en fallback quand `loyaltyTier` n’est pas fourni.

Conclusion :
- la référence précédente au mock `customers` comme source de la page `Customers` est obsolète.

## Partners

La page backoffice partenaires est branchée au backend.

- `src/services/api.js:530-543`
  - appels backend :
    - `GET /api/v1/backoffice/partners`
    - `GET /api/v1/backoffice/partners/{id}`
    - `POST /api/v1/backoffice/partners/{id}/approve`
    - `POST /api/v1/backoffice/partners/{id}/reject`
- `src/pages/Partners.jsx:60-86`
  - chargement réel de la liste et du détail partenaire.
- `src/pages/Partners.jsx:104-128`
  - actions approve/reject branchées au backend.

Valeurs locales tolérées :
- `src/pages/Partners.jsx:13-21`
  - `STATUS_OPTIONS` reste une liste UI locale, ce n’est pas un mock métier bloquant.
- `src/pages/Partners.jsx:31-37`
  - `statusUi(...)` est du mapping d’affichage frontend.

## Order Tracking Public

Le suivi de commande public est branché au backend.

- `src/services/trackingService.js:13`
  - appel backend `GET /api/v1/public/orders/tracking/{reference}`.
- `src/pages/OrderTracking.jsx:15-47`
  - mapping d’état frontend compatible avec `DELIVERY_FAILED`.

Ce mapping frontend n’est pas un mock de donnée ; c’est de la traduction UI.

## Notifications

Le comptage et le chargement des notifications sont branchés au backend.

- `backoffice/LID/src/services/api.js:689`
  - `GET /api/v1/backoffice/notifications/count`
- `delivery/LID/Delivery/src/services/notifications.js:45`
  - `GET /api/v1/backoffice/notifications/count`

## Mock dataset source encore présent

Le fichier de mocks existe toujours, mais toutes ses sections ne sont plus utilisées comme source principale.

- `src/data/mockData.js:237`
  - `analyticsSeries` mock encore utilisé comme fallback dans `Analytics`.
- `src/data/mockData.js:241-245`
  - `channelMix` mock encore utilisé comme fallback dans `Analytics`.
- `src/data/mockData.js`
  - contient encore divers jeux de données historiques non forcément branchés aux pages actuelles.

## Divers

- `src/services/storage.js:6`
  - génération de nom fichier avec `Math.random()`.
  - Ce n’est pas une donnée statique métier, mais c’est bien une logique locale non pilotée par le backend.

## Conclusion

Les points qui restent réellement statiques ou mockés de manière notable sont surtout :
- `Analytics` backoffice
  - fallback `analyticsSeries`
  - fallback `channelMix`
  - ratios funnel de secours
  - cohortes visuelles statiques
- `Customers`
  - `getTier(...)` fallback local

Les sections suivantes ne doivent plus être considérées comme “mockées” au sens principal :
- `Customers` page principale
- `Partners`
- `Order Tracking`
- `Notifications count`
