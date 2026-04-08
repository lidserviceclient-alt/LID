# Analyse du code mort backend depuis les frontends

Périmètre frontend :

- `/Users/jeanemmanuel/Desktop/company-projects/lid/frontend/LID`
- `/Users/jeanemmanuel/Desktop/company-projects/lid/backoffice/LID`
- `/Users/jeanemmanuel/Desktop/company-projects/lid/delivery/LID/Delivery`

Backend analysé :

- `/Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid`

Méthode :

- recroisement des appels API réellement présents dans les 3 frontends
- comparaison avec les contrôleurs Spring exposés
- classification :
  - `actif` : consommé par au moins un frontend
  - `legacy` : non consommé et doublonné par une route plus récente
  - `non branché` : non consommé par les 3 frontends
  - `à vérifier hors frontend` : non consommé côté frontend mais potentiellement utile pour intégration, ops, webhook ou support

## Corrections importantes par rapport à l’ancien audit

Les points suivants ne doivent plus être classés comme morts :

- `BackOfficeLogController` : maintenant `actif`
  - utilisé par `backoffice/LID/src/services/api.js` via `/api/v1/backoffice/logs`
- `LocalStorageController` : maintenant `actif`
  - utilisé indirectement par tous les frontends via les URLs d’images `/api/v1/cdn/**`
- `storage/media` et `storage/upload` : maintenant `actifs`
  - utilisés par le backoffice LID et le backoffice vendeur

## Candidats les plus nets

### 1. Contrôleurs déjà inactifs

#### `ArticleController`

- Fichier : `lid/src/main/java/com/lifeevent/lid/article/controller/ArticleController.java`
- Statut : `legacy / inactif`
- Motif :
  - le contrôleur historique `/api/v1/articles` est déjà désactivé
  - les frontends n’utilisent pas ce bloc

#### `CategoryController`

- Fichier : `lid/src/main/java/com/lifeevent/lid/article/controller/CategoryController.java`
- Statut : `legacy / inactif`
- Motif :
  - le contrôleur historique `/api/v1/categories` est déjà désactivé
  - les frontends n’utilisent pas ce bloc

### 2. Routes catalog legacy probablement obsolètes

#### `CatalogController`

- Fichier : `lid/src/main/java/com/lifeevent/lid/catalog/controller/CatalogController.java`

Routes `legacy` non appelées par les frontends :

- `GET /api/v1/catalog/featured`
- `GET /api/v1/catalog/bestsellers`
- `GET /api/v1/catalog/flash-sales`
- `GET /api/v1/catalog/new`
- `GET /api/v1/catalog/search`
- `GET /api/v1/catalog/layout/collection`
- `GET /api/v1/catalog/products/{id}`

Routes `actives` du même contrôleur :

- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/collection`
- `GET /api/v1/catalog/products/featured`
- `GET /api/v1/catalog/products/bestsellers`
- `GET /api/v1/catalog/products/latest`
- `GET /api/v1/catalog/products/{id}/details`
- `GET /api/v1/catalog/products/{id}/collection`
- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/categories/featured`
- `GET /api/v1/catalog/partners`
- `GET /api/v1/catalog/partners/{partnerId}`
- `GET /api/v1/catalog/partners/{partnerId}/collection`
- `GET /api/v1/catalog/partners/{partnerId}/products`
- `GET/POST /api/v1/catalog/products/{productId}/reviews`
- `DELETE/POST /api/v1/catalog/reviews/{reviewId}/*`

Conclusion :

- ce bloc legacy du catalogue reste un bon candidat de nettoyage

### 3. Endpoints monolithiques `setting` désormais doublonnés

#### `BackOfficeSettingController`

- Fichier : `lid/src/main/java/com/lifeevent/lid/backoffice/lid/setting/controller/BackOfficeSettingController.java`
- Base route : `/api/v1/backoffice/setting`

Routes encore `actives` :

- `GET /api/v1/backoffice/setting/collection`

Routes `legacy probables` non appelées par les frontends actuels :

- `GET /api/v1/backoffice/setting`
- `GET/PUT /api/v1/backoffice/setting/shop-profile`
- `GET/POST/PUT/DELETE /api/v1/backoffice/setting/social-links*`
- `GET/POST/PUT/DELETE /api/v1/backoffice/setting/free-shipping-rules*`
- `GET/POST/PUT/DELETE /api/v1/backoffice/setting/shipping-methods*`
- `GET/POST/PUT/DELETE /api/v1/backoffice/setting/couriers*`
- `GET/POST/PUT/DELETE /api/v1/backoffice/setting/team-members*`
- `GET/PUT /api/v1/backoffice/setting/security`
- `GET/PUT /api/v1/backoffice/setting/integrations`
- `GET/PUT /api/v1/backoffice/setting/notification-preferences`

Motif :

- le front backoffice consomme maintenant les contrôleurs dédiés :
  - `/api/v1/backoffice/app-config`
  - `/api/v1/backoffice/app-config/social-links`
  - `/api/v1/backoffice/free-shipping-rules`
  - `/api/v1/backoffice/shipping-methods`
  - `/api/v1/backoffice/security/settings`
  - `/api/v1/backoffice/integrations`
  - `/api/v1/backoffice/notification-preferences`
- le seul endpoint encore visiblement utile dans le contrôleur agrégé est `collection`

Conclusion :

- gros candidat `legacy` à découper ou supprimer partiellement
- attention : ne pas supprimer `collection`

## Non appelés par les 3 frontends actuels

### `StockController`

- Fichier : `lid/src/main/java/com/lifeevent/lid/stock/controller/StockController.java`
- Base route : `/api/v1/stocks`
- Statut : `non branché`
- Motif :
  - les frontends utilisent le stock via `/api/v1/backoffice/stocks`
  - aucun frontend n’appelle `/api/v1/stocks`

### `WishlistController` variante par `customerId`

- Fichier : `lid/src/main/java/com/lifeevent/lid/wishlist/controller/WishlistController.java`
- Route concernée : `GET /api/v1/wishlist/{customerId}`
- Statut : `legacy probable`
- Motif :
  - le frontend public utilise :
    - `GET /api/v1/wishlist`
    - `POST /api/v1/wishlist/{articleId}`
    - `DELETE /api/v1/wishlist/{articleId}`
    - `GET /api/v1/wishlist/{articleId}/exists`
  - aucun appel trouvé vers `GET /api/v1/wishlist/{customerId}`

### `CustomerController` endpoints non branchés

- Fichier : `lid/src/main/java/com/lifeevent/lid/user/customer/controller/CustomerController.java`
- Base route : `/api/v1/customers`

Routes `non branchées` ou `à confirmer` :

- `GET /api/v1/customers`
- `GET /api/v1/customers/email/{email}`
- `GET /api/v1/customers/check-email/{email}`

Routes `actives` du même bloc :

- `GET /api/v1/customers/{id}`
- `PUT /api/v1/customers/{id}`
- `DELETE /api/v1/customers/{id}`
- `GET/POST/PUT/DELETE /api/v1/customers/{customerId}/addresses*`
- `GET /api/v1/customers/me/collection`
- `GET /api/v1/customers/me/checkout/collection`

Conclusion :

- les endpoints de lookup global par email / listing complet ne sont pas consommés par les frontends actuels

### `PartnerController` endpoints non branchés

- Fichier : `lid/src/main/java/com/lifeevent/lid/user/partner/controller/PartnerController.java`
- Base route : `/api/v1/partners`

Routes `non branchées` ou `à confirmer` :

- `PUT /api/v1/partners/{partnerId}`
- `DELETE /api/v1/partners/{partnerId}`

Routes `actives` :

- `POST /register/upgrade`
- `POST /register/step-1`
- `POST /register/step-2`
- `POST /register/step-3`
- `POST /register/step-4`
- `GET /register/aggregate`
- `GET /api/v1/partners/{partnerId}`

### `BackOfficeOrderController` routes non branchées

- Fichier : `lid/src/main/java/com/lifeevent/lid/backoffice/lid/order/controller/BackOfficeOrderController.java`

Routes non utilisées par les frontends actuels :

- `GET /api/v1/backoffice/orders/customers/orders`
- `GET /api/v1/backoffice/orders/customers/{customerId}/orders`

Les autres routes du contrôleur sont bien consommées par le backoffice.

### `BackOfficeLogisticsController` routes non branchées

- Fichier : `lid/src/main/java/com/lifeevent/lid/backoffice/lid/logistics/controller/BackOfficeLogisticsController.java`

Routes non utilisées par les frontends actuels :

- `GET /api/v1/backoffice/logistics/delivery-bootstrap`
- `GET /api/v1/backoffice/logistics/shipments/details/collection`
- `POST /api/v1/backoffice/logistics/shipments/scan`

Routes actives :

- `GET /api/v1/backoffice/logistics/kpis`
- `GET /api/v1/backoffice/logistics/shipments`
- `GET /api/v1/backoffice/logistics/shipments/{id}`
- `PUT /api/v1/backoffice/logistics/shipments/{id}/status`
- `POST /api/v1/backoffice/logistics/shipments/{id}/deliver`
- `GET /api/v1/backoffice/logistics/collection`

Conclusion :

- bon candidat `non branché`, surtout `delivery-bootstrap` et `shipments/details/collection`

### `BackOfficeFinanceController` route export non branchée

- Fichier : `lid/src/main/java/com/lifeevent/lid/backoffice/lid/finance/controller/BackOfficeFinanceController.java`
- Route concernée : `GET /api/v1/backoffice/finance/export`
- Statut : `non branché`
- Motif :
  - le backoffice consomme `overview`, `transactions`, `collection`
  - aucun appel trouvé vers l’export CSV

### `BackOfficeLoyaltyController` route transactions client non branchée

- Fichier : `lid/src/main/java/com/lifeevent/lid/backoffice/lid/loyalty/controller/BackOfficeLoyaltyController.java`
- Route concernée : `GET /api/v1/backoffice/loyalty/customers/{userId}/transactions`
- Statut : `non branché`
- Motif :
  - le backoffice consomme `overview`, `collection`, `tiers`, `customers`, `config`, `adjust`
  - aucun appel trouvé vers les transactions détaillées par client

### `BackOfficeNotificationController` route read unitaire non branchée

- Fichier : `lid/src/main/java/com/lifeevent/lid/backoffice/lid/notification/controller/BackOfficeNotificationController.java`
- Route concernée : `POST /api/v1/backoffice/notifications/{id}/read`
- Statut : `non branché`
- Motif :
  - les frontends backoffice utilisent :
    - `GET /api/v1/backoffice/notifications`
    - `GET /api/v1/backoffice/notifications/unread-count`
    - `POST /api/v1/backoffice/notifications/read-all`
  - aucun appel trouvé au marquage unitaire

## À vérifier hors frontend avant suppression

### `PaymentController`

- Fichier : `lid/src/main/java/com/lifeevent/lid/payment/controller/PaymentController.java`
- Statut : `à vérifier hors frontend`

Route active côté frontend :

- `GET /api/v1/payments/verify/{invoiceToken}`

Routes non appelées par les 3 frontends :

- `POST /api/v1/payments`
- `GET /api/v1/payments/{paymentId}`
- `GET /api/v1/payments/order/{orderId}`
- `GET /api/v1/payments/customer/{email}`
- `DELETE /api/v1/payments/{paymentId}`
- `GET /api/v1/payments/operators/{countryCode}`

Conclusion :

- probablement utiles pour intégration paiement, support ou diagnostic
- ne pas supprimer sans audit métier

### `RefundController`

- Fichier : `lid/src/main/java/com/lifeevent/lid/payment/controller/RefundController.java`
- Statut : `à vérifier hors frontend`
- Motif :
  - aucun frontend n’appelle `/api/v1/refunds`
  - mais le domaine remboursement reste sensible et peut être utilisé hors UI

### `WebhookController`

- Fichier : `lid/src/main/java/com/lifeevent/lid/payment/controller/WebhookController.java`
- Statut : `à vérifier hors frontend`
- Motif :
  - absence d’appel frontend normale
  - endpoint d’intégration externe, donc non classable comme mort sans audit infra

### `AuthController` routes non branchées côté fronts actuels

- Fichier : `lid/src/main/java/com/lifeevent/lid/auth/controller/AuthController.java`

Routes non appelées par les frontends actuels :

- `POST /api/v1/auth/login/customer`

Routes `à vérifier` plutôt que supprimer immédiatement :

- le bloc Google login global dépend potentiellement d’autres clients ou d’évolutions à venir

## Résumé exécutable

### Suppression ou nettoyage prioritaire

- `ArticleController`
- `CategoryController`
- routes legacy de `CatalogController`
- endpoints monolithiques legacy de `BackOfficeSettingController` sauf `collection`
- `GET /api/v1/wishlist/{customerId}`
- `StockController`

### Bons candidats non branchés mais à confirmer métier

- `PUT/DELETE /api/v1/partners/{partnerId}`
- `GET /api/v1/customers`
- `GET /api/v1/customers/email/{email}`
- `GET /api/v1/customers/check-email/{email}`
- `GET /api/v1/backoffice/orders/customers/orders`
- `GET /api/v1/backoffice/orders/customers/{customerId}/orders`
- `GET /api/v1/backoffice/logistics/delivery-bootstrap`
- `GET /api/v1/backoffice/logistics/shipments/details/collection`
- `POST /api/v1/backoffice/logistics/shipments/scan`
- `GET /api/v1/backoffice/finance/export`
- `GET /api/v1/backoffice/loyalty/customers/{userId}/transactions`
- `POST /api/v1/backoffice/notifications/{id}/read`

### À garder tant qu’un audit hors frontend n’a pas été fait

- `PaymentController`
- `RefundController`
- `WebhookController`
- `AuthController` routes Google peu utilisées

## Étape suivante recommandée

Faire un second audit par usage backend interne pour vérifier :

- références dans tests
- usage par services métier internes
- exposition Swagger encore maintenue
- usage par scripts ops / tooling
- usage réel webhook / paiement / support
