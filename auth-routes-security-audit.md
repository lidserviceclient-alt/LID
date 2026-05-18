# Failles de securite potentielles

Date : 2026-05-01

Perimetre inspecte :

- `lid/src/main/java`
- `deployment/docker-compose.yml`
- `deployment/.env.prod`
- `deployment/.env.dev`

Les valeurs secretes des fichiers `.env*` ne sont pas reproduites.

## Critique

### 1. Webhook PayDunya public avec signature facultative

Preuve :

- `SecurityConfig` declare `/api/v1/webhooks/**` en `permitAll`.
- `WebhookController.handlePaydunyaCallback(...)` declare `hash` avec `required = false`.
- Le code ne valide la signature que si `hash != null`.

Impact potentiel :

- Une requete sans `hash` peut atteindre `paymentService.processPaymentCallback(token)`.
- Si un token de facture est connu, fuite ou devine, un callback peut etre force sans signature.

Solution :

- Rendre `hash` obligatoire.
- Rejeter toute requete webhook non signee.
- Valider la signature selon le payload exact attendu par PayDunya.

### 2. Endpoints paiement sans controle d'ownership visible

Preuve :

- `PaymentController` expose :
  - `GET /api/v1/payments/{paymentId}`
  - `GET /api/v1/payments/order/{orderId}`
  - `GET /api/v1/payments/order-number/{orderNumber}`
  - `GET /api/v1/payments/customer/{email}`
  - `DELETE /api/v1/payments/{paymentId}`
- Aucun `@PreAuthorize` n'est visible sur ces methodes.
- La securite globale impose seulement `authenticated()` hors `/payments/verify/**`.

Impact potentiel :

- Un utilisateur authentifie peut potentiellement lire ou annuler un paiement qui ne lui appartient pas si le service ne bloque pas explicitement.
- La route `/payments/customer/{email}` permet une recherche par identifiant personnel enumerable.

Solution :

- Verifier l'ownership dans le service pour chaque paiement retourne ou annule.
- Reserver `/payments/customer/{email}` a `ADMIN/SUPER_ADMIN`, ou remplacer par `/payments/me`.

### 3. Secrets de production presents dans des fichiers `.env` locaux

Preuve :

- `deployment/.env.prod` contient des valeurs pour :
  - `APP_JWT_SECRET_KEY`
  - `POSTGRES_PASSWORD`
  - `SPRING_DATA_REDIS_PASSWORD`
  - `REDIS_PASSWORD`
  - `SMTP_PASSWORD`
  - `PAYDUNYA_MASTER_KEY`
  - `PAYDUNYA_PRIVATE_KEY`
  - `PAYDUNYA_TOKEN`
  - `BACKBLAZE_KEY_ID`
  - `BACKBLAZE_APPLICATION_KEY`

Impact potentiel :

- Une copie locale du dossier ou une sauvegarde poste peut exposer des acces prod.
- Si la cle JWT prod est exposee, des tokens applicatifs peuvent etre forges.
- Si les secrets dev/prod sont identiques, une fuite dev peut impacter prod.

Solution :

- Stocker les secrets prod uniquement dans GitHub Secrets ou un coffre de secrets.
- Supprimer les copies locales non necessaires.
- Rotater les secrets exposes localement.
- Separarer strictement les secrets dev et prod.

## Eleve

### 4. Swagger et OpenAPI publics

Preuve :

- `SecurityConfig` declare en `permitAll` :
  - `/swagger-ui/**`
  - `/swagger-ui.html`
  - `/v3/api-docs/**`

Impact potentiel :

- Exposition publique de la cartographie des endpoints, schemas, parametres et routes sensibles.

Solution :

- Desactiver Swagger/OpenAPI en prod, ou le proteger par `ADMIN/SUPER_ADMIN`.

### 5. `PAYDUNYA_MODE=test` dans `.env.prod`

Preuve :

- `deployment/.env.prod` declare `PAYDUNYA_MODE=test`.
- Le meme fichier declare `DOMAIN=api.lidshopping.com`.

Impact potentiel :

- Le deploiement prod peut utiliser l'environnement PayDunya de test.
- Les paiements reels peuvent etre refuses, simules ou incoherents avec les commandes prod.

Solution :

- Passer `PAYDUNYA_MODE` a la valeur production attendue par l'integration.
- Utiliser les cles PayDunya production.
- Ajouter un check de demarrage ou de GitHub Action : `DOMAIN=api.lidshopping.com` interdit avec `PAYDUNYA_MODE=test`.

### 6. Absence visible de rate limiting sur endpoints sensibles

Preuve :

- Aucun mecanisme de rate limiting n'est visible dans les controllers ou la configuration securite inspectee.
- Endpoints exposes concernes :
  - login
  - MFA
  - password reset
  - newsletter
  - webhook
  - tracking public

Impact potentiel :

- Bruteforce login/MFA/reset.
- Enumeration email ou numero de commande.
- Spam newsletter.
- Charge abusive sur endpoints publics.

Solution :

- Ajouter un rate limit par IP et par identifiant metier.
- Stockage compteur Redis ou middleware reverse-proxy.
- Journaliser les refus sans exposer tokens ou secrets.

## Moyen

### 7. Refresh token non rotate a chaque refresh

Preuve :

- `RefreshTokenService.create(...)` cree un UUID persiste.
- `AuthService.refresh(...)` valide le token existant.
- Aucune rotation du refresh token courant n'est visible dans le flux refresh.

Impact potentiel :

- Un refresh token vole reste reutilisable jusqu'a expiration ou revocation manuelle/logout.

Solution :

- Rotater le refresh token a chaque refresh.
- Revoquer l'ancien token apres emission du nouveau.
- Detecter la reutilisation d'un refresh token deja revoke.

### 8. CORS prod avec credentials et headers wildcard

Preuve :

- `deployment/.env.prod` declare `CORS_ALLOW_CREDENTIALS=true`.
- `deployment/.env.prod` declare `CORS_ALLOWED_HEADERS=*`.
- Les origins prod sont limitees aux domaines LID.

Impact potentiel :

- Avec credentials actives, le wildcard sur les headers garde une surface CORS plus large que necessaire.

Solution :

- Remplacer `CORS_ALLOWED_HEADERS=*` par une liste explicite :
  - `Authorization`
  - `Content-Type`
  - `X-Requested-With`
  - autres headers applicatifs reellement utilises.

### 9. Alerting active avec destinataires vides

Preuve :

- `deployment/.env.prod` declare `INTERNAL_ERROR_ALERT_ENABLED=true`.
- Les destinataires backoffice/fallback inspectes sont vides.

Impact potentiel :

- Les erreurs internes peuvent ne pas etre notifiees malgre l'activation de l'alerting.

Solution :

- Renseigner au moins un destinataire prod.
- Ajouter une validation au demarrage si l'alerting est active.

## Faible

### 10. Role `ADMIN` tres large sur le backoffice

Preuve :

- `SecurityConfig` autorise `/api/v1/backoffice/**` a `ADMIN` et `SUPER_ADMIN`.
- Certaines routes critiques ont une granularite specifique, mais pas toutes.

Impact potentiel :

- Compromission d'un compte `ADMIN` = acces large aux domaines clients, commandes, finance, contenus, settings et marketing.

Solution :

- Introduire des roles plus fins :
  - `FINANCE_ADMIN`
  - `CONTENT_ADMIN`
  - `SUPPORT_ADMIN`
  - `LOGISTICS_ADMIN`
- Reserver integrations, logs, finance sensible et paiements partenaires a `SUPER_ADMIN`.

### 11. Dev et prod semblent partager des secrets

Preuve :

- Les variables sensibles inspectees dans `deployment/.env.dev` et `deployment/.env.prod` ont les memes familles de valeurs configurees.
- Certaines valeurs semblent identiques entre dev et prod.

Impact potentiel :

- Une fuite d'environnement dev peut compromettre prod si les secrets sont partages.

Solution :

- Generer des secrets distincts par environnement.
- Rotater les secrets prod apres separation.
