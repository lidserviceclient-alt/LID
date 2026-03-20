# Back-Office Validation Points

## Autorisations (rôles requis)
| Endpoint | Rôle requis |
| --- | --- |
| `GET /api/v1/back-office/categories` | ADMIN |
| `GET /api/v1/back-office/categories/image/{filename}` | ADMIN |
| `POST /api/v1/back-office/categories` | ADMIN |
| `PUT /api/v1/back-office/categories/{id}` | ADMIN |
| `DELETE /api/v1/back-office/categories/{id}` | ADMIN |
| `POST /api/v1/back-office/categories/bulk` | ADMIN |
| `POST /api/v1/back-office/categories/bulk-delete` | ADMIN |
| `POST /api/v1/back-office/categories/purge` | ADMIN |
| `POST /api/v1/back-office/categories/upload-image` | ADMIN |
| `GET /api/v1/back-office/products` | ADMIN |
| `POST /api/v1/back-office/products` | ADMIN |
| `PUT /api/v1/back-office/products/{id}` | ADMIN |
| `DELETE /api/v1/back-office/products/{id}` | ADMIN |
| `POST /api/v1/back-office/products/bulk` | ADMIN |
| `POST /api/v1/back-office/products/bulk-delete` | ADMIN |
| `GET /api/v1/back-office/customers` | ADMIN |
| `GET /api/v1/back-office/users` | ADMIN |
| `GET /api/v1/back-office/users/{id}` | ADMIN |
| `PUT /api/v1/back-office/users/{id}` | ADMIN |
| `DELETE /api/v1/back-office/users/{id}` | ADMIN |
| `GET /api/v1/back-office/stocks/movements` | ADMIN |
| `POST /api/v1/back-office/stocks/movements` | ADMIN |
| `GET /api/v1/back-office/promo-codes` | ADMIN |
| `GET /api/v1/back-office/promo-codes/stats` | ADMIN |
| `POST /api/v1/back-office/promo-codes` | ADMIN |
| `PUT /api/v1/back-office/promo-codes/{id}` | ADMIN |
| `DELETE /api/v1/back-office/promo-codes/{id}` | ADMIN |
| `GET /api/v1/back-office/marketing/overview` | ADMIN |
| `GET /api/v1/back-office/marketing/campaigns` | ADMIN |
| `POST /api/v1/back-office/marketing/campaigns` | ADMIN |
| `PUT /api/v1/back-office/marketing/campaigns/{id}` | ADMIN |
| `DELETE /api/v1/back-office/marketing/campaigns/{id}` | ADMIN |
| `GET /api/v1/back-office/loyalty/overview` | ADMIN |
| `GET /api/v1/back-office/loyalty/tiers` | ADMIN |
| `GET /api/v1/back-office/loyalty/config` | ADMIN |
| `PUT /api/v1/back-office/loyalty/config` | ADMIN |
| `PUT /api/v1/back-office/loyalty/tiers/{id}` | ADMIN |
| `GET /api/v1/back-office/orders` | ADMIN |
| `POST /api/v1/back-office/orders` | ADMIN |
| `PUT /api/v1/back-office/orders/{id}/status` | ADMIN |
| `POST /api/v1/back-office/orders/quote` | ADMIN |
| `GET /api/v1/back-office/logistics/kpis` | ADMIN |
| `GET /api/v1/back-office/logistics/shipments` | ADMIN |
| `POST /api/v1/back-office/logistics/shipments` | ADMIN |

## Categories
- `parentId` (front) is mapped to `parentSlug` (backend).
- `slug` unique + index on `parent_slug` deferred (performance pass later).

## Products
- Statuts alignes sur le front en BDD: `ACTIVE`, `DRAFT`, `ARCHIVED`.
- DTO expose une seule categorie (`categoryId`/`category`) tout en gardant la liste en BDD.
- Stock calcule via somme de `quantityAvailable`.

## Stocks / Movements
- Mouvement `AJUSTEMENT`: `quantity = |delta|`.
- Stock agregé sur `quantityAvailable`.
- Update du stock sur le premier enregistrement `Stock` (si plusieurs).

## Promo Codes
- `DiscountTarget` à redéfinir selon les besoins front (actuellement: GLOBAL/BOUTIQUE/UTILISATEUR).
- Stats: `usageSeries` renvoyé en liste de zéros (pas encore de tracking réel).

## Marketing
- Overview (`roiGlobal`, `budgetSpent`, `channels`) renvoyé en zéros (stub).

## Loyalty
- Overview renvoyé en zéros (stub).
- Config par défaut si absente (pointsPerFcfa=0.001, valuePerPointFcfa=0.1, retentionDays=30).

## Orders
- Mapping statuts backoffice -> backend:
  - CREEE -> PENDING
  - PAYEE -> PAID
  - EXPEDIEE -> DELIVERY_IN_PROGRESS
  - LIVREE -> DELIVERED
  - ANNULEE -> CANCELED
  - REMBOURSEE -> REFUNDED
- `items` = somme des quantités des lignes.
- `customer` = "Prénom Nom • email" (fallback sur email).
- Quote promo basé uniquement sur Discount (pourcentage/fixe) sans règles avancées.

## Logistics
- KPIs logistiques renvoyés en zéros (stub).

## Users
- Rôle backoffice déduit par priorité: `Authentication.roles` (ADMIN/PARTNER/CUSTOMER), sinon type d'entité (Partner/Customer), sinon `CUSTOMER`.
- `authentifications` retournées seulement si `Authentication.type` est défini (sinon liste vide).
- Changement de rôle ne migre pas le type d'entité (Customer/Partner/Base) pour l'instant.
- Création d'utilisateur via back-office désactivée (lecture + mise à jour uniquement).

## Customers
- `orders/spent/lastOrder` calculés à partir des commandes du client (somme des montants, max `createdAt`).
- Création de client via back-office désactivée (lecture uniquement).
