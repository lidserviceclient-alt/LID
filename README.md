# lid-api
Life Event Distribution Api repository

# Run du projet

## Prérequis
- Java 21
- Maven Wrapper (`./mvnw`)
- Docker + Docker Compose (pour PostgreSQL local)

## 1) Run local rapide (H2 en mémoire)
Depuis `lid/` :

```bash
cd lid
./mvnw spring-boot:run
```

API disponible sur `http://localhost:9000`.


## 2) (optionnel : recréation des tables) Générer le DDL PostgreSQL (`deployment/ddl.sql`)
Le projet fournit un profil dédié `ddl-postgres` (fichier `lid/src/main/resources/application-ddl-postgres.yaml`).

Depuis `lid/` :

```bash
cd /Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/lid
rm -f ../deployment/ddl.sql
SPRING_PROFILES_ACTIVE=ddl-postgres ./mvnw -DskipTests spring-boot:run
```

Puis :
1. Attendre le log `Started LidApplication`
2. Stopper le process (`Ctrl+C`)
3. Vérifier le fichier généré : `deployment/ddl.sql`

Option robuste (désactive explicitement les anciennes clés `javax` au runtime) :

```bash
SPRING_PROFILES_ACTIVE=ddl-postgres \
./mvnw -DskipTests spring-boot:run \
-Dspring-boot.run.jvmArguments="-Dspring.jpa.properties.javax.persistence.schema-generation.database.action=none -Dspring.jpa.properties.javax.persistence.schema-generation.scripts.action=none"
```

## 3) Run local en mode DB prod-like (PostgreSQL)
Un profil dédié existe : `application-db-prod.yml` (profil Spring `db-prod`).

### Démarrer uniquement la base PostgreSQL locale
Depuis `deployment/` :

```bash
docker rm -f lid-db

docker run -d \
  --name lid-db \
  -p 55432:5432 \
  -e POSTGRES_USER=lid_user \
  -e POSTGRES_PASSWORD=lid_pass \
  -e POSTGRES_DB=lid_db \
  -v lid-db-data:/var/lib/postgresql/data \
  -v /Users/jeanemmanuel/Desktop/company-projects/lid/lid-api/deployment/ddl.sql:/docker-entrypoint-initdb.d/10-ddl.sql:ro \
  postgres:15
```

### Lancer l'API en local connectée à PostgreSQL
Depuis `lid/` :

```bash
SPRING_DATASOURCE_USERNAME=lid_user \
SPRING_DATASOURCE_PASSWORD=lid_pass \
SPRING_MAIL_HOST="${SMTP_HOST}" \
SPRING_MAIL_PORT="${SMTP_PORT}" \
SPRING_MAIL_USERNAME="${SMTP_USERNAME}" \
SPRING_MAIL_PASSWORD="${SMTP_PASSWORD}" \
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH="${SMTP_AUTH}" \
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE="${SMTP_STARTTLS_ENABLE}" \
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_REQUIRED="${SMTP_STARTTLS_REQUIRED}" \
CONFIG_MAIL_FROM="${SMTP_FROM}" \
CONFIG_BACKOFFICE_MESSAGES_DEFAULT_RECIPIENTS="${BACKOFFICE_MESSAGES_DEFAULT_RECIPIENTS}" \
./mvnw spring-boot:run 
```



# A ne pas oublier 

- gestion du SameSite dans le cookie (confirmer cross domain ?)
- Reste la gestion des rôles



## Modèle physique de base de donnée pour le site de e-commerce LID.

```mermaid
classDiagram
  direction BT

  class ARTICLE {
    character varying(31) DTYPE
    character varying(13) EAN
    character varying(255) NAME
    integer PRICE
    double precision VAT
    character varying(255) IMG
    integer ID
  }

  class STOCK {
    integer ID
    integer ARTICLE_ID
    integer QUANTITY_AVAILABLE
    integer QUANTITY_RESERVED
    character varying(255) LOT
    date BESTBEFORE
  }

  class ARTICLE_CATEGORY {
    integer ARTICLE_ID
    integer CATEGORIES_ID
  }

  class CART {
    timestamp CREATEDAT
    integer CUSTOMER_ID
    integer ID
  }

  class CART_ARTICLE {
    integer CART_ID
    integer ARTICLES_ID
    integer QUANTITY
  }

  class CATEGORY {
    character varying(255) NAME
    integer ORDERIDX
    integer ID
  }

  class CUSTOMER {
    character varying(255) EMAIL
    character varying(255) FIRSTNAME
    character varying(255) LASTNAME
    character varying(255) PASSWORD
    integer ACTIVECART_ID
    character varying(255) LOGIN
    integer ID
  }

  class ORDER {
    integer AMOUNT
    timestamp CREATEDON
    tinyint CURRENTSTATUS
    timestamp DELIVERYDATE
    integer CUSTOMER_ID
    integer ID
  }

  class ORDER_ARTICLE {
    integer ORDER_ID
    integer ARTICLES_ID
    integer QUANTITY
    integer PRICE_AT_ORDER
  }

  class ORDER_STATUSHISTORY {
    integer ORDER_ID
    integer HISTORY_ID
  }

  class STATUSHISTORY {
    tinyint STATUS
    timestamp STATUSDATE
    integer ID
  }

  ARTICLE_CATEGORY --> "ARTICLE_ID:ID" ARTICLE
  ARTICLE_CATEGORY --> "CATEGORIES_ID:ID" CATEGORY

  STOCK --> "ARTICLE_ID:ID" ARTICLE

  CART --> "CUSTOMER_ID:ID" CUSTOMER
  CART_ARTICLE --> "ARTICLES_ID:ID" ARTICLE
  CART_ARTICLE --> "CART_ID:ID" CART

  CUSTOMER --> "ACTIVECART_ID:ID" CART

  ORDER_ARTICLE --> "ARTICLES_ID:ID" ARTICLE
  ORDER_ARTICLE --> "ORDER_ID:ID" ORDER

  ORDER_STATUSHISTORY --> "ORDER_ID:ID" ORDER
  ORDER_STATUSHISTORY --> "HISTORY_ID:ID" STATUSHISTORY
```

* Les identifiants sont numériques (int), et auto-générés.
* Article
  * Le champ `sku` est l'identifiant produit de l'article.
  * Le champ `ean13` est le code-barre de l'article.
  * `vat` est le taux de tva. (0.18 = 18% en CIV).
* Category
  * `orderIdx` est un entier qui permettra de trier les produits selon un ordre donné par l'administrateur.  
* Perishable
  * `lot` représente un texte permettant de dissocier les livraisons de produits frais.  
