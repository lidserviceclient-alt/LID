# Analyse du code mort backend depuis les frontends

Périmètre de comparaison :

- `/Users/jeanemmanuel/Desktop/company-projects/lid/frontend/LID`
- `/Users/jeanemmanuel/Desktop/company-projects/lid/backoffice/LID`
- `/Users/jeanemmanuel/Desktop/company-projects/lid/delivery/LID/Delivery`

Backend analysé :

- `/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid`

Principe :

- `actif` : endpoint explicitement appelé par au moins un des 3 frontends
- `legacy` : endpoint backend présent mais non appelé, alors qu’un endpoint plus récent couvre déjà le besoin
- `non branché` : endpoint backend non appelé par les 3 frontends actuels
- `à vérifier hors frontend` : endpoint non appelé par les 3 frontends, mais potentiellement utile pour intégration, ops, webhook, debug ou autre client

## Candidats les plus nets

### 1. Contrôleurs déjà inactifs

#### `ArticleController`

- Fichier : [`lid/src/main/java/com/lifeevent/lid/article/controller/ArticleController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/article/controller/ArticleController.java)
- Statut : `legacy / inactif`
- Preuve :
  - `@RestController` est commenté dans [`ArticleController.java:16`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/article/controller/ArticleController.java#L16)
  - base route définie sur [`ArticleController.java:17`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/article/controller/ArticleController.java#L17)
- Conclusion :
  - tout `/api/v1/articles` est déjà inactif
  - aucun frontend ne l’utilise

#### `CategoryController`

- Fichier : [`lid/src/main/java/com/lifeevent/lid/article/controller/CategoryController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/article/controller/CategoryController.java)
- Statut : `legacy / inactif`
- Preuve :
  - `@RestController` est commenté dans [`CategoryController.java:13`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/article/controller/CategoryController.java#L13)
  - base route définie sur [`CategoryController.java:14`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/article/controller/CategoryController.java#L14)
- Conclusion :
  - tout `/api/v1/categories` est déjà inactif
  - aucun frontend ne l’utilise

### 2. Routes catalog legacy probablement obsolètes

#### `CatalogController`

- Fichier : [`lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java)

Routes `legacy` non appelées par les frontends :

- `/api/v1/catalog/featured` dans [`CatalogController.java:22`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java#L22)
- `/api/v1/catalog/bestsellers` dans [`CatalogController.java:31`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java#L31)
- `/api/v1/catalog/flash-sales` dans [`CatalogController.java:40`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java#L40)
- `/api/v1/catalog/new` dans [`CatalogController.java:49`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java#L49)
- `/api/v1/catalog/search` dans [`CatalogController.java:58`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java#L58)
- `/api/v1/catalog/layout/collection` dans [`CatalogController.java:122`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java#L122)
- `/api/v1/catalog/products/{id}` dans [`CatalogController.java:154`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java#L154)

Routes `actives` à conserver :

- `/api/v1/catalog/products`
- `/api/v1/catalog/collection`
- `/api/v1/catalog/products/featured`
- `/api/v1/catalog/products/bestsellers`
- `/api/v1/catalog/products/latest`
- `/api/v1/catalog/products/{id}/details`
- `/api/v1/catalog/products/{id}/collection`
- `/api/v1/catalog/categories`
- `/api/v1/catalog/categories/featured`
- `/api/v1/catalog/partners`
- `/api/v1/catalog/partners/{partnerId}`
- `/api/v1/catalog/partners/{partnerId}/collection`
- `/api/v1/catalog/partners/{partnerId}/products`
- `/api/v1/catalog/products/{productId}/reviews`
- `/api/v1/catalog/reviews/{reviewId}/*`

Conclusion :

- ces routes catalog anciennes sont de bons candidats de nettoyage
- elles semblent doublonner des parcours plus récents réellement consommés

## Non appelés par les 3 frontends actuels

### `StockController`

- Fichier : [`lid/src/main/java/com/lifeevent/lid/stock/controller/StockController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/stock/controller/StockController.java)
- Base route : [`StockController.java:14`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/stock/controller/StockController.java#L14)
- Statut : `non branché`
- Commentaire :
  - les frontends utilisent le stock via `/api/v1/backoffice/stocks`
  - aucun frontend n’appelle `/api/v1/stocks`

### `WishlistController` variante par customerId

- Fichier : [`lid/src/main/java/com/lifeevent/lid/wishlist/controller/WishlistController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/wishlist/controller/WishlistController.java)
- Route concernée :
  - `GET /api/v1/wishlist/{customerId}`
- Statut : `legacy probable`
- Commentaire :
  - les frontends utilisent `GET /api/v1/wishlist`
  - ils utilisent aussi `POST/DELETE /api/v1/wishlist/{articleId}` et `GET /api/v1/wishlist/{articleId}/exists`
  - je n’ai trouvé aucun appel frontend à la variante `/{customerId}`

### `BackOfficeLogController`

- Fichier : [`lid/src/main/java/com/lifeevent/lid/backoffice/lid/log/controller/BackOfficeLogController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/backoffice/lid/log/controller/BackOfficeLogController.java)
- Base route : [`BackOfficeLogController.java:13`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/backoffice/lid/log/controller/BackOfficeLogController.java#L13)
- Statut : `non branché`
- Commentaire :
  - aucun des 3 frontends actuels n’appelle `/api/v1/backoffice/logs`
  - bonne candidate pour feature backend non branchée

## À vérifier hors frontend avant suppression

### `PaymentController`

- Fichier : [`lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java)
- Base route : [`PaymentController.java:21`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java#L21)

Appelé par frontend :

- `GET /api/v1/payments/verify/{invoiceToken}` dans [`PaymentController.java:44`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java#L44)

Non appelés par les 3 frontends :

- `POST /api/v1/payments` dans [`PaymentController.java:32`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java#L32)
- `GET /api/v1/payments/{paymentId}` dans [`PaymentController.java:56`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java#L56)
- `GET /api/v1/payments/order/{orderId}` dans [`PaymentController.java:68`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java#L68)
- `GET /api/v1/payments/customer/{email}` dans [`PaymentController.java:80`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java#L80)
- `DELETE /api/v1/payments/{paymentId}` dans [`PaymentController.java:92`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java#L92)
- `GET /api/v1/payments/operators/{countryCode}` dans [`PaymentController.java:104`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java#L104)

Statut :

- `à vérifier hors frontend`

### `RefundController`

- Fichier : [`lid/src/main/java/com/lifeevent/lid/payment/controller/RefundController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/RefundController.java)
- Base route : [`RefundController.java:20`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/RefundController.java#L20)
- Statut : `à vérifier hors frontend`
- Commentaire :
  - aucun des 3 frontends n’appelle `/api/v1/refunds`
  - mais ça peut servir au support, à l’admin ou à des opérations futures

### `WebhookController`

- Fichier : [`lid/src/main/java/com/lifeevent/lid/payment/controller/WebhookController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/WebhookController.java)
- Base route : [`WebhookController.java:17`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/WebhookController.java#L17)
- Routes :
  - `POST /api/v1/webhooks/paydunya` dans [`WebhookController.java:32`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/WebhookController.java#L32)
  - `GET /api/v1/webhooks/health` dans [`WebhookController.java:64`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/payment/controller/WebhookController.java#L64)
- Statut : `à vérifier hors frontend`
- Commentaire :
  - absence d’appel frontend normale
  - endpoint d’intégration externe, donc non classable comme mort sans audit infra

### `LocalStorageController`

- Fichier : [`lid/src/main/java/com/lifeevent/lid/common/controller/LocalStorageController.java`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/common/controller/LocalStorageController.java)
- Base route : [`LocalStorageController.java:21`](/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid/src/main/java/com/lifeevent/lid/common/controller/LocalStorageController.java#L21)
- Statut : `à vérifier hors frontend`
- Commentaire :
  - aucun frontend ne référence `/api/v1/cdn`
  - mais le contrôleur est `@Profile("local")`, donc c’est vraisemblablement un outil de dev local

## Résumé exécutable

### Candidats de suppression ou nettoyage prioritaire

- `ArticleController`
- `CategoryController`
- routes legacy de `CatalogController`
- `WishlistController` route `GET /api/v1/wishlist/{customerId}`
- `StockController`

### Candidats à garder tant qu’un audit hors frontend n’a pas été fait

- `PaymentController`
- `RefundController`
- `WebhookController`
- `LocalStorageController`
- `BackOfficeLogController`

## Étape suivante recommandée

Faire un second audit par usage backend interne pour vérifier :

- références directes dans tests
- usage par scripts ops
- usage par webhooks ou prestataires tiers
- présence dans docs Postman/Swagger si elles sont encore maintenues
