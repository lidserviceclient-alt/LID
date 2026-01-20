# lid-api
Life Event Distribution Api repository

# A ne pas oublier 

- gestion du SameSite dans le cookie (confirmer cross domain ?)
- est ce que 1 partner à 1 boutique ou plusieurs partners ont 1 boutique ? et qu'est ce qu'un partenaire peut faire (à part la gestion d'articles).
- Reste la gestion des rôles
- Lors de la création d'un partenaire, il faut que des mains catégories existent
- Comment se log un partenaire ?
- 



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
  * Le champ `ean13` est le code-barre de l'article.
  * `vat` est le taux de tva. (0.18 = 18% en CIV).
* Category
  * `orderIdx` est un entier qui permettra de trier les produits selon un ordre donné par l'administrateur.  
* Perishable
  * `lot` représente un texte permettant de dissocier les livraisons de produits frais.  

