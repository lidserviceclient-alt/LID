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

-- Returns / RMA (frontend return page)
CREATE TABLE IF NOT EXISTS `return_request` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `order_number` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `reason` VARCHAR(100) NOT NULL,
  `details` TEXT,
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
  `created_at` DATETIME(6),
  `created_by` VARCHAR(255),
  `updated_at` DATETIME(6),
  `updated_by` VARCHAR(255),
  PRIMARY KEY (`id`),
  KEY `idx_return_request_order_id` (`order_id`),
  KEY `idx_return_request_email` (`email`),
  KEY `idx_return_request_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `return_request_item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_request_id` BIGINT NOT NULL,
  `article_id` BIGINT NOT NULL,
  `article_name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(12,2),
  `created_at` DATETIME(6),
  `created_by` VARCHAR(255),
  `updated_at` DATETIME(6),
  `updated_by` VARCHAR(255),
  PRIMARY KEY (`id`),
  KEY `idx_return_item_request_id` (`return_request_id`),
  KEY `idx_return_item_article_id` (`article_id`),
  CONSTRAINT `fk_return_item_request`
    FOREIGN KEY (`return_request_id`)
    REFERENCES `return_request` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Marketing tables (backoffice marketing section)

-- Loyalty schema adjustments (Hibernate may not relax NOT NULL constraints reliably)
SET @fk_loyalty_tx_commande := (
  SELECT CONSTRAINT_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'loyalty_point_tx'
    AND COLUMN_NAME = 'commande_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);

SET @sql_drop_fk := IF(
  @fk_loyalty_tx_commande IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `loyalty_point_tx` DROP FOREIGN KEY `', @fk_loyalty_tx_commande, '`')
);
PREPARE stmt_drop_fk FROM @sql_drop_fk;
EXECUTE stmt_drop_fk;
DEALLOCATE PREPARE stmt_drop_fk;

ALTER TABLE `loyalty_point_tx`
  MODIFY COLUMN `commande_id` CHAR(36) NULL;

ALTER TABLE `loyalty_point_tx`
  ADD CONSTRAINT `fk_loyalty_tx_commande`
  FOREIGN KEY (`commande_id`) REFERENCES `commande` (`id`);
CREATE TABLE IF NOT EXISTS `marketing_campaign` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `audience` VARCHAR(20),
  `subject` VARCHAR(200),
  `content` TEXT,
  `scheduled_at` DATETIME(6),
  `sent_at` DATETIME(6),
  `sent_count` BIGINT NOT NULL DEFAULT 0,
  `target_count` BIGINT NOT NULL DEFAULT 0,
  `failed_count` BIGINT NOT NULL DEFAULT 0,
  `open_rate` DECIMAL(5,2),
  `click_rate` DECIMAL(5,2),
  `revenue` DECIMAL(12,2),
  `budget_spent` DECIMAL(12,2),
  `attempts` INT NOT NULL DEFAULT 0,
  `next_retry_at` DATETIME(6),
  `last_error` TEXT,
  `date_creation` DATETIME(6),
  PRIMARY KEY (`id`),
  KEY `idx_marketing_campaign_date_creation` (`date_creation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `marketing_campaign_delivery` (
  `id` CHAR(36) NOT NULL,
  `campaign_id` CHAR(36) NOT NULL,
  `channel` VARCHAR(20) NOT NULL,
  `recipient` VARCHAR(255) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `next_retry_at` DATETIME(6),
  `sent_at` DATETIME(6),
  `last_error` TEXT,
  `created_at` DATETIME(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_marketing_delivery_campaign_recipient` (`campaign_id`, `recipient`),
  KEY `idx_marketing_delivery_campaign_status` (`campaign_id`, `status`),
  KEY `idx_marketing_delivery_status_retry` (`status`, `next_retry_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `newsletter_subscriber` (
  `id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUBSCRIBED',
  `source` VARCHAR(20) DEFAULT 'UNKNOWN',
  `date_creation` DATETIME(6),
  `date_mise_a_jour` DATETIME(6),
  `date_desabonnement` DATETIME(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_newsletter_subscriber_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backoffice messages (email queue)
CREATE TABLE IF NOT EXISTS `backoffice_message` (
  `id` CHAR(36) NOT NULL,
  `subject` VARCHAR(200),
  `body` TEXT,
  `recipients` TEXT,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `attempts` INT NOT NULL DEFAULT 0,
  `last_error` TEXT,
  `next_retry_at` DATETIME(6),
  `sent_at` DATETIME(6),
  `created_at` DATETIME(6),
  `updated_at` DATETIME(6),
  `created_by` VARCHAR(200),
  PRIMARY KEY (`id`),
  KEY `idx_backoffice_message_status_retry` (`status`, `next_retry_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @article_desc_exists := (
  SELECT 1
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'article'
    AND COLUMN_NAME = 'description'
  LIMIT 1
);

SET @sql_alter_article_desc := IF(
  @article_desc_exists IS NULL,
  'SELECT 1',
  'ALTER TABLE `article` MODIFY COLUMN `description` LONGTEXT'
);
PREPARE stmt_alter_article_desc FROM @sql_alter_article_desc;
EXECUTE stmt_alter_article_desc;
DEALLOCATE PREPARE stmt_alter_article_desc;

SET @backoffice_message_table_exists := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
);

SET @backoffice_message_subject_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'subject'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_subject_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN subject VARCHAR(200)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_body_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'body'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_body_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN body TEXT',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_recipients_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'recipients'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_recipients_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN recipients TEXT',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_status_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'status'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_status_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''PENDING''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_attempts_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'attempts'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_attempts_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN attempts INT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_last_error_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'last_error'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_last_error_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN last_error TEXT',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_next_retry_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'next_retry_at'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_next_retry_at_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN next_retry_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_sent_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'sent_at'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_sent_at_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN sent_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_created_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'created_at'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_created_at_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN created_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_updated_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'updated_at'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_updated_at_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN updated_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backoffice_message_created_by_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'backoffice_message'
    AND column_name = 'created_by'
);
SET @sql := IF(
  @backoffice_message_table_exists = 1 AND @backoffice_message_created_by_exists = 0,
  'ALTER TABLE backoffice_message ADD COLUMN created_by VARCHAR(200)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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

-- Ensure retry attempts column exists for marketing (older dev DBs might miss it)
SET @marketing_campaign_table_exists := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
);

SET @marketing_campaign_attempts_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'attempts'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_attempts_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN attempts INT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_audience_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'audience'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_audience_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN audience VARCHAR(20) NOT NULL DEFAULT ''NEWSLETTER''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_content_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'content'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_content_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN content TEXT',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_subject_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'subject'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_subject_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN subject VARCHAR(200)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_scheduled_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'scheduled_at'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_scheduled_at_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN scheduled_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_sent_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'sent_at'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_sent_at_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN sent_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_sent_count_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'sent_count'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_sent_count_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN sent_count BIGINT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_target_count_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'target_count'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_target_count_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN target_count BIGINT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_failed_count_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'failed_count'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_failed_count_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN failed_count BIGINT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_open_rate_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'open_rate'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_open_rate_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN open_rate DECIMAL(5,2)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_click_rate_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'click_rate'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_click_rate_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN click_rate DECIMAL(5,2)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_revenue_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'revenue'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_revenue_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN revenue DECIMAL(12,2)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_budget_spent_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'budget_spent'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_budget_spent_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN budget_spent DECIMAL(12,2)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_next_retry_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'next_retry_at'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_next_retry_at_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN next_retry_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_last_error_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'last_error'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_last_error_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN last_error TEXT',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_date_creation_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'date_creation'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_date_creation_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN date_creation DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_name_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'name'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_name_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN name VARCHAR(200)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_type_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'type'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_type_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN type VARCHAR(20)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_status_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign'
    AND column_name = 'status'
);

SET @sql := IF(
  @marketing_campaign_table_exists = 1 AND @marketing_campaign_status_exists = 0,
  'ALTER TABLE marketing_campaign ADD COLUMN status VARCHAR(20)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_delivery_table_exists := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
);

SET @marketing_campaign_delivery_attempts_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
    AND column_name = 'attempts'
);

SET @sql := IF(
  @marketing_campaign_delivery_table_exists = 1 AND @marketing_campaign_delivery_attempts_exists = 0,
  'ALTER TABLE marketing_campaign_delivery ADD COLUMN attempts INT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_delivery_campaign_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
    AND column_name = 'campaign_id'
);

SET @sql := IF(
  @marketing_campaign_delivery_table_exists = 1 AND @marketing_campaign_delivery_campaign_id_exists = 0,
  'ALTER TABLE marketing_campaign_delivery ADD COLUMN campaign_id CHAR(36)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure newsletter subscribers table exists for marketing/newsletter (older dev DBs might miss it)
SET @newsletter_subscriber_table_exists := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'newsletter_subscriber'
);

SET @newsletter_subscriber_email_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'newsletter_subscriber'
    AND column_name = 'email'
);

SET @sql := IF(
  @newsletter_subscriber_table_exists = 1 AND @newsletter_subscriber_email_exists = 0,
  'ALTER TABLE newsletter_subscriber ADD COLUMN email VARCHAR(255) NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @newsletter_subscriber_status_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'newsletter_subscriber'
    AND column_name = 'status'
);

SET @sql := IF(
  @newsletter_subscriber_table_exists = 1 AND @newsletter_subscriber_status_exists = 0,
  'ALTER TABLE newsletter_subscriber ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''SUBSCRIBED''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @newsletter_subscriber_source_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'newsletter_subscriber'
    AND column_name = 'source'
);

SET @sql := IF(
  @newsletter_subscriber_table_exists = 1 AND @newsletter_subscriber_source_exists = 0,
  'ALTER TABLE newsletter_subscriber ADD COLUMN source VARCHAR(20)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @newsletter_subscriber_date_creation_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'newsletter_subscriber'
    AND column_name = 'date_creation'
);

SET @sql := IF(
  @newsletter_subscriber_table_exists = 1 AND @newsletter_subscriber_date_creation_exists = 0,
  'ALTER TABLE newsletter_subscriber ADD COLUMN date_creation DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @newsletter_subscriber_date_mise_a_jour_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'newsletter_subscriber'
    AND column_name = 'date_mise_a_jour'
);

SET @sql := IF(
  @newsletter_subscriber_table_exists = 1 AND @newsletter_subscriber_date_mise_a_jour_exists = 0,
  'ALTER TABLE newsletter_subscriber ADD COLUMN date_mise_a_jour DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @newsletter_subscriber_date_desabonnement_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'newsletter_subscriber'
    AND column_name = 'date_desabonnement'
);

SET @sql := IF(
  @newsletter_subscriber_table_exists = 1 AND @newsletter_subscriber_date_desabonnement_exists = 0,
  'ALTER TABLE newsletter_subscriber ADD COLUMN date_desabonnement DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_delivery_channel_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
    AND column_name = 'channel'
);

SET @sql := IF(
  @marketing_campaign_delivery_table_exists = 1 AND @marketing_campaign_delivery_channel_exists = 0,
  'ALTER TABLE marketing_campaign_delivery ADD COLUMN channel VARCHAR(20)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_delivery_recipient_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
    AND column_name = 'recipient'
);

SET @sql := IF(
  @marketing_campaign_delivery_table_exists = 1 AND @marketing_campaign_delivery_recipient_exists = 0,
  'ALTER TABLE marketing_campaign_delivery ADD COLUMN recipient VARCHAR(255)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_delivery_status_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
    AND column_name = 'status'
);

SET @sql := IF(
  @marketing_campaign_delivery_table_exists = 1 AND @marketing_campaign_delivery_status_exists = 0,
  'ALTER TABLE marketing_campaign_delivery ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''PENDING''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_delivery_next_retry_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
    AND column_name = 'next_retry_at'
);

SET @sql := IF(
  @marketing_campaign_delivery_table_exists = 1 AND @marketing_campaign_delivery_next_retry_at_exists = 0,
  'ALTER TABLE marketing_campaign_delivery ADD COLUMN next_retry_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_delivery_sent_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
    AND column_name = 'sent_at'
);

SET @sql := IF(
  @marketing_campaign_delivery_table_exists = 1 AND @marketing_campaign_delivery_sent_at_exists = 0,
  'ALTER TABLE marketing_campaign_delivery ADD COLUMN sent_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_delivery_last_error_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
    AND column_name = 'last_error'
);

SET @sql := IF(
  @marketing_campaign_delivery_table_exists = 1 AND @marketing_campaign_delivery_last_error_exists = 0,
  'ALTER TABLE marketing_campaign_delivery ADD COLUMN last_error TEXT',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @marketing_campaign_delivery_created_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'marketing_campaign_delivery'
    AND column_name = 'created_at'
);

SET @sql := IF(
  @marketing_campaign_delivery_table_exists = 1 AND @marketing_campaign_delivery_created_at_exists = 0,
  'ALTER TABLE marketing_campaign_delivery ADD COLUMN created_at DATETIME(6)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
