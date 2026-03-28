# Références - Valeurs statiques / mocks frontend

Périmètre frontend: `/Users/jeanemmanuel/Desktop/company-projects/lid/backoffice/LID`
Date: 2026-03-28

## Analytics

- `src/pages/Analytics.jsx:6`
  - import de mocks: `analyticsSeriesMock`, `channelMix` depuis `data/mockData.js`.
- `src/pages/Analytics.jsx:58`
  - état initial sur mock: `useState(analyticsSeriesMock)`.
- `src/pages/Analytics.jsx:87` et `src/pages/Analytics.jsx:93`
  - fallback API vers `analyticsSeriesMock`.
- `src/pages/Analytics.jsx:131-133`
  - ratios statiques funnel: `purchaseRate=0.52`, `checkoutRate=0.62`, `addToCartRate=0.13`.
- `src/pages/Analytics.jsx:190`
  - rendu `channelMix.map(...)` (mix canaux mock).
- `src/pages/Analytics.jsx:223-227`
  - cohortes visuelles statiques: `Array.from({ length: 8 })` + opacité calculée.
- `src/pages/Analytics.jsx:236-238`
  - alertes texte statiques.

## Customers

- `src/pages/Customers.jsx:13`
  - import mock: `customers` depuis `data/mockData.js`.
- `src/pages/Customers.jsx:40`
  - état initial sur mock: `useState(customers)`.
- `src/pages/Customers.jsx:30-37`
  - segmentation locale statique `getTier(...)` (seuils hardcodés).
- `src/pages/Customers.jsx:79-80`
  - fallback silencieux, conservation des mocks en cas d’erreur API.
- `src/pages/Customers.jsx:150-155`
  - options segment statiques dans le `<Select>`.

## Mock dataset source

- `src/data/mockData.js:237`
  - `analyticsSeries` mock.
- `src/data/mockData.js:241-245`
  - `channelMix` mock.
- `src/data/mockData.js:220-234`
  - `customers` mock (échantillons).

## Divers (hors agrégats, mais statique)

- `src/services/storage.js:6`
  - génération nom fichier avec `Math.random()`.
