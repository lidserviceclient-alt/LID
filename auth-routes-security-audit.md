# Etat des lieux routes, authentification et autorisation backend

Date : 2026-04-22

Projet audite : `lid-api/lid`

## Resume executif

Le backend utilise Spring Security en mode Resource Server JWT pour l'API applicative, avec un `accessToken` JWT en `Authorization: Bearer` et un `refresh_token` en cookie HttpOnly.

La protection globale est structuree en deux `SecurityFilterChain` :

- `/api/v1/auth/**` est public pour permettre login, refresh, logout et reset password.
- Le reste de l'API passe par JWT, sauf une liste d'endpoints explicitement publics.
- Les routes `/api/v1/backoffice/**` sont protegees globalement par role, avec des exceptions pour la livraison et l'espace partenaire.
- Certaines regles fines existent via `@PreAuthorize`, mais elles ne sont pas appliquees partout ou la documentation Swagger le laisse entendre.

Les principaux risques observes sont :

- Endpoints client `CustomerController` partiellement non proteges au niveau methode.
- Endpoints paiement accessibles a tout utilisateur authentifie sans verification d'ownership apparente au niveau controller.
- `actuator` expose publiquement.
- Webhook PayDunya qui accepte potentiellement une requete sans hash.
- Refresh token non rotate a chaque refresh.
- CSRF des endpoints `/auth/refresh` et `/auth/logout` a surveiller car ils reposent sur cookie HttpOnly et CORS credentials.
- Autorisation backoffice assez large : beaucoup d'operations sensibles sont accessibles a `ADMIN`, sans granularite metier.

## Modele d'authentification

### Access token

Fichier : `lid/src/main/java/com/lifeevent/lid/auth/service/JwtService.java`

Le token applicatif est un JWT signe en HMAC SHA-256 via `config.security.app.secret`.

Claims actuellement emis :

- `sub` : `userId`, sujet principal Spring Security.
- `email`.
- `phoneNumber`.
- `roles`.
- `firstName`.
- `lastName`.
- `avatarUrl`.
- `iat`.
- `exp`.
- `iss`.

Depuis la derniere correction, le refresh genere maintenant le meme type de token enrichi que le login, via `generateAccessToken(UserJwt, roles)`.

### Validation JWT

Fichier : `lid/src/main/java/com/lifeevent/lid/auth/config/SecurityConfig.java`

Le `JwtDecoder` applicatif verifie :

- signature avec la cle secrete.
- validations Spring par defaut, dont expiration.
- presence du `sub`.
- existence de l'utilisateur en base.
- utilisateur non bloque.

Point positif : un utilisateur supprime ou bloque ne peut plus utiliser son access token, meme non expire.

### Roles

Fichier : `lid/src/main/java/com/lifeevent/lid/auth/config/converter/LidRoleConverter.java`

Les roles JWT sont convertis en authorities Spring :

- `SUPER_ADMIN` -> `ROLE_SUPER_ADMIN`
- `ADMIN` -> `ROLE_ADMIN`
- `LIVREUR` -> `ROLE_LIVREUR`
- `PARTNER` -> `ROLE_PARTNER`
- `CUSTOMER` -> `ROLE_CUSTOMER`

Compatibilites :

- `CLIENT` est normalise en `CUSTOMER`.
- `PARTENAIRE` est normalise en `PARTNER`.
- Les roles deja prefixes `ROLE_` sont acceptes.

### Refresh token

Fichiers :

- `lid/src/main/java/com/lifeevent/lid/auth/service/RefreshTokenService.java`
- `lid/src/main/java/com/lifeevent/lid/auth/entity/RefreshToken.java`
- `lid/src/main/java/com/lifeevent/lid/auth/service/AuthService.java`

Le refresh token est stocke en base comme UUID et envoye au navigateur via cookie :

- nom : `refresh_token`
- `HttpOnly=true`
- `Secure=true` hors profil local
- `SameSite=Lax` en local
- `SameSite=None` hors local
- `Path=/api/v1/auth` ou `{context-path}/api/v1/auth`
- TTL configure par `config.security.app.refresh-ttl-days`

Le refresh token n'est pas actuellement rotate a chaque refresh : le meme UUID reste valide jusqu'a expiration ou logout/revocation.

## Configuration globale des routes

Fichier : `lid/src/main/java/com/lifeevent/lid/auth/config/SecurityConfig.java`

### Chaine auth publique

Toutes les routes suivantes sont `permitAll` via `authChain` :

- `/api/v1/auth/**`
- `/api/auth/**`

Endpoints inclus :

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/login/customer`
- `POST /api/v1/auth/login/partner`
- `POST /api/v1/auth/login/local`
- `POST /api/v1/auth/login/local/delivery`
- `POST /api/v1/auth/login/local/partner`
- `POST /api/v1/auth/login/local/verify`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/password/forgot`
- `POST /api/v1/auth/password/verify`
- `POST /api/v1/auth/password/reset`

Ce choix est normal pour login/refresh, mais les routes password reset doivent avoir rate-limit et anti-bruteforce.

### Routes publiques explicites

Routes toujours publiques :

- `/swagger-ui/**`
- `/swagger-ui.html`
- `/v3/api-docs/**`
- `/actuator/**`
- `/uploads/**`
- `/api/v1/webhooks/**`
- `/api/v1/payments/verify/**`
- `/api/v1/realtime/ws`
- `/api/v1/realtime/ws-access/public`
- `/api/v1/public/**`
- `/api/v1/blog/**`
- `/api/v1/tickets/**`
- `/api/v1/partners/register/step-1`
- `/api/v1/articles/search/**`
- `/api/v1/newsletter/**`
- `/api/v1/cdn/**`
- `GET /api/v1/catalog/**`

Routes publiques seulement en profil local :

- `/api/v1/checkout/**`
- `GET /api/v1/articles/**`

### Routes backoffice

Regles globales :

- `/api/v1/backoffice/logistics/**` : `ADMIN`, `SUPER_ADMIN`, `LIVREUR`
- `/api/v1/backoffice/notifications/**` : `ADMIN`, `SUPER_ADMIN`, `LIVREUR`
- `/api/v1/backoffice/partners/me/**` : `PARTNER`, `ADMIN`, `SUPER_ADMIN`
- `/api/v1/backoffice/**` : `ADMIN`, `SUPER_ADMIN`

Conclusion : le backoffice est majoritairement protege par role au niveau URL. Les controles fins par action sont limites et souvent absents, sauf quelques controllers.

### Toutes les autres routes

Toutes les autres routes non matchees tombent sur :

```java
auth.anyRequest().authenticated();
```

Donc elles exigent un JWT valide, mais pas forcement un role particulier ni ownership.

## Cartographie fonctionnelle des routes

Cette section regroupe les familles principales de routes, pas chaque endpoint ligne par ligne.

### Auth

Base : `/api/v1/auth`

Statut : public.

Fonctions :

- login Google customer/partner.
- login local backoffice/livraison/partner.
- MFA admin local.
- refresh access token.
- logout.
- reset password.

Risques particuliers :

- Pas de rate limiting visible sur login, MFA et password reset.
- `logout` est public et base sur cookie ; impact faible mais CSRF possible.
- `refresh` est public et base sur cookie ; acceptable, mais a durcir avec rotation et controle d'origine.

### Catalogue public

Base : `/api/v1/catalog`

Statut :

- `GET /api/v1/catalog/**` public.
- Les actions reviews POST/DELETE/LIKE/REPORT portent `@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")`.

Fonctions :

- produits publics.
- categories.
- partenaires publics.
- reviews.

Point a verifier : les actions reviews doivent verifier ownership pour suppression/modification, pas seulement le role.

### Tickets publics

Base : `/api/v1/tickets`

Statut : public.

Fonctions :

- listing et detail des tickets/evenements.

Risque faible si lecture seule, mais verifier que le controller ne contient pas d'ecriture sous cette base.

### Blog public

Base : `/api/v1/blog/**`

Statut : public.

Risque faible si lecture seule. Les operations backoffice blog sont sous `/api/v1/backoffice/blog-posts`.

### Newsletter publique

Base : `/api/v1/newsletter`

Statut : public.

Fonctions :

- subscribe.
- unsubscribe.

Risques :

- abus/spam si pas de rate limit.
- enumeration d'emails selon reponses.

### Commandes client

Base : `/api/v1`

Endpoints :

- `POST /checkout/cart`
- `POST /checkout`
- `POST /checkout/quote`
- `POST /checkout/selected`
- `GET /orders?customerId=...`
- `GET /orders/{id}`
- `GET /orders/by-number/{orderNumber}`
- `GET /orders/{id}/tracking`

Statut :

- authentifie globalement hors local.
- en local, `/api/v1/checkout/**` est public.
- pas de `@PreAuthorize` visible dans `OrderController`.

Risque important :

- Les endpoints prennent souvent `customerId` en request param.
- Sans verification explicite `customerId == authentication.name` dans controller/service, un utilisateur authentifie peut potentiellement demander les commandes d'un autre client.
- Les endpoints par `id` ou `orderNumber` doivent verifier ownership avant de retourner le detail.

Action recommandee :

- Ajouter `@PreAuthorize("(#customerId == authentication.name) or hasAnyRole('ADMIN','SUPER_ADMIN')")` sur les endpoints a `customerId`.
- Pour `id`/`orderNumber`, faire une verification service avec `authentication.name`, car l'ownership n'est pas disponible directement depuis le path.
- Eviter de garder `/checkout/**` public meme en local, ou isoler cela derriere un profile/dev flag tres explicite.

### Suivi et retours publics

Bases :

- `/api/v1/public/orders`
- `/api/v1/public/returns`

Statut : public.

Fonctions :

- tracking par reference.
- retours publics.

Risque :

- Les numeros de commande doivent rester non enumerables.
- Le tracking public ne doit pas exposer donnees personnelles excessives.
- Les retours publics doivent verifier un secret metier additionnel quand possible, par exemple email + numero de commande, pas seulement numero.

### Clients

Base : `/api/v1/customers`

Statut :

- authentifie globalement.
- certaines routes address ont `@PreAuthorize`.
- plusieurs routes principales n'ont pas `@PreAuthorize` dans `CustomerController`.

Routes avec risque :

- `POST /api/v1/customers`
- `GET /api/v1/customers/{id}`
- `GET /api/v1/customers`
- `GET /api/v1/customers/email/{email}`
- `PUT /api/v1/customers/{id}`
- `DELETE /api/v1/customers/{id}`
- `GET /api/v1/customers/check-email/{email}`

Risque important :

- La documentation annonce "own profile or ADMIN", mais seules les routes adresses ont l'annotation.
- Avec `anyRequest().authenticated()`, un simple utilisateur authentifie pourrait potentiellement lire/modifier/supprimer un autre client si le service ne bloque pas.

Action recommandee :

- Ajouter `@PreAuthorize("(#id == authentication.name) or hasAnyRole('ADMIN','SUPER_ADMIN')")` sur get/update/delete customer.
- Ajouter `@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")` sur list all et get by email.
- Decider si create/check-email sont vraiment publics ou authentifies, puis aligner la config.

### Customer profile `me`

Base : `/api/v1/customers/me`

Statut : `@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")`.

Fonctions :

- collection profil client.
- collection checkout.

Point positif : route `me` limite les erreurs d'ownership en evitant de passer un `customerId` client.

### Cart

Base : `/api/v1/carts`

Statut :

- annotations `@PreAuthorize` dans `ICartController`.
- ownership sur `customerId == authentication.name` ou admin/super admin.

Point positif : logique d'ownership explicite.

### Wishlist

Base : `/api/v1/wishlist`

Statut : authentifie globalement.

Point a verifier :

- Les routes utilisent probablement `customerId` en query param.
- Il faut verifier que le controller/service impose `customerId == authentication.name` ou admin.

### Payments

Base : `/api/v1/payments`

Statut :

- `/api/v1/payments/verify/**` public.
- les autres endpoints sont seulement authentifies globalement, sans role/ownership visible dans `PaymentController`.

Endpoints sensibles :

- `GET /api/v1/payments/{paymentId}`
- `GET /api/v1/payments/order/{orderId}`
- `GET /api/v1/payments/order-number/{orderNumber}`
- `GET /api/v1/payments/customer/{email}`
- `DELETE /api/v1/payments/{paymentId}`

Risque important :

- Un utilisateur authentifie pourrait potentiellement consulter ou annuler un paiement qui ne lui appartient pas.
- `customer/{email}` est particulierement sensible car l'email est enumerable.

Action recommandee :

- Ajouter ownership service-level pour chaque lecture/annulation.
- Restreindre `customer/{email}` a admin/super admin ou remplacer par `/payments/me`.
- Garder `verify/{invoiceToken}` public seulement si le token est non enumerable et ne retourne pas trop d'informations.

### Webhooks

Base : `/api/v1/webhooks`

Statut : public.

Risque important :

- Dans `WebhookController`, si `hash == null`, la validation de signature est contournee :

```java
if (hash != null && !securityService.isValidPaydunyaRequest(hash)) { ... }
```

Cela signifie qu'une requete avec un `token` mais sans `hash` peut appeler `processPaymentCallback(token)`.

Action recommandee :

- Exiger `hash` obligatoire en production.
- Valider le hash sur payload brut ou selon la specification PayDunya, pas seulement presence.
- Logger sans exposer de donnees sensibles.
- Ajouter idempotence forte cote paiement.

### Storage / media

Base : `/api/v1/storage`

Statut : authentifie globalement.

Endpoints :

- upload.
- upload bulk.
- list media.
- delete.

Risques :

- Pas de `@PreAuthorize` visible.
- Tout utilisateur authentifie pourrait potentiellement uploader/lister/supprimer selon les parametres `ownerScope`, `ownerUserId`, `objectKey`.
- L'ownership media doit etre verifie dans `MediaAssetService`. Si ce n'est pas fait, risque d'escalade entre LID/PARTNER.

Action recommandee :

- Ajouter regles controller :
- `ownerScope=LID` reserve a `ADMIN/SUPER_ADMIN`.
- `ownerScope=PARTNER` reserve au partenaire proprietaire ou admin.
- `delete(objectKey)` doit verifier la propriete du media en base avant suppression storage.

### Backoffice LID

Base : `/api/v1/backoffice/**`

Statut global :

- `ADMIN`, `SUPER_ADMIN`.
- exceptions pour logistics/notifications avec `LIVREUR`.

Sous-domaines :

- customers.
- orders.
- returns.
- products.
- categories.
- stocks.
- logistics.
- partners admin.
- finance.
- settings.
- messages.
- marketing.
- blog.
- tickets.
- logs.

Risque :

- Granularite faible : `ADMIN` a acces a beaucoup d'operations sensibles, y compris configuration, messages, finance, stock, etc.
- Certains endpoints critiques ont une granularite plus forte, par exemple logs avec `@PreAuthorize("hasRole('SUPER_ADMIN')")`, mais ce n'est pas systematique.

Action recommandee :

- Introduire des permissions metier ou roles plus fins si besoin : `FINANCE_ADMIN`, `CONTENT_ADMIN`, `LOGISTICS_ADMIN`, `SUPPORT`, etc.
- Au minimum, passer les exports, integrations, security settings, paiements partenaires et logs en `SUPER_ADMIN`.

### Backoffice partenaire

Base : `/api/v1/backoffice/partners/me/**`

Statut global :

- `PARTNER`, `ADMIN`, `SUPER_ADMIN`.

Controller :

- nombreuses routes avec `@PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")`.

Point de vigilance :

- Les routes CRUD partenaire doivent toujours resoudre le partenaire depuis `authentication.name`, pas depuis un parametre client.
- `ADMIN/SUPER_ADMIN` doivent avoir un comportement explicite : soit impersonation controlee, soit acces admin dedie.

### Backoffice logistics

Base : `/api/v1/backoffice/logistics/**`

Statut global :

- `ADMIN`, `SUPER_ADMIN`, `LIVREUR`.

Risque :

- Le role `LIVREUR` accede a toute la base logistics backoffice selon la regle globale.
- Certaines operations comme creer/modifier expedition, update status, scan, deliver doivent avoir des verifications metier fines.

Action recommandee :

- Restreindre `LIVREUR` aux actions strictement necessaires.
- Verifier que le livreur ne peut agir que sur ses missions affectees.

### Realtime

Base : `/api/v1/realtime`

Statut :

- `/ws` public selon config.
- `/ws-access/public` public.
- `/ws-access` authentifie globalement.

Risque :

- Le websocket public doit verifier que le ticket `ws-access` limite les topics publics.
- Les topics prives doivent etre filtres par role cote backend, pas seulement par frontend.

### Actuator et documentation

Statut :

- `/actuator/**` public.
- Swagger et OpenAPI publics.

Risque :

- Selon les endpoints actuator exposes, fuite de metadonnees, variables, health details, metrics.
- Swagger public donne la carte complete de l'API.

Action recommandee :

- En production, restreindre `/actuator/**` aux admins ou a un reseau interne.
- Exposer uniquement `health` minimal si necessaire.
- Restreindre Swagger en prod ou le proteger.

## Risques de securite priorises

### Critique - Webhook PayDunya accepte possiblement sans signature

Fichier : `WebhookController.java`

Probleme :

- `hash` est facultatif.
- Si absent, la validation est sautee.
- Un attaquant qui connait ou devine un token pourrait declencher `processPaymentCallback`.

Correction :

- Rendre `hash` obligatoire.
- Rejeter toute requete sans signature.
- Valider selon payload exact attendu par PayDunya.

### Critique - Ownership incomplet sur CustomerController

Fichier : `CustomerController.java`

Probleme :

- Plusieurs routes customer ne portent pas l'annotation annoncee par la documentation.
- `anyRequest().authenticated()` suffit a passer la securite globale.

Correction :

- Ajouter `@PreAuthorize` sur get/update/delete/list/get-by-email/check-email selon politique voulue.
- Preferer des endpoints `/me` pour les clients.

### Critique - Paiements sans ownership visible

Fichier : `PaymentController.java`

Probleme :

- Les endpoints de consultation/annulation semblent accessibles a tout utilisateur authentifie.
- Les parametres `paymentId`, `orderId`, `orderNumber`, `email` sont sensibles.

Correction :

- Verifier ownership en service.
- Restreindre les recherches par email aux admins.
- Supprimer ou proteger `DELETE /payments/{paymentId}`.

### Eleve - Refresh token non rotate

Fichier : `RefreshTokenService.java`

Probleme :

- Le meme refresh token reste valide jusqu'a expiration/logout.
- En cas de vol, il est reutilisable pendant toute sa duree de vie.

Correction :

- Rotation a chaque refresh.
- Stocker un lien de famille/session.
- Detecter reuse d'un token deja revoke.
- Revoquer toute la famille si reuse.

### Eleve - CSRF possible sur refresh/logout/password endpoints

Fichiers :

- `SecurityConfig.java`
- `AuthService.java`

Probleme :

- CSRF est desactive globalement.
- Le refresh token est en cookie HttpOnly envoye automatiquement.
- CORS limite partiellement, mais une defense CSRF explicite est preferable pour endpoints cookie-based.

Nuance :

- L'attaquant ne peut pas lire la reponse cross-origin si CORS est strict.
- Mais il peut potentiellement declencher des effets de bord comme logout ou refresh.

Correction :

- Ajouter CSRF token double-submit pour endpoints auth cookie-based.
- Verifier `Origin`/`Referer` sur `/refresh` et `/logout`.
- Garder une allowlist stricte de domaines frontend/backoffice/delivery.

### Eleve - Actuator public

Fichier : `SecurityConfig.java`

Probleme :

- `/actuator/**` est permitAll.

Correction :

- Proteger en prod.
- Exposer uniquement `/actuator/health` minimal si necessaire.

### Eleve - Storage sans autorisation fine visible

Fichier : `FileStorageController.java`

Probleme :

- Upload/list/delete sont seulement authentifies globalement.
- Les parametres `ownerScope`, `ownerUserId`, `objectKey` peuvent permettre d'agir sur les medias d'un autre scope si le service ne verifie pas.

Correction :

- Ajouter `@PreAuthorize` et controles service.
- Ne jamais faire confiance a `ownerUserId` fourni par le client partenaire ; utiliser `authentication.name`.

### Moyen - CORS credentials avec origin patterns

Fichiers :

- `CorsConfig.java`
- `application.yaml`

Probleme :

- `allowCredentials=true`.
- `allowedHeaders=*`.
- origins controlees par variable `CORS_ALLOWED_ORIGIN_PATTERNS`.

Risque :

- Mauvaise config prod de `CORS_ALLOWED_ORIGIN_PATTERNS` peut exposer les cookies refresh a des origins non voulues.

Correction :

- En prod, lister explicitement les domaines frontend/backoffice/delivery.
- Eviter les patterns larges.

### Moyen - Roles backoffice trop larges

Probleme :

- `ADMIN` peut probablement acceder a trop de domaines critiques.

Correction :

- Passer les fonctions sensibles en `SUPER_ADMIN` ou permissions fines :
- logs.
- security settings.
- integrations.
- exports.
- finance/payouts.
- gestion roles/users.

### Moyen - Login/MFA/password reset sans rate limit visible

Routes :

- `/api/v1/auth/login/local`
- `/api/v1/auth/login/local/verify`
- `/api/v1/auth/password/*`

Risque :

- Bruteforce password.
- Bruteforce code MFA/reset 6 chiffres.
- Enumeration ou spam email.

Correction :

- Rate limit par IP + email/user.
- Lockout progressif.
- Journalisation securite.
- Expiration et nombre max d'essais pour les tokens MFA/reset.

### Moyen - Routes publiques de tracking/returns

Routes :

- `/api/v1/public/orders/tracking/{reference}`
- `/api/v1/public/returns/**`

Risque :

- Si les references sont trop predictibles ou si la reponse contient trop de donnees, fuite d'informations de commande.

Correction :

- Garder les references non enumerables.
- Ajouter verification email/tel quand necessaire.
- Limiter les donnees retournees.

## Recommandations de migration

### Phase 1 - Corrections rapides

- Rendre le hash PayDunya obligatoire.
- Proteger `/actuator/**` en production.
- Ajouter `@PreAuthorize` manquants sur `CustomerController`.
- Ajouter ownership sur `PaymentController`.
- Supprimer `retryAuth=false` cote front/backoffice quand le refresh doit fonctionner.

### Phase 2 - Durcissement auth

- Rotation refresh token.
- CSRF token ou verification `Origin` stricte sur auth cookie endpoints.
- Rate limiting login/MFA/password reset/newsletter.
- Nettoyage/expiration des refresh tokens anciens.

### Phase 3 - Autorisations fines

- Introduire permissions backoffice par domaine.
- Verifier ownership partenaire et livreur dans les services.
- Restreindre storage/media par scope et proprietaire.
- Auditer chaque endpoint `authenticated()` sans `@PreAuthorize`.

## Points a verifier par tests

- Un customer A ne peut pas lire/modifier/supprimer le customer B.
- Un customer A ne peut pas lire les commandes ou paiements de B par `id`, `orderNumber`, `email`.
- Un partner ne peut pas agir sur les produits/categories/medias d'un autre partner.
- Un livreur ne peut pas scanner/delivrer une expedition non affectee.
- Un admin simple ne peut pas acceder aux logs/security/integrations si ces fonctions doivent etre super-admin.
- Un webhook PayDunya sans hash est rejete.
- Un refresh token vole puis rotate est detecte au reuse.
- `/actuator/**` est inaccessible publiquement en production.

