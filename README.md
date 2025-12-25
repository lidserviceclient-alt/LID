# lid-api
Life Event Distribution Api repository


# Conception : Modèle de données JPA pour le site de e-commerce LID.

## Modèle UML :

```mermaid
classDiagram
direction BT
class Article {
  - String img
  - int id
  - String ean
  - List~Category~ categories
  - int price
  - float vat
  - String name
}
class Cart {
  - Customer customer
  - int id
  - List~Article~ articles
  - Date createdOn
}
class Category {
  - String name
  - int orderIdx
  - int id
}
class Customer {
  - Cart activeCart
  - String lastName
  - String firstName
  - String email
  - String password
  - int id
  - String login
}
class Order {
  - Date deliveryDate
  - int amount
  - List~Article~ articles
  - Customer customer
  - Date createdOn
  - Status currentStatus
  - int id
  - List~StatusHistory~ history
}
class Perishable {
  - Date bestBefore
  - String lot
}
class Product
class Status {
<<enumeration>>
  +  READY_TO_DELIVER
  +  CANCELED
  +  DELIVERED
  +  ORDERED
  +  DELIVERY_IN_PROGRESS
}
class StatusHistory {
  - int id
  - Status status
  - Date statusDate
}

Article "1" *--> "categories *" Category 
Cart "1" *--> "articles *" Article 
Cart "1" *--> "customer 1" Customer 
Customer "1" *--> "activeCart 1" Cart 
Order "1" *--> "articles *" Article 
Order "1" *--> "customer 1" Customer 
Order "1" *--> "currentStatus 1" Status 
Order "1" *--> "history *" StatusHistory 
Perishable  -->  Article 
Product  -->  Article 
StatusHistory "1" *--> "status 1" Status 
```

## Modèle physique de base de donnée :

```mermaid
classDiagram
  direction BT
  class ARTICLE {
    character varying(31) DTYPE
    character varying(13) EAN
    character varying(255) NAME
    integer PRICE
    double precision VAT
    date BESTBEFORE
    character varying(255) LOT
    character varying(255) IMG
    integer ID
  }
  class ARTICLE_CATEGORY {
    integer ARTICLE_ID
    integer CATEGORIES_ID
  }
  class CART {
    timestamp CREATEDON
    integer CUSTOMER_ID
    integer ID
  }
  class CART_ARTICLE {
    integer CART_ID
    integer ARTICLES_ID
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
  class ORDERS {
    integer AMOUNT
    timestamp CREATEDON
    tinyint CURRENTSTATUS
    timestamp DELIVERYDATE
    integer CUSTOMER_ID
    integer ID
  }
  class ORDERS_ARTICLE {
    integer ORDER_ID
    integer ARTICLES_ID
  }
  class ORDERS_STATUSHISTORY {
    integer ORDER_ID
    integer HISTORY_ID
  }
  class ORDER_ARTICLE {
    integer ORDER_ID
    integer ARTICLES_ID
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

  ARTICLE_CATEGORY  --> "ARTICLE_ID:ID" ARTICLE
  ARTICLE_CATEGORY  -->  "CATEGORIES_ID:ID" CATEGORY
  CART  -->  "CUSTOMER_ID:ID" CUSTOMER
  CART_ARTICLE  -->  "ARTICLES_ID:ID" ARTICLE
  CART_ARTICLE  -->  "CART_ID:ID" CART
  CUSTOMER  -->  "ACTIVECART_ID:ID" CART
  ORDERS  -->  "CUSTOMER_ID:ID" CUSTOMER
  ORDERS_ARTICLE  -->  "ARTICLES_ID:ID" ARTICLE
  ORDERS_ARTICLE  -->  "ORDER_ID:ID" ORDERS
  ORDERS_STATUSHISTORY  -->  "ORDER_ID:ID" ORDERS
  ORDERS_STATUSHISTORY  -->  "HISTORY_ID:ID" STATUSHISTORY
  ORDER_ARTICLE  -->  "ARTICLES_ID:ID" ARTICLE
  ORDER_ARTICLE  -->  "ORDER_ID:ID" ORDERS
  ORDER_STATUSHISTORY  -->  "ORDER_ID:ID" ORDERS
  ORDER_STATUSHISTORY  -->  "HISTORY_ID:ID" STATUSHISTORY
```

* Les identifiants sont numériques (int), et auto-générés.
* Article
  * Le champ `ean13` est le code-barre de l'article, codé sur 13 caractères.
  * `vat` est le taux de tva. (0.20 = 20%).
* Category
  * `orderIdx` est un entier qui permettra de trier les produits selon un ordre donné par l'administrateur.  
* Perishable
  * `lot` représente un texte permettant de dissocier les livraisons de produits frais.  

