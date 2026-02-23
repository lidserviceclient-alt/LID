-- Local MySQL init script (safe to re-run)
-- Creates only the tables currently missing in dev DB.

CREATE TABLE IF NOT EXISTS `customer_address` (
  `id` CHAR(36) NOT NULL,
  `utilisateur_id` CHAR(36) NOT NULL,
  `type` VARCHAR(50),
  `name` VARCHAR(150),
  `address_line` VARCHAR(255),
  `city` VARCHAR(100),
  `postal_code` VARCHAR(20),
  `country` VARCHAR(100),
  `phone` VARCHAR(30),
  `is_default` TINYINT(1) DEFAULT 0,
  `date_creation` DATETIME(6),
  `date_mise_a_jour` DATETIME(6),
  PRIMARY KEY (`id`),
  KEY `idx_customer_address_utilisateur_id` (`utilisateur_id`),
  KEY `idx_customer_address_utilisateur_default` (`utilisateur_id`, `is_default`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `customer_id` VARCHAR(128) NOT NULL,
  `article_id` BIGINT NOT NULL,
  `created_at` DATETIME(6),
  `created_by` VARCHAR(255),
  `updated_at` DATETIME(6),
  `updated_by` VARCHAR(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wishlist_customer_article` (`customer_id`, `article_id`),
  KEY `idx_wishlist_customer_id` (`customer_id`),
  KEY `idx_wishlist_article_id` (`article_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `wishlist_product` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `customer_id` VARCHAR(128) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `created_at` DATETIME(6),
  `created_by` VARCHAR(255),
  `updated_at` DATETIME(6),
  `updated_by` VARCHAR(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wishlist_product_customer_product` (`customer_id`, `product_id`),
  KEY `idx_wishlist_product_customer_id` (`customer_id`),
  KEY `idx_wishlist_product_product_id` (`product_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `blog_post` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `excerpt` TEXT,
  `content` TEXT,
  `image_url` VARCHAR(512),
  `category` VARCHAR(100),
  `date` DATETIME(6),
  `author` VARCHAR(120),
  `featured` TINYINT(1) DEFAULT 0,
  `read_time` VARCHAR(50),
  PRIMARY KEY (`id`),
  KEY `idx_blog_post_date` (`date`),
  KEY `idx_blog_post_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ticket_event` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `date` DATETIME(6),
  `location` VARCHAR(200),
  `price` DECIMAL(12,2),
  `image_url` VARCHAR(512),
  `category` VARCHAR(100),
  `available` TINYINT(1) DEFAULT 1,
  `description` TEXT,
  PRIMARY KEY (`id`),
  KEY `idx_ticket_event_date` (`date`),
  KEY `idx_ticket_event_available` (`available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure featured flag exists on `categorie` (older dev DBs might miss it)
SET @categorie_table_exists := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'categorie'
);

SET @categorie_is_featured_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'categorie'
    AND column_name = 'is_featured'
);

SET @sql := IF(
  @categorie_table_exists = 1 AND @categorie_is_featured_exists = 0,
  'ALTER TABLE categorie ADD COLUMN is_featured BOOLEAN DEFAULT false',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure featured/best-seller flags exist on `produit` (older dev DBs might miss them)
SET @produit_table_exists := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'produit'
);

SET @mis_en_avant_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'produit'
    AND column_name = 'mis_en_avant'
);

SET @sql := IF(
  @produit_table_exists = 1 AND @mis_en_avant_exists = 0,
  'ALTER TABLE produit ADD COLUMN mis_en_avant BOOLEAN DEFAULT false',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @meilleur_vente_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'produit'
    AND column_name = 'meilleur_vente'
);

SET @sql := IF(
  @produit_table_exists = 1 AND @meilleur_vente_exists = 0,
  'ALTER TABLE produit ADD COLUMN meilleur_vente BOOLEAN DEFAULT false',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
