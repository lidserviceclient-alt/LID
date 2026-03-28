# Rapport - Endpoints non paginés

Date: 2026-03-28
Périmètre: `lid/src/main/java/com/lifeevent/lid/**/controller`
Critère: endpoints HTTP qui renvoient une `List<...>` (ou `ResponseEntity<List<...>>`) au lieu d'une `Page` / `PageResponse`.

## 1) GET non paginés (pas de métadonnées de pagination)

| Domaine | Endpoint(s) | Notes |
|---|---|---|
| Wishlist | `GET /api/v1/wishlist` | Liste complète des favoris d'un client |
| Wishlist | `GET /api/v1/wishlist/{customerId}` | Alias path |
| Orders | `GET /api/v1/orders` | Prend `page,size` mais renvoie `List<OrderDetailDto>` |
| Customers | `GET /api/v1/customers/{customerId}/addresses` | Liste d'adresses |
| Catalog | `GET /api/v1/catalog/products/featured` | Paramètre `limit` optionnel |
| Catalog | `GET /api/v1/catalog/products/bestsellers` | Paramètre `limit` optionnel |
| Catalog | `GET /api/v1/catalog/products/latest` | Paramètre `limit` optionnel |
| Catalog | `GET /api/v1/catalog/categories` | Liste complète |
| Catalog | `GET /api/v1/catalog/categories/featured` | Paramètre `limit` optionnel |
| Blog | `GET /api/v1/blog/posts` | Prend `page,size` mais renvoie `List<BlogPostDto>` |
| Blog | `GET /api/blog/posts` | Alias de la route précédente |
| Ticket | `GET /api/v1/tickets` | Prend `page,size` mais renvoie `List<TicketEventDto>` |
| Payments | `GET /api/v1/payments/order/{orderId}` | Liste des paiements d'une commande |
| Payments | `GET /api/v1/payments/customer/{email}` | Liste des paiements d'un client |
| Payments | `GET /api/v1/payments/operators/{countryCode}` | Liste d'opérateurs |
| Refunds | `GET /api/v1/refunds/payment/{paymentId}` | Liste des remboursements d'un paiement |
| Refunds | `GET /api/v1/refunds/pending` | Liste des remboursements en attente |
| Backoffice Partner | `GET /api/v1/backoffice/partners/me/categories-crud` | Aussi alias `/api/backoffice/partners/me/categories-crud` |
| Backoffice Categories | `GET /api/v1/backoffice/categories` | Aussi alias `/api/backoffice/categories` |
| Backoffice Shops | `GET /api/v1/backoffice/shops` | Aliases: `/api/backoffice/shops`, `/api/v1/backoffice/boutiques`, `/api/backoffice/boutiques` |
| Backoffice Orders | `GET /api/v1/backoffice/orders/recent` | Aussi alias `/api/backoffice/orders/recent` |
| Backoffice Blog | `GET /api/v1/backoffice/blog-posts` | Aussi alias `/api/backoffice/blog-posts`; prend `page,size` mais renvoie `List` |
| Backoffice Promo | `GET /api/v1/backoffice/promo-codes` | Aussi alias `/api/backoffice/promo-codes`; prend `page,size` mais renvoie `List` |
| Backoffice Tickets | `GET /api/v1/backoffice/tickets` | Aussi alias `/api/backoffice/tickets`; prend `page,size` mais renvoie `List` |
| Backoffice Loyalty | `GET /api/v1/backoffice/loyalty/tiers` | Aussi alias `/api/backoffice/loyalty/tiers` |
| Backoffice Finance | `GET /api/v1/backoffice/finance/transactions` | Aussi alias `/api/backoffice/finance/transactions`; prend `size` |
| Backoffice Recipients | `GET /api/v1/backoffice/recipients` | Aussi alias `/api/backoffice/recipients`; prend `limit` |
| Backoffice Setting | `GET /api/v1/backoffice/setting/social-links` | Aussi alias `/api/backoffice/setting/social-links` |
| Backoffice Setting | `GET /api/v1/backoffice/setting/free-shipping-rules` | Aussi alias `/api/backoffice/setting/free-shipping-rules` |
| Backoffice Setting | `GET /api/v1/backoffice/setting/shipping-methods` | Aussi alias `/api/backoffice/setting/shipping-methods` |
| Backoffice Setting | `GET /api/v1/backoffice/setting/couriers` | Aussi alias `/api/backoffice/setting/couriers` |
| Backoffice Setting | `GET /api/v1/backoffice/setting/team-members` | Aussi alias `/api/backoffice/setting/team-members` |
| Backoffice Setting | `GET /api/v1/backoffice/setting/notification-preferences` | Aussi alias `/api/backoffice/setting/notification-preferences` |
| Backoffice App Config | `GET /api/v1/backoffice/app-config/social-links` | Aussi alias `/api/backoffice/app-config/social-links` |
| Backoffice Free Shipping | `GET /api/v1/backoffice/free-shipping-rules` | Aussi alias `/api/backoffice/free-shipping-rules` |
| Backoffice Shipping | `GET /api/v1/backoffice/shipping-methods` | Aussi alias `/api/backoffice/shipping-methods` |
| Backoffice Notifications Prefs | `GET /api/v1/backoffice/notification-preferences` | Aussi alias `/api/backoffice/notification-preferences` |

## 2) Endpoints non-GET renvoyant aussi une List (non paginée)

| Domaine | Endpoint(s) | Notes |
|---|---|---|
| Backoffice Setting | `PUT /api/v1/backoffice/setting/notification-preferences` | Aussi alias `/api/backoffice/setting/notification-preferences` |
| Backoffice Notifications Prefs | `PUT /api/v1/backoffice/notification-preferences` | Aussi alias `/api/backoffice/notification-preferences` |

## 3) Remarques importantes

- Certains endpoints sont "bornés" (`limit`, ou `page,size`) mais ne renvoient pas de métadonnées de pagination (`totalElements`, `totalPages`, etc.). Ils sont donc classés ici comme "non paginés côté contrat API".
- Endpoint inactif à ce jour: `CategoryController` est commenté (`//@RestController`). Si réactivé, `GET /api/v1/categories` renverra aussi une `List` non paginée.
