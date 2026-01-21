-- MySQL schema for LID application (based on current JPA entities)
-- Assumes Spring's default physical naming strategy (camelCase -> snake_case).

CREATE DATABASE IF NOT EXISTS lid_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE lid_db;

-- Base user table (JOINED inheritance root)
CREATE TABLE IF NOT EXISTS user_entity (
  user_id VARCHAR(128) NOT NULL,
  last_name VARCHAR(255),
  first_name VARCHAR(255),
  email_verified BOOLEAN NOT NULL,
  email VARCHAR(255) NOT NULL,
  user_type VARCHAR(31),
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (user_id),
  INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- Customer (inherits user_entity)
CREATE TABLE IF NOT EXISTS customer (
  user_id VARCHAR(128) NOT NULL,
  avatar_url VARCHAR(255),
  PRIMARY KEY (user_id),
  CONSTRAINT fk_customer_user
    FOREIGN KEY (user_id) REFERENCES user_entity (user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Partner (inherits user_entity)
CREATE TABLE IF NOT EXISTS partner (
  user_id VARCHAR(128) NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255),
  shop_id BIGINT,
  head_office_address VARCHAR(500),
  city VARCHAR(100),
  country VARCHAR(100),
  business_registration_document_url VARCHAR(1000),
  registration_status VARCHAR(50) NOT NULL DEFAULT 'STEP_1_PENDING',
  PRIMARY KEY (user_id),
  UNIQUE KEY uk_partner_shop (shop_id),
  CONSTRAINT fk_partner_user
    FOREIGN KEY (user_id) REFERENCES user_entity (user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Category
CREATE TABLE IF NOT EXISTS category (
  id INT NOT NULL AUTO_INCREMENT,
  order_idx INT,
  name VARCHAR(255),
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uk_category_name (name)
) ENGINE=InnoDB;

-- Shop
CREATE TABLE IF NOT EXISTS shop (
  shop_id BIGINT NOT NULL AUTO_INCREMENT,
  shop_name VARCHAR(255) NOT NULL,
  main_category_id INT NOT NULL,
  shop_description VARCHAR(1000),
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (shop_id),
  CONSTRAINT fk_shop_main_category
    FOREIGN KEY (main_category_id) REFERENCES category (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Partner -> Shop FK (defined after shop)
ALTER TABLE partner
  ADD CONSTRAINT fk_partner_shop
  FOREIGN KEY (shop_id) REFERENCES shop (shop_id)
  ON DELETE SET NULL;

-- Article
CREATE TABLE IF NOT EXISTS article (
  id BIGINT NOT NULL AUTO_INCREMENT,
  reference_produit_partenaire VARCHAR(255) NOT NULL,
  ean VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  img VARCHAR(255),
  brand VARCHAR(255),
  price DOUBLE NOT NULL,
  vat FLOAT,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  reference_partner VARCHAR(255),
  discount_percent FLOAT,
  is_flash_sale BOOLEAN NOT NULL DEFAULT FALSE,
  flash_sale_ends_at DATETIME(6),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uk_article_reference_partner (reference_produit_partenaire),
  UNIQUE KEY uk_article_ean (ean)
) ENGINE=InnoDB;

-- Article <-> Category (many-to-many)
CREATE TABLE IF NOT EXISTS article_categories (
  article_id BIGINT NOT NULL,
  categories_id INT NOT NULL,
  PRIMARY KEY (article_id, categories_id),
  CONSTRAINT fk_article_categories_article
    FOREIGN KEY (article_id) REFERENCES article (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_article_categories_category
    FOREIGN KEY (categories_id) REFERENCES category (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Stock
CREATE TABLE IF NOT EXISTS stock (
  id BIGINT NOT NULL AUTO_INCREMENT,
  article_id BIGINT NOT NULL,
  quantity_available INT NOT NULL,
  quantity_reserved INT NOT NULL,
  lot VARCHAR(255),
  best_before DATE,
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_stock_article (article_id),
  CONSTRAINT fk_stock_article
    FOREIGN KEY (article_id) REFERENCES article (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cart
CREATE TABLE IF NOT EXISTS cart (
  id INT NOT NULL AUTO_INCREMENT,
  customer_id VARCHAR(128),
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_cart_customer (customer_id),
  CONSTRAINT fk_cart_customer
    FOREIGN KEY (customer_id) REFERENCES customer (user_id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- Cart article lines
CREATE TABLE IF NOT EXISTS cart_article (
  id INT NOT NULL AUTO_INCREMENT,
  cart_id INT NOT NULL,
  article_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price_at_added_time DOUBLE,
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_cart_article_cart (cart_id),
  INDEX idx_cart_article_article (article_id),
  CONSTRAINT fk_cart_article_cart
    FOREIGN KEY (cart_id) REFERENCES cart (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_article_article
    FOREIGN KEY (article_id) REFERENCES article (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id BIGINT NOT NULL AUTO_INCREMENT,
  customer_id VARCHAR(128) NOT NULL,
  article_id BIGINT NOT NULL,
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uk_wishlist_customer_article (customer_id, article_id),
  INDEX idx_wishlist_customer (customer_id),
  INDEX idx_wishlist_article (article_id),
  CONSTRAINT fk_wishlist_customer
    FOREIGN KEY (customer_id) REFERENCES customer (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_article
    FOREIGN KEY (article_id) REFERENCES article (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT NOT NULL AUTO_INCREMENT,
  customer_id VARCHAR(128) NOT NULL,
  amount DOUBLE NOT NULL,
  current_status VARCHAR(50) NOT NULL,
  delivery_date DATETIME(6),
  tracking_number VARCHAR(255),
  currency VARCHAR(3),
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_orders_customer (customer_id),
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customer (user_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Order articles
CREATE TABLE IF NOT EXISTS order_article (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT,
  article_id BIGINT,
  quantity INT,
  price_at_order DOUBLE,
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_order_article_order (order_id),
  INDEX idx_order_article_article (article_id),
  CONSTRAINT fk_order_article_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_article_article
    FOREIGN KEY (article_id) REFERENCES article (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- Order status history
CREATE TABLE IF NOT EXISTS status_history (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL,
  comment VARCHAR(255),
  changed_at DATETIME(6) NOT NULL,
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_status_history_order (order_id),
  CONSTRAINT fk_status_history_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Payments
CREATE TABLE IF NOT EXISTS payment (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT,
  invoice_token VARCHAR(255),
  amount DECIMAL(19,2),
  currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
  description TEXT,
  operator VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(255),
  receipt_url VARCHAR(255),
  return_url VARCHAR(255),
  cancel_url VARCHAR(255),
  payment_date DATETIME(6),
  failure_reason TEXT,
  transaction_id VARCHAR(255),
  paydunya_hash VARCHAR(255),
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_payment_order (order_id),
  CONSTRAINT fk_payment_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- Payment transactions (audit)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  payment_id BIGINT NOT NULL,
  transaction_type VARCHAR(255) NOT NULL,
  status_at_time VARCHAR(255),
  details TEXT,
  source VARCHAR(255),
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_payment_tx_payment (payment_id),
  CONSTRAINT fk_payment_tx_payment
    FOREIGN KEY (payment_id) REFERENCES payment (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id BIGINT NOT NULL AUTO_INCREMENT,
  payment_id BIGINT NOT NULL,
  amount DECIMAL(19,2),
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  processed_date DATETIME(6),
  refund_id VARCHAR(255),
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_refunds_payment (payment_id),
  CONSTRAINT fk_refunds_payment
    FOREIGN KEY (payment_id) REFERENCES payment (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_token (
  id CHAR(36) NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(6),
  created_by VARCHAR(255),
  updated_at DATETIME(6),
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_refresh_token_user (user_id)
) ENGINE=InnoDB;
