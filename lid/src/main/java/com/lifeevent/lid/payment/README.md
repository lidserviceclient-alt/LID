# Module Payment - Intégration PayDunya

## 📋 Vue d'ensemble

Ce module gère l'intégration complète de PayDunya pour les paiements dans l'application LID e-commerce. Il supporte les paiements via:

- **Orange Money** (Côte d'Ivoire, Sénégal)
- **MTN Mobile Money** (Côte d'Ivoire, Sénégal)
- **Wave** (Côte d'Ivoire, Sénégal)
- **Cartes Bancaires** (Tous les pays supportés)

## 🏗️ Architecture

### Séparation des Responsabilités

```
controllers/          # Endpoints REST
├── PaymentController     # Gestion des paiements
├── RefundController      # Gestion des remboursements
└── WebhookController     # Réception des callbacks PayDunya

services/             # Logique métier
├── PaymentService        # Interface des paiements
├── RefundService         # Interface des remboursements
└── PaydunyaSecurityService # Sécurité et validation

service/impl/         # Implémentations
├── PaymentServiceImpl
├── RefundServiceImpl
└── PaydunyaSecurityServiceImpl

entities/             # Modèles JPA
├── Payment           # Transactions de paiement
├── Refund            # Demandes de remboursement
└── PaymentTransaction # Historique d'audit

dto/                  # Data Transfer Objects
├── CreatePaymentRequestDto
├── PaymentResponseDto
├── PaymentStatusResponseDto
├── RefundRequestDto
└── RefundResponseDto

repositories/         # Accès aux données
├── PaymentRepository
├── RefundRepository
└── PaymentTransactionRepository

config/               # Configuration
├── PaydunyaConfig        # Beans PayDunya
└── PaydunyaProperties    # Propriétés externalisées
```

## 🔧 Configuration

### 1. Variables d'Environnement

Définissez dans votre `.env` ou variables système:

```bash
export PAYDUNYA_MASTER_KEY="votre-master-key"
export PAYDUNYA_PRIVATE_KEY="votre-private-key"
export PAYDUNYA_PUBLIC_KEY="votre-public-key"
export PAYDUNYA_TOKEN="votre-token"
```

### 2. application.yaml

```yaml
paydunya:
  mode: test  # ou "live" pour la production
  masterKey: ${PAYDUNYA_MASTER_KEY}
  privateKey: ${PAYDUNYA_PRIVATE_KEY}
  publicKey: ${PAYDUNYA_PUBLIC_KEY}
  token: ${PAYDUNYA_TOKEN}
  
  storeName: LID E-commerce
  storePhoneNumber: +225XXXXXXXXXX
  storePostalAddress: Abidjan, Côte d'Ivoire
  
  callbackUrl: https://api.lid-ecommerce.com/api/v1/webhooks/paydunya
  returnUrl: https://lid-ecommerce.com/payment/success
  cancelUrl: https://lid-ecommerce.com/payment/cancel
```

## 📚 Endpoints API

### Paiements

#### 1. Créer un paiement
```bash
POST /api/v1/payments

{
  "orderId": 123,
  "amount": 25000.00,
  "currency": "XOF",
  "description": "Achat de produits",
  "operator": "ORANGE_MONEY_CI",
  "customerName": "Jean Dupont",
  "customerEmail": "jean@example.com",
  "customerPhone": "+225 01 02 03 04 05",
  "returnUrl": "https://lid-ecommerce.com/payment/success",
  "cancelUrl": "https://lid-ecommerce.com/payment/cancel",
  "items": [
    {
      "name": "Produit A",
      "quantity": 2,
      "unitPrice": 10000.00,
      "totalPrice": 20000.00,
      "description": "Description du produit"
    }
  ],
  "taxes": [
    {
      "name": "TVA (18%)",
      "amount": 3600.00
    }
  ]
}

Response:
{
  "id": 1,
  "orderId": 123,
  "invoiceToken": "test_abc123",
  "amount": 25000.00,
  "status": "PENDING",
  "createdAt": "2024-12-27T10:30:00"
}
```

#### 2. Vérifier le statut d'un paiement
```bash
GET /api/v1/payments/verify/{invoiceToken}

Response:
{
  "paymentId": 1,
  "invoiceToken": "test_abc123",
  "status": "COMPLETED",
  "statusLabel": "Complété",
  "receiptUrl": "https://paydunya.com/receipt/...",
  "customerName": "Jean Dupont",
  "customerEmail": "jean@example.com"
}
```

#### 3. Récupérer les détails d'un paiement
```bash
GET /api/v1/payments/{paymentId}
```

#### 4. Récupérer les paiements d'une commande
```bash
GET /api/v1/payments/order/{orderId}
```

#### 5. Récupérer les paiements d'un client
```bash
GET /api/v1/payments/customer/{email}
```

#### 6. Annuler un paiement
```bash
DELETE /api/v1/payments/{paymentId}
```

#### 7. Lister les opérateurs disponibles
```bash
GET /api/v1/payments/operators/{countryCode}

// Codes pays supportés: CI (Côte d'Ivoire), SN (Sénégal), BJ, BF, CM, CG, GA, GW, ML

Response:
[
  "orange-money-ci",
  "mtn-momo-ci",
  "wave-ci",
  "card"
]
```

### Remboursements

#### 1. Créer une demande de remboursement
```bash
POST /api/v1/refunds

{
  "paymentId": 1,
  "amount": 25000.00,
  "reason": "Client insatisfait du produit"
}

Response:
{
  "id": 1,
  "paymentId": 1,
  "amount": 25000.00,
  "reason": "Client insatisfait du produit",
  "status": "PENDING",
  "createdAt": "2024-12-27T10:35:00"
}
```

#### 2. Récupérer un remboursement
```bash
GET /api/v1/refunds/{refundId}
```

#### 3. Récupérer les remboursements d'un paiement
```bash
GET /api/v1/refunds/payment/{paymentId}
```

#### 4. Récupérer les remboursements en attente
```bash
GET /api/v1/refunds/pending
```

#### 5. Traiter un remboursement
```bash
POST /api/v1/refunds/{refundId}/process
```

#### 6. Annuler un remboursement
```bash
DELETE /api/v1/refunds/{refundId}
```

### Webhooks

#### Réception des notifications PayDunya (IPN)
```bash
POST /api/v1/webhooks/paydunya

PayDunya envoie automatiquement les notifications à cette URL
Les données reçues sont validées via le hash SHA-512
```

#### Health check du webhook
```bash
GET /api/v1/webhooks/health
```

## 🔒 Sécurité

### Validation des Hashs

PayDunya envoie un hash SHA-512 pour valider l'intégrité des données:
- Le hash est généré à partir de votre `MasterKey`
- Service: `PaydunyaSecurityService`
- Méthode: `isValidPaydunyaRequest(hash)`

### Bonnes Pratiques

1. **Ne jamais mettre les clés en dur** - Utilisez des variables d'environnement
2. **Mode Test en Développement** - Activez le mode test pendant le développement
3. **HTTPS Obligatoire** - En production, utilisez toujours HTTPS
4. **Valider les Montants** - Vérifiez que le montant reçu correspond à celui attendu
5. **Audit Trail** - Toutes les transactions sont enregistrées dans `PaymentTransaction`

## 📊 États des Paiements

```
PENDING    → En attente de paiement
COMPLETED  → Paiement réussi
CANCELLED  → Paiement annulé
FAILED     → Paiement échoué
REFUNDED   → Paiement remboursé
```

## 🗄️ Modèle de Données

### Payment
- `id` - Identifiant unique
- `orderId` - ID de la commande
- `invoiceToken` - Token PayDunya
- `amount` - Montant du paiement
- `currency` - Devise (XOF par défaut)
- `operator` - Opérateur de paiement utilisé
- `status` - État du paiement
- `customerName/Email/Phone` - Informations du client
- `receiptUrl` - URL du reçu PDF
- `paymentDate` - Date du paiement
- `paydunyaHash` - Hash de sécurité reçu

### Refund
- `id` - Identifiant unique
- `paymentId` - Paiement associé
- `amount` - Montant remboursé
- `reason` - Motif du remboursement
- `status` - État (PENDING, PROCESSING, COMPLETED, FAILED)
- `refundId` - Référence PayDunya
- `processedDate` - Date de traitement

### PaymentTransaction
- `id` - Identifiant unique
- `paymentId` - Paiement associé
- `transactionType` - Type (CREATION, CONFIRMATION, REFUND, etc.)
- `statusAtTime` - État à ce moment
- `details` - Détails additionnels
- `source` - Source (API, WEBHOOK, MANUAL)

## 🚀 Flow de Paiement Complet

### 1. Initiation
```
Client → API POST /api/v1/payments
   ↓
Service crée une facture PayDunya
   ↓
API retourne l'ID et le token
   ↓
Client est redirigé vers PayDunya
```

### 2. Paiement
```
Client effectue le paiement sur PayDunya
   ↓
PayDunya retourne au return_url
   ↓
Frontend vérifie le statut avec verify endpoint
```

### 3. Confirmation
```
PayDunya envoie un IPN (webhook) à callback_url
   ↓
WebhookController reçoit et valide le hash
   ↓
PaymentService met à jour le statut
   ↓
Application traite la commande
```

### 4. Remboursement (optionnel)
```
Client demande un remboursement
   ↓
API POST /api/v1/refunds
   ↓
Service crée une demande
   ↓
Admin traite POST /api/v1/refunds/{id}/process
   ↓
PayDunya traite le remboursement
```

## 📝 Opérateurs de Paiement

### Côte d'Ivoire
- `ORANGE_MONEY_CI` - Orange Money
- `MTN_MONEY_CI` - MTN Mobile Money
- `WAVE_CI` - Wave
- `CARD_CI` - Cartes bancaires

### Sénégal
- `ORANGE_MONEY_SENEGAL` - Orange Money
- `MTN_MONEY_SENEGAL` - MTN Mobile Money
- `WAVE_SENEGAL` - Wave
- `CARD_SENEGAL` - Cartes bancaires

### Autres Pays Africains
- Support pour BJ, BF, CM, CG, GA, GW, ML
- Voir `PaymentOperator` enum pour la liste complète

## 🔄 Passage du Mode Test au Mode Production

### 1. Configuration
```yaml
paydunya:
  mode: live  # Changer de "test" à "live"
  # Mettre à jour avec les vraies clés API
```

### 2. URLs
```
Test:       https://sandbox.paydunya.com
Production: https://paydunya.com
```

### 3. Clés API
- Récupérez les clés production dans votre compte PayDunya
- Mettez à jour les variables d'environnement
- Redéployez l'application

### 4. Testing
```bash
# Avant de passer en production:
# 1. Tester tous les opérateurs en mode test
# 2. Vérifier les webhooks
# 3. Tester les remboursements
# 4. Activer HTTPS sur tous les endpoints
```

## 🛠️ Développement & Debugging

### Logs
```
# Voir les logs de paiement
tail -f logs/payment.log

# Tous les paiements
PaymentRepository.findAll()

# Historique d'un paiement
PaymentTransactionRepository.findByPaymentId(id)
```

### Tests en Mode Test
```bash
# Utiliser les numéros de test PayDunya
# Voir documentation: https://developers.paydunya.com/doc/FR/test

# Montants de test:
# Succès: Tout montant
# Annulation: Annuler sur la page de paiement
```

## 📞 Support & Documentation

- **PayDunya Documentation**: https://developers.paydunya.com/doc/FR/Java
- **Email Support**: contact@paydunya.com
- **Dashboard**: https://paydunya.com

## 📋 Checklist Mise en Production

- [ ] Clés API production configurées
- [ ] Mode changé de "test" à "live"
- [ ] Callback URL pointant vers votre serveur
- [ ] HTTPS activé partout
- [ ] Tests de remboursement effectués
- [ ] Audit trail activé
- [ ] Monitoring des webhooks en place
- [ ] Email de confirmation en place
- [ ] Historique des transactions sauvegardé
- [ ] Plan de backup des données de paiement
