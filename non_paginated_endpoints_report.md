# Rapport - Endpoints non paginés (audit performance)

Date: 2026-03-28
Périmètre: endpoints HTTP non paginés (retour `List`) et impact perf réel.

Légende risque:
- `HIGH`: lecture potentiellement large en BDD, puis filtrage/tri/limit en mémoire.
- `MEDIUM`: filtrage SQL correct (par clé), mais sans limite SQL explicite.
- `LOW`: borne SQL explicite (`PageRequest` / `limit`) malgré un retour `List`.
- `N/A`: pas de lecture BDD.

## 1) Risque HIGH (à traiter en priorité)

| Endpoint(s) | Accès données réel | Risque |
|---|---|---|
| `GET /api/v1/catalog/categories` | `findAllByOrderByOrderIdxAsc()` puis filtre `isActive` en mémoire | HIGH |
| `GET /api/v1/catalog/categories/featured` | `findAllByOrderByOrderIdxAsc()` puis filtre/sort/`limit` en mémoire | HIGH |
| `GET /api/v1/backoffice/categories` + alias | `findAllByOrderByOrderIdxAsc()` sans borne SQL | HIGH |
| `GET /api/v1/backoffice/shops` + alias boutiques | `findAllByOrderByCreatedAtDesc()` sans borne SQL | HIGH |
| `GET /api/v1/backoffice/loyalty/tiers` + alias | `findAllByOrderByMinPointsAscNameAsc()` puis tri mémoire | HIGH |
| `GET /api/v1/backoffice/setting/social-links` + alias | `findAllByOrderBySortOrderAscCreatedAtAsc()` | HIGH |
| `GET /api/v1/backoffice/setting/free-shipping-rules` + alias | `findAllByOrderByCreatedAtDesc()` | HIGH |
| `GET /api/v1/backoffice/setting/shipping-methods` + alias | `findAllByOrderBySortOrderAscCreatedAtAsc()` | HIGH |
| `GET /api/v1/backoffice/setting/notification-preferences` + alias | `findAllByOrderByCreatedAtDesc()` | HIGH |
| `PUT /api/v1/backoffice/setting/notification-preferences` + alias | écrit puis relit via `findAllByOrderByCreatedAtDesc()` | HIGH |
| `GET /api/v1/backoffice/app-config/social-links` + alias | même source que social-links settings (`findAllBy...`) | HIGH |
| `GET /api/v1/backoffice/free-shipping-rules` + alias | même source que free-shipping-rules settings (`findAllBy...`) | HIGH |
| `GET /api/v1/backoffice/shipping-methods` + alias | même source que shipping-methods settings (`findAllBy...`) | HIGH |
| `GET /api/v1/backoffice/notification-preferences` + alias | même source que notification-preferences settings (`findAllBy...`) | HIGH |
| `PUT /api/v1/backoffice/notification-preferences` + alias | écrit puis relit via `findAllByOrderByCreatedAtDesc()` | HIGH |
| `GET /api/v1/backoffice/recipients` + alias | branche `TEAM/CLIENT`: récupère tous `userIds` par rôles puis `findAllById`, filtre `q` en mémoire | HIGH |

## 2) Risque MEDIUM (filtrage SQL OK, mais non borné)

| Endpoint(s) | Accès données réel | Risque |
|---|---|---|
| `GET /api/v1/wishlist` | `findByCustomer_UserId(customerId)` (filtré SQL) | MEDIUM |
| `GET /api/v1/wishlist/{customerId}` | idem | MEDIUM |
| `GET /api/v1/customers/{customerId}/addresses` | `findByCustomer_UserIdOrderByCreatedAtDesc(customerId)` | MEDIUM |
| `GET /api/v1/payments/order/{orderId}` | `findByOrderId(orderId)` | MEDIUM |
| `GET /api/v1/payments/customer/{email}` | `findByCustomerEmail(email)` | MEDIUM |
| `GET /api/v1/refunds/payment/{paymentId}` | `findByPaymentId(paymentId)` | MEDIUM |
| `GET /api/v1/refunds/pending` | `findByStatus("PENDING")` | MEDIUM |
| `GET /api/v1/backoffice/partners/me/categories-crud` + alias | `findByPartnerIdOrderByCreatedAtDesc(partnerId)` | MEDIUM |

## 3) Risque LOW (borné côté SQL malgré retour List)

| Endpoint(s) | Accès données réel | Risque |
|---|---|---|
| `GET /api/v1/orders` | page d'IDs `findIdsByCustomerUserId(..., Pageable)` puis chargement ciblé par IDs | LOW |
| `GET /api/v1/blog/posts` + alias `/api/blog/posts` | `findAll(PageRequest.of(page,size,...)).getContent()` | LOW |
| `GET /api/v1/tickets` | `findAll(PageRequest.of(page,size,...)).getContent()` | LOW |
| `GET /api/v1/catalog/products/featured` | requête SQL paginée `PageRequest(0, limit)` | LOW |
| `GET /api/v1/catalog/products/bestsellers` | requête SQL paginée `PageRequest(0, limit)` | LOW |
| `GET /api/v1/catalog/products/latest` | requête SQL paginée `PageRequest(0, limit)` | LOW |
| `GET /api/v1/backoffice/orders/recent` + alias | `PageRequest.of(0,5)` puis `getContent()` | LOW |
| `GET /api/v1/backoffice/blog-posts` + alias | `findAll(PageRequest(page,size,...)).getContent()` | LOW |
| `GET /api/v1/backoffice/promo-codes` + alias | `findAll(PageRequest(page,size,...)).getContent()` | LOW |
| `GET /api/v1/backoffice/tickets` + alias | `findAll(PageRequest(page,size,...)).getContent()` | LOW |
| `GET /api/v1/backoffice/finance/transactions` + alias | lit `size` paiements + `size` refunds via `PageRequest`, merge/trim mémoire | LOW |
| `GET /api/v1/backoffice/setting/couriers` + alias | `backOfficeUserService.getAll(PageRequest(...))` | LOW |
| `GET /api/v1/backoffice/setting/team-members` + alias | 2 appels paginés (`ADMIN`, `SUPER_ADMIN`) puis merge mémoire | LOW |

## 4) N/A BDD (pas de requête base)

| Endpoint(s) | Accès données réel | Risque |
|---|---|---|
| `GET /api/v1/payments/operators/{countryCode}` | enum en mémoire | N/A |

## 5) Conclusion performance

Le vrai sujet perf n'est pas "List vs Page" mais **où se fait la réduction du volume**:
- à corriger en priorité: endpoints `HIGH` (surtout `catalog/categories*` et `backoffice/recipients`).
- acceptable court terme: `MEDIUM` si cardinalité métier reste faible.
- `LOW`: déjà bornés SQL, peu risqués.
