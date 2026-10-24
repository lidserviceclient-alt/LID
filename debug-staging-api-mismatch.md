# Debug Session: staging-api-mismatch

- Status: OPEN
- Session ID: `staging-api-mismatch`
- Started: 2026-06-11

## Symptom
- `https://lid-shop.web.app` appelle encore `https://api.lidshopping.com/lid/...` alors que le site doit utiliser l'API de staging.

## Expected
- `https://lid-shop.web.app` doit appeler `https://new.jean-emmanuel-diap.com/lid/...`

## Hypotheses
- H1: Le bundle servi en ligne est un ancien build production.
- H2: Un ancien service worker sert encore des assets mis en cache.
- H3: Un point du code réécrit la base API au runtime.
- H4: Le pipeline de déploiement publie un mauvais artefact.
- H5: La configuration PWA/runtime caching force encore le host production.

## Evidence Log
- En attente d'instrumentation runtime.

## Next Step
- Ajouter une instrumentation minimale pour reporter la base API résolue, le mode Vite, l'URL courante et l'état du service worker.
