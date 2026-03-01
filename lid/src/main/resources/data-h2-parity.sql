-- ================================================
-- H2 LOCAL SEED - MASSIVE DATASET (compatible DDL)
-- SUPER_ADMIN: admin@lid.fr / admin (BCrypt stored)
-- ================================================

SET REFERENTIAL_INTEGRITY FALSE;
TRUNCATE TABLE marketing_campaign_delivery;
TRUNCATE TABLE email_message_recipient;
TRUNCATE TABLE return_request_item;
TRUNCATE TABLE order_article;
TRUNCATE TABLE stock;
TRUNCATE TABLE article_categories;
TRUNCATE TABLE authentication_roles;
TRUNCATE TABLE cart_article;
TRUNCATE TABLE cart;
TRUNCATE TABLE shipment;
TRUNCATE TABLE return_request;
TRUNCATE TABLE email_message;
TRUNCATE TABLE marketing_campaign;
TRUNCATE TABLE newsletter_subscriber;
TRUNCATE TABLE discount;
TRUNCATE TABLE blog_post;
TRUNCATE TABLE ticket_event;
TRUNCATE TABLE orders;
TRUNCATE TABLE article;
TRUNCATE TABLE partner;
TRUNCATE TABLE customer;
TRUNCATE TABLE authentication;
TRUNCATE TABLE shop;
TRUNCATE TABLE category;
TRUNCATE TABLE user_entity;
TRUNCATE TABLE security_activity;
TRUNCATE TABLE backoffice_social_link;
TRUNCATE TABLE backoffice_notification_preference;
TRUNCATE TABLE backoffice_free_shipping_rule;
TRUNCATE TABLE backoffice_shipping_method;
TRUNCATE TABLE backoffice_security_setting;
TRUNCATE TABLE backoffice_integration_setting;
TRUNCATE TABLE backoffice_app_config;
SET REFERENTIAL_INTEGRITY TRUE;

-- Categories
INSERT INTO category (id, name, level, order_idx, is_activated, slug, image_url, parent_slug, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'Electronique', 'PRINCIPALE', 1, TRUE, 'electronique', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'Mode', 'PRINCIPALE', 2, TRUE, 'mode', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'Maison', 'PRINCIPALE', 3, TRUE, 'maison', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'Telephones', 'SOUS_CATEGORIE', 1, TRUE, 'telephones', NULL, 'electronique', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'Ordinateurs', 'SOUS_CATEGORIE', 2, TRUE, 'ordinateurs', NULL, 'electronique', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 'Accessoires', 'SOUS_CATEGORIE', 3, TRUE, 'accessoires', NULL, 'electronique', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, 'Hommes', 'SOUS_CATEGORIE', 1, TRUE, 'hommes', NULL, 'mode', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, 'Femmes', 'SOUS_CATEGORIE', 2, TRUE, 'femmes', NULL, 'mode', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, 'Cuisine', 'SOUS_CATEGORIE', 1, TRUE, 'cuisine', NULL, 'maison', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, 'Decoration', 'SOUS_CATEGORIE', 2, TRUE, 'decoration', NULL, 'maison', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (11, 'Sport', 'PRINCIPALE', 4, TRUE, 'sport', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (12, 'Jeux', 'PRINCIPALE', 5, TRUE, 'jeux', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Shops
INSERT INTO shop (shop_id, shop_name, description, logo_url, background_url, status, main_category_id, shop_description, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'LID Tech', 'Boutique high-tech', 'https://picsum.photos/seed/shop-tech/200/200', 'https://picsum.photos/seed/shop-tech-bg/1200/400', 0, 1, 'High-tech & accessoires', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'LID Fashion', 'Boutique mode', 'https://picsum.photos/seed/shop-fashion/200/200', 'https://picsum.photos/seed/shop-fashion-bg/1200/400', 0, 2, 'Mode homme/femme', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'LID Home', 'Maison & deco', 'https://picsum.photos/seed/shop-home/200/200', 'https://picsum.photos/seed/shop-home-bg/1200/400', 0, 3, 'Maison, cuisine, déco', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'LID Sport', 'Sport & fitness', 'https://picsum.photos/seed/shop-sport/200/200', 'https://picsum.photos/seed/shop-sport-bg/1200/400', 0, 11, 'Sport & équipements', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'LID Games', 'Jeux & loisirs', 'https://picsum.photos/seed/shop-games/200/200', 'https://picsum.photos/seed/shop-games-bg/1200/400', 0, 12, 'Jeux, loisirs, cadeaux', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Users (admin + customers + partners + couriers)
INSERT INTO user_entity (user_id, user_type, first_name, last_name, email, email_verified, blocked, created_at, updated_at, created_by, updated_by) VALUES
  ('u-admin', 'UserEntity', 'Super', 'Admin', 'admin@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c01', 'CUSTOMER', 'John', 'Doe', 'john.doe@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c02', 'CUSTOMER', 'Awa', 'Kone', 'awa.kone@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c03', 'CUSTOMER', 'Ali', 'Traore', 'ali.traore@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c04', 'CUSTOMER', 'Mariam', 'Diallo', 'mariam.diallo@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c05', 'CUSTOMER', 'Kevin', 'Durand', 'kevin.durand@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c06', 'CUSTOMER', 'Sara', 'Morel', 'sara.morel@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c07', 'CUSTOMER', 'Nina', 'Martin', 'nina.martin@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c08', 'CUSTOMER', 'Lucas', 'Bernard', 'lucas.bernard@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c09', 'CUSTOMER', 'Emma', 'Petit', 'emma.petit@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c10', 'CUSTOMER', 'Yassine', 'Benali', 'yassine.benali@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c11', 'CUSTOMER', 'Ines', 'Lopez', 'ines.lopez@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c12', 'CUSTOMER', 'Paul', 'Roux', 'paul.roux@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c13', 'CUSTOMER', 'Lea', 'Garcia', 'lea.garcia@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c14', 'CUSTOMER', 'Oumar', 'Sow', 'oumar.sow@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c15', 'CUSTOMER', 'Fatou', 'Camara', 'fatou.camara@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p01', 'PARTNER', 'Tech', 'Partner', 'tech@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p02', 'PARTNER', 'Fashion', 'Partner', 'fashion@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p03', 'PARTNER', 'Home', 'Partner', 'home@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p04', 'PARTNER', 'Sport', 'Partner', 'sport@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p05', 'PARTNER', 'Games', 'Partner', 'games@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-l01', 'UserEntity', 'Ibrahima', 'Traore', 'livreur1@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-l02', 'UserEntity', 'Moussa', 'Konate', 'livreur2@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-l03', 'UserEntity', 'Kadiatou', 'Keita', 'livreur3@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Customers
INSERT INTO customer (user_id, avatar_url, phone_number, city, country) VALUES
  ('u-c01', NULL, '+225072867825', 'Abidjan', 'Cote d''Ivoire'),
  ('u-c02', NULL, '+225075614226', 'San Pedro', 'Cote d''Ivoire'),
  ('u-c03', NULL, '+225074744854', 'Bouake', 'Cote d''Ivoire'),
  ('u-c04', NULL, '+225072719583', 'Yamoussoukro', 'Cote d''Ivoire'),
  ('u-c05', NULL, '+225078078673', 'Abidjan', 'Cote d''Ivoire'),
  ('u-c06', NULL, '+225071499914', 'Yamoussoukro', 'Cote d''Ivoire'),
  ('u-c07', NULL, '+225074668136', 'San Pedro', 'Cote d''Ivoire'),
  ('u-c08', NULL, '+225079478454', 'Abidjan', 'Cote d''Ivoire'),
  ('u-c09', NULL, '+225074335942', 'Daloa', 'Cote d''Ivoire'),
  ('u-c10', NULL, '+225074698379', 'Grand-Bassam', 'Cote d''Ivoire'),
  ('u-c11', NULL, '+225075667265', 'Abidjan', 'Cote d''Ivoire'),
  ('u-c12', NULL, '+225073678638', 'Daloa', 'Cote d''Ivoire'),
  ('u-c13', NULL, '+225076708456', 'Korhogo', 'Cote d''Ivoire'),
  ('u-c14', NULL, '+225073608513', 'San Pedro', 'Cote d''Ivoire'),
  ('u-c15', NULL, '+225076647119', 'Yamoussoukro', 'Cote d''Ivoire');

-- Partners
INSERT INTO partner (user_id, phone_number, password_hash, shop_id, head_office_address, city, country, business_registration_document_url, registration_status) VALUES
  ('u-p01', '+225012556017', NULL, 1, 'Plateau', 'Daloa', 'Cote d''Ivoire', NULL, 'VERIFIED'),
  ('u-p02', '+225012622631', NULL, 2, 'Plateau', 'Man', 'Cote d''Ivoire', NULL, 'VERIFIED'),
  ('u-p03', '+225016770619', NULL, 3, 'Plateau', 'Korhogo', 'Cote d''Ivoire', NULL, 'VERIFIED'),
  ('u-p04', '+225011728977', NULL, 4, 'Plateau', 'Grand-Bassam', 'Cote d''Ivoire', NULL, 'VERIFIED'),
  ('u-p05', '+225019996414', NULL, 5, 'Plateau', 'Yamoussoukro', 'Cote d''Ivoire', NULL, 'VERIFIED');

-- Authentication (LOCAL) - password=admin for everyone in demo
INSERT INTO authentication (user_id, type, password_hash, created_at, updated_at, created_by, updated_by) VALUES
  ('u-admin', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c01', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c02', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c03', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c04', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c05', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c06', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c07', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c08', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c09', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c10', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c11', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c12', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c13', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c14', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-c15', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p01', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p02', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p03', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p04', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-p05', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-l01', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-l02', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('u-l03', 0, '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Roles: SUPER_ADMIN=0, ADMIN=1, LIVREUR=2, PARTNER=3, CUSTOMER=4
INSERT INTO authentication_roles (authentication_user_id, roles) VALUES
  ('u-admin', 0),
  ('u-admin', 1),
  ('u-c01', 4),
  ('u-c02', 4),
  ('u-c03', 4),
  ('u-c04', 4),
  ('u-c05', 4),
  ('u-c06', 4),
  ('u-c07', 4),
  ('u-c08', 4),
  ('u-c09', 4),
  ('u-c10', 4),
  ('u-c11', 4),
  ('u-c12', 4),
  ('u-c13', 4),
  ('u-c14', 4),
  ('u-c15', 4),
  ('u-p01', 3),
  ('u-p02', 3),
  ('u-p03', 3),
  ('u-p04', 3),
  ('u-p05', 3),
  ('u-l01', 2),
  ('u-l02', 2),
  ('u-l03', 2);

-- Articles (60)
INSERT INTO article (id, sku, ean, name, description, img, brand, price, vat, status, reference_partner, discount_percent, is_flash_sale, flash_sale_ends_at, is_featured, is_best_seller, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'SKU-PHONE-001', 'EAN-000001', 'Smartphone Zara 101', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article1/600/600', 'Zara', 129000, 18.0, 'ARCHIVED', 'u-p01', NULL, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'SKU-LAP-002', 'EAN-000002', 'Ordinateur Lenovo Pro 2', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article2/600/600', 'Lenovo', 399000, 18.0, 'ACTIVE', 'u-p02', 15.0, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'SKU-ACC-003', 'EAN-000003', 'Casque audio Anker 3', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article3/600/600', 'Anker', 15000, 18.0, 'ACTIVE', 'u-p03', NULL, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'SKU-MODE-H-004', 'EAN-000004', 'T-shirt Tefal Edition 4', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article4/600/600', 'Tefal', 30000, 18.0, 'ACTIVE', 'u-p04', NULL, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'SKU-MODE-F-005', 'EAN-000005', 'Robe Lenovo Collection 5', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article5/600/600', 'Lenovo', 85000, 18.0, 'ACTIVE', 'u-p05', 15.0, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 'SKU-HOME-006', 'EAN-000006', 'Article maison Philips 6', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article6/600/600', 'Philips', 25000, 18.0, 'ARCHIVED', 'u-p01', 15.0, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, 'SKU-PHONE-007', 'EAN-000007', 'Smartphone Tefal 107', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article7/600/600', 'Tefal', 399000, 18.0, 'ACTIVE', 'u-p02', 15.0, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, 'SKU-LAP-008', 'EAN-000008', 'Ordinateur Nike Pro 8', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article8/600/600', 'Nike', 299000, 18.0, 'ACTIVE', 'u-p03', NULL, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, 'SKU-ACC-009', 'EAN-000009', 'Casque audio Zara 9', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article9/600/600', 'Zara', 35000, 18.0, 'ACTIVE', 'u-p04', NULL, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, 'SKU-MODE-H-010', 'EAN-000010', 'T-shirt Decathlon Edition 10', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article10/600/600', 'Decathlon', 20000, 18.0, 'DRAFT', 'u-p05', NULL, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (11, 'SKU-MODE-F-011', 'EAN-000011', 'Robe Asus Collection 11', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article11/600/600', 'Asus', 85000, 18.0, 'ARCHIVED', 'u-p01', 10.0, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (12, 'SKU-HOME-012', 'EAN-000012', 'Article maison Bosch 12', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article12/600/600', 'Bosch', 180000, 18.0, 'ARCHIVED', 'u-p02', 5.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (13, 'SKU-PHONE-013', 'EAN-000013', 'Smartphone Nintendo 113', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article13/600/600', 'Nintendo', 499000, 18.0, 'ACTIVE', 'u-p03', NULL, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (14, 'SKU-LAP-014', 'EAN-000014', 'Ordinateur HP Pro 14', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article14/600/600', 'HP', 999000, 18.0, 'ARCHIVED', 'u-p04', NULL, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (15, 'SKU-ACC-015', 'EAN-000015', 'Casque audio Philips 15', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article15/600/600', 'Philips', 45000, 18.0, 'ARCHIVED', 'u-p05', NULL, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (16, 'SKU-MODE-H-016', 'EAN-000016', 'T-shirt Huawei Edition 16', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article16/600/600', 'Huawei', 30000, 18.0, 'ARCHIVED', 'u-p01', NULL, FALSE, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (17, 'SKU-MODE-F-017', 'EAN-000017', 'Robe Ikea Collection 17', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article17/600/600', 'Ikea', 25000, 18.0, 'DRAFT', 'u-p02', NULL, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (18, 'SKU-HOME-018', 'EAN-000018', 'Article maison Nintendo 18', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article18/600/600', 'Nintendo', 15000, 18.0, 'ACTIVE', 'u-p03', 15.0, FALSE, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (19, 'SKU-PHONE-019', 'EAN-000019', 'Smartphone HP 119', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article19/600/600', 'HP', 599000, 18.0, 'ARCHIVED', 'u-p04', NULL, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (20, 'SKU-LAP-020', 'EAN-000020', 'Ordinateur Huawei Pro 20', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article20/600/600', 'Huawei', 799000, 18.0, 'ACTIVE', 'u-p05', NULL, FALSE, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (21, 'SKU-ACC-021', 'EAN-000021', 'Casque audio Bosch 21', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article21/600/600', 'Bosch', 15000, 18.0, 'ACTIVE', 'u-p01', 15.0, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (22, 'SKU-MODE-H-022', 'EAN-000022', 'T-shirt Dell Edition 22', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article22/600/600', 'Dell', 12000, 18.0, 'DRAFT', 'u-p02', 10.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (23, 'SKU-MODE-F-023', 'EAN-000023', 'Robe Philips Collection 23', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article23/600/600', 'Philips', 45000, 18.0, 'ACTIVE', 'u-p03', 10.0, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (24, 'SKU-HOME-024', 'EAN-000024', 'Article maison Zara 24', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article24/600/600', 'Zara', 120000, 18.0, 'DRAFT', 'u-p04', 10.0, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (25, 'SKU-PHONE-025', 'EAN-000025', 'Smartphone Asus 125', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article25/600/600', 'Asus', 129000, 18.0, 'ACTIVE', 'u-p05', NULL, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (26, 'SKU-LAP-026', 'EAN-000026', 'Ordinateur Apple Pro 26', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article26/600/600', 'Apple', 399000, 18.0, 'ACTIVE', 'u-p01', NULL, FALSE, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (27, 'SKU-ACC-027', 'EAN-000027', 'Casque audio Xiaomi 27', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article27/600/600', 'Xiaomi', 65000, 18.0, 'ACTIVE', 'u-p02', NULL, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (28, 'SKU-MODE-H-028', 'EAN-000028', 'T-shirt Dell Edition 28', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article28/600/600', 'Dell', 30000, 18.0, 'ARCHIVED', 'u-p03', 10.0, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (29, 'SKU-MODE-F-029', 'EAN-000029', 'Robe Ikea Collection 29', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article29/600/600', 'Ikea', 25000, 18.0, 'ACTIVE', 'u-p04', NULL, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (30, 'SKU-HOME-030', 'EAN-000030', 'Article maison Ikea 30', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article30/600/600', 'Ikea', 250000, 18.0, 'ACTIVE', 'u-p05', 15.0, FALSE, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (31, 'SKU-PHONE-031', 'EAN-000031', 'Smartphone Zara 131', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article31/600/600', 'Zara', 299000, 18.0, 'ACTIVE', 'u-p01', NULL, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (32, 'SKU-LAP-032', 'EAN-000032', 'Ordinateur Tefal Pro 32', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article32/600/600', 'Tefal', 499000, 18.0, 'DRAFT', 'u-p02', NULL, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (33, 'SKU-ACC-033', 'EAN-000033', 'Casque audio Xiaomi 33', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article33/600/600', 'Xiaomi', 45000, 18.0, 'ARCHIVED', 'u-p03', NULL, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (34, 'SKU-MODE-H-034', 'EAN-000034', 'T-shirt Apple Edition 34', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article34/600/600', 'Apple', 8000, 18.0, 'ACTIVE', 'u-p04', NULL, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (35, 'SKU-MODE-F-035', 'EAN-000035', 'Robe Lenovo Collection 35', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article35/600/600', 'Lenovo', 45000, 18.0, 'ACTIVE', 'u-p05', NULL, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (36, 'SKU-HOME-036', 'EAN-000036', 'Article maison Sony 36', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article36/600/600', 'Sony', 250000, 18.0, 'ACTIVE', 'u-p01', 5.0, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (37, 'SKU-PHONE-037', 'EAN-000037', 'Smartphone Anker 137', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article37/600/600', 'Anker', 199000, 18.0, 'ACTIVE', 'u-p02', 10.0, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (38, 'SKU-LAP-038', 'EAN-000038', 'Ordinateur Samsung Pro 38', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article38/600/600', 'Samsung', 299000, 18.0, 'ARCHIVED', 'u-p03', 5.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (39, 'SKU-ACC-039', 'EAN-000039', 'Casque audio Xiaomi 39', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article39/600/600', 'Xiaomi', 25000, 18.0, 'ACTIVE', 'u-p04', 10.0, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (40, 'SKU-MODE-H-040', 'EAN-000040', 'T-shirt Zara Edition 40', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article40/600/600', 'Zara', 8000, 18.0, 'ARCHIVED', 'u-p05', NULL, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (41, 'SKU-MODE-F-041', 'EAN-000041', 'Robe Xiaomi Collection 41', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article41/600/600', 'Xiaomi', 45000, 18.0, 'ARCHIVED', 'u-p01', 10.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (42, 'SKU-HOME-042', 'EAN-000042', 'Article maison Nike 42', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article42/600/600', 'Nike', 45000, 18.0, 'ACTIVE', 'u-p02', 5.0, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (43, 'SKU-PHONE-043', 'EAN-000043', 'Smartphone Anker 143', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article43/600/600', 'Anker', 499000, 18.0, 'ACTIVE', 'u-p03', NULL, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (44, 'SKU-LAP-044', 'EAN-000044', 'Ordinateur Bosch Pro 44', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article44/600/600', 'Bosch', 399000, 18.0, 'ACTIVE', 'u-p04', 10.0, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (45, 'SKU-ACC-045', 'EAN-000045', 'Casque audio Dell 45', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article45/600/600', 'Dell', 35000, 18.0, 'ACTIVE', 'u-p05', NULL, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (46, 'SKU-MODE-H-046', 'EAN-000046', 'T-shirt Tefal Edition 46', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article46/600/600', 'Tefal', 25000, 18.0, 'ACTIVE', 'u-p01', 10.0, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (47, 'SKU-MODE-F-047', 'EAN-000047', 'Robe Anker Collection 47', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article47/600/600', 'Anker', 85000, 18.0, 'ACTIVE', 'u-p02', NULL, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (48, 'SKU-HOME-048', 'EAN-000048', 'Article maison Lego 48', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article48/600/600', 'Lego', 25000, 18.0, 'ACTIVE', 'u-p03', NULL, FALSE, NULL, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (49, 'SKU-PHONE-049', 'EAN-000049', 'Smartphone Lenovo 149', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article49/600/600', 'Lenovo', 249000, 18.0, 'ARCHIVED', 'u-p04', 5.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (50, 'SKU-LAP-050', 'EAN-000050', 'Ordinateur Ikea Pro 50', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article50/600/600', 'Ikea', 699000, 18.0, 'ACTIVE', 'u-p05', NULL, FALSE, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (51, 'SKU-ACC-051', 'EAN-000051', 'Casque audio Sony 51', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article51/600/600', 'Sony', 25000, 18.0, 'DRAFT', 'u-p01', 10.0, TRUE, DATEADD('DAY', 7, CURRENT_TIMESTAMP), TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (52, 'SKU-MODE-H-052', 'EAN-000052', 'T-shirt Huawei Edition 52', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article52/600/600', 'Huawei', 8000, 18.0, 'ACTIVE', 'u-p02', 10.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (53, 'SKU-MODE-F-053', 'EAN-000053', 'Robe Lego Collection 53', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article53/600/600', 'Lego', 25000, 18.0, 'DRAFT', 'u-p03', NULL, FALSE, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (54, 'SKU-HOME-054', 'EAN-000054', 'Article maison Samsung 54', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article54/600/600', 'Samsung', 120000, 18.0, 'ACTIVE', 'u-p04', 15.0, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (55, 'SKU-PHONE-055', 'EAN-000055', 'Smartphone Adidas 155', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article55/600/600', 'Adidas', 599000, 18.0, 'DRAFT', 'u-p05', 10.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (56, 'SKU-LAP-056', 'EAN-000056', 'Ordinateur HP Pro 56', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article56/600/600', 'HP', 999000, 18.0, 'ACTIVE', 'u-p01', NULL, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (57, 'SKU-ACC-057', 'EAN-000057', 'Casque audio Asus 57', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article57/600/600', 'Asus', 35000, 18.0, 'ACTIVE', 'u-p02', 15.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (58, 'SKU-MODE-H-058', 'EAN-000058', 'T-shirt Decathlon Edition 58', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article58/600/600', 'Decathlon', 12000, 18.0, 'ACTIVE', 'u-p03', 5.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (59, 'SKU-MODE-F-059', 'EAN-000059', 'Robe Asus Collection 59', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article59/600/600', 'Asus', 15000, 18.0, 'ACTIVE', 'u-p04', 5.0, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (60, 'SKU-HOME-060', 'EAN-000060', 'Article maison Sony 60', 'Produit de démonstration pour environnement local.', 'https://picsum.photos/seed/article60/600/600', 'Sony', 120000, 18.0, 'ARCHIVED', 'u-p05', 5.0, FALSE, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Article <-> Categories
INSERT INTO article_categories (article_id, categories_id) VALUES
  (1, 4),
  (2, 5),
  (3, 6),
  (4, 7),
  (5, 8),
  (6, 9),
  (7, 4),
  (8, 5),
  (9, 6),
  (10, 7),
  (11, 8),
  (12, 10),
  (13, 4),
  (14, 5),
  (15, 6),
  (16, 7),
  (17, 8),
  (18, 9),
  (19, 4),
  (20, 5),
  (21, 6),
  (22, 7),
  (23, 8),
  (24, 10),
  (25, 4),
  (26, 5),
  (27, 6),
  (28, 7),
  (29, 8),
  (30, 9),
  (31, 4),
  (32, 5),
  (33, 6),
  (34, 7),
  (35, 8),
  (36, 9),
  (37, 4),
  (38, 5),
  (39, 6),
  (40, 7),
  (41, 8),
  (42, 10),
  (43, 4),
  (44, 5),
  (45, 6),
  (46, 7),
  (47, 8),
  (48, 10),
  (49, 4),
  (50, 5),
  (51, 6),
  (52, 7),
  (53, 8),
  (54, 10),
  (55, 4),
  (56, 5),
  (57, 6),
  (58, 7),
  (59, 8),
  (60, 10);

-- Stock
INSERT INTO stock (id, article_id, quantity_available, quantity_reserved, lot, best_before, created_at, updated_at, created_by, updated_by) VALUES
  (1, 1, 165, 8, 'LOT-001', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 2, 39, 3, 'LOT-002', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 3, 240, 9, 'LOT-003', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 4, 58, 2, 'LOT-004', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 5, 21, 2, 'LOT-005', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 6, 121, 0, 'LOT-006', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, 7, 143, 8, 'LOT-007', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, 8, 185, 10, 'LOT-008', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, 9, 60, 2, 'LOT-009', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, 10, 120, 1, 'LOT-010', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (11, 11, 180, 5, 'LOT-011', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (12, 12, 169, 5, 'LOT-012', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (13, 13, 179, 1, 'LOT-013', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (14, 14, 194, 4, 'LOT-014', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (15, 15, 139, 4, 'LOT-015', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (16, 16, 180, 6, 'LOT-016', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (17, 17, 93, 6, 'LOT-017', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (18, 18, 188, 4, 'LOT-018', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (19, 19, 151, 2, 'LOT-019', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (20, 20, 59, 3, 'LOT-020', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (21, 21, 180, 6, 'LOT-021', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (22, 22, 183, 2, 'LOT-022', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (23, 23, 167, 9, 'LOT-023', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (24, 24, 87, 6, 'LOT-024', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (25, 25, 150, 0, 'LOT-025', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (26, 26, 87, 4, 'LOT-026', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (27, 27, 63, 3, 'LOT-027', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (28, 28, 211, 9, 'LOT-028', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (29, 29, 165, 10, 'LOT-029', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (30, 30, 92, 7, 'LOT-030', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (31, 31, 123, 7, 'LOT-031', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (32, 32, 182, 3, 'LOT-032', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (33, 33, 140, 7, 'LOT-033', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (34, 34, 213, 2, 'LOT-034', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (35, 35, 178, 1, 'LOT-035', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (36, 36, 82, 8, 'LOT-036', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (37, 37, 179, 10, 'LOT-037', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (38, 38, 168, 5, 'LOT-038', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (39, 39, 33, 1, 'LOT-039', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (40, 40, 182, 4, 'LOT-040', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (41, 41, 67, 6, 'LOT-041', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (42, 42, 60, 1, 'LOT-042', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (43, 43, 16, 0, 'LOT-043', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (44, 44, 72, 7, 'LOT-044', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (45, 45, 166, 1, 'LOT-045', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (46, 46, 126, 6, 'LOT-046', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (47, 47, 236, 10, 'LOT-047', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (48, 48, 157, 3, 'LOT-048', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (49, 49, 193, 6, 'LOT-049', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (50, 50, 136, 6, 'LOT-050', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (51, 51, 72, 2, 'LOT-051', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (52, 52, 177, 0, 'LOT-052', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (53, 53, 238, 1, 'LOT-053', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (54, 54, 209, 6, 'LOT-054', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (55, 55, 66, 1, 'LOT-055', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (56, 56, 215, 8, 'LOT-056', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (57, 57, 128, 0, 'LOT-057', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (58, 58, 152, 3, 'LOT-058', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (59, 59, 244, 1, 'LOT-059', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (60, 60, 126, 2, 'LOT-060', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Carts
INSERT INTO cart (id, customer_user_id, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'u-c01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'u-c02', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'u-c03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'u-c04', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'u-c05', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 'u-c06', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, 'u-c07', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, 'u-c08', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, 'u-c09', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, 'u-c10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Cart articles
INSERT INTO cart_article (id, cart_id, article_id, quantity, price_at_added_time, created_at, updated_at, created_by, updated_by) VALUES
  (1, 1, 43, 3, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 1, 36, 3, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 1, 21, 2, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 1, 40, 3, 8000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 1, 58, 3, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 2, 54, 3, 120000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, 2, 29, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, 2, 48, 2, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, 2, 29, 2, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, 2, 49, 1, 249000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (11, 3, 50, 3, 699000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (12, 3, 32, 3, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (13, 3, 16, 2, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (14, 3, 29, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (15, 4, 16, 2, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (16, 4, 22, 2, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (17, 4, 58, 3, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (18, 4, 6, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (19, 5, 15, 2, 45000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (20, 5, 45, 1, 35000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (21, 5, 46, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (22, 6, 27, 2, 65000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (23, 6, 22, 3, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (24, 7, 27, 1, 65000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (25, 7, 14, 2, 999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (26, 7, 25, 3, 129000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (27, 7, 45, 1, 35000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (28, 7, 55, 3, 599000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (29, 8, 31, 1, 299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (30, 8, 23, 2, 45000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (31, 8, 49, 2, 249000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (32, 8, 55, 2, 599000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (33, 8, 35, 3, 45000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (34, 9, 32, 1, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (35, 9, 18, 2, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (36, 9, 32, 1, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (37, 10, 22, 3, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (38, 10, 44, 2, 399000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (39, 10, 47, 1, 85000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (40, 10, 54, 2, 120000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (41, 10, 59, 1, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Orders (50)
INSERT INTO orders (id, customer_user_id, amount, currency, current_status, tracking_number, delivery_date, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'u-c10', 1501000, 'XOF', 'PENDING', 'TRK-0001', DATEADD('DAY', 4, CURRENT_TIMESTAMP), DATEADD('DAY', -25, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'u-c01', 569000, 'XOF', 'DELIVERY_IN_PROGRESS', 'TRK-0002', DATEADD('DAY', 1, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'u-c02', 75000, 'XOF', 'REFUNDED', 'TRK-0003', DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', 0, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'u-c06', 2097000, 'XOF', 'READY_TO_DELIVER', 'TRK-0004', DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'u-c01', 128000, 'XOF', 'READY_TO_DELIVER', 'TRK-0005', DATEADD('DAY', 0, CURRENT_TIMESTAMP), DATEADD('DAY', -26, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (6, 'u-c08', 800000, 'XOF', 'PAID', 'TRK-0006', DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -11, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (7, 'u-c10', 1098000, 'XOF', 'PAID', 'TRK-0007', DATEADD('DAY', 1, CURRENT_TIMESTAMP), DATEADD('DAY', -12, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (8, 'u-c11', 415000, 'XOF', 'CANCELED', 'TRK-0008', DATEADD('DAY', 1, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (9, 'u-c11', 135000, 'XOF', 'PAID', 'TRK-0009', DATEADD('DAY', 3, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (10, 'u-c06', 1106000, 'XOF', 'PAID', 'TRK-0010', DATEADD('DAY', 2, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (11, 'u-c15', 285000, 'XOF', 'REFUNDED', 'TRK-0011', DATEADD('DAY', 7, CURRENT_TIMESTAMP), DATEADD('DAY', -22, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (12, 'u-c10', 823000, 'XOF', 'REFUNDED', 'TRK-0012', DATEADD('DAY', 1, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (13, 'u-c08', 2605000, 'XOF', 'READY_TO_DELIVER', 'TRK-0013', DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -15, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (14, 'u-c04', 199000, 'XOF', 'DELIVERED', 'TRK-0014', DATEADD('DAY', 5, CURRENT_TIMESTAMP), DATEADD('DAY', -30, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (15, 'u-c09', 90000, 'XOF', 'READY_TO_DELIVER', 'TRK-0015', DATEADD('DAY', 3, CURRENT_TIMESTAMP), DATEADD('DAY', -15, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (16, 'u-c09', 1208000, 'XOF', 'READY_TO_DELIVER', 'TRK-0016', DATEADD('DAY', 0, CURRENT_TIMESTAMP), DATEADD('DAY', -18, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (17, 'u-c12', 2487000, 'XOF', 'READY_TO_DELIVER', 'TRK-0017', DATEADD('DAY', 2, CURRENT_TIMESTAMP), DATEADD('DAY', -17, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (18, 'u-c12', 125000, 'XOF', 'DELIVERED', 'TRK-0018', DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (19, 'u-c04', 75000, 'XOF', 'DELIVERED', 'TRK-0019', DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -24, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (20, 'u-c04', 1052000, 'XOF', 'REFUNDED', 'TRK-0020', DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (21, 'u-c04', 919000, 'XOF', 'DELIVERY_IN_PROGRESS', 'TRK-0021', DATEADD('DAY', 5, CURRENT_TIMESTAMP), DATEADD('DAY', -26, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (22, 'u-c05', 500000, 'XOF', 'PENDING', 'TRK-0022', DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (23, 'u-c14', 999000, 'XOF', 'REFUNDED', 'TRK-0023', DATEADD('DAY', 6, CURRENT_TIMESTAMP), DATEADD('DAY', -21, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (24, 'u-c08', 2369000, 'XOF', 'REFUNDED', 'TRK-0024', DATEADD('DAY', 3, CURRENT_TIMESTAMP), DATEADD('DAY', -15, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (25, 'u-c02', 859000, 'XOF', 'PENDING', 'TRK-0025', DATEADD('DAY', 0, CURRENT_TIMESTAMP), DATEADD('DAY', -27, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (26, 'u-c09', 2355000, 'XOF', 'CANCELED', 'TRK-0026', DATEADD('DAY', 4, CURRENT_TIMESTAMP), DATEADD('DAY', -21, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (27, 'u-c14', 712000, 'XOF', 'CANCELED', 'TRK-0027', DATEADD('DAY', 0, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (28, 'u-c04', 85000, 'XOF', 'DELIVERY_IN_PROGRESS', 'TRK-0028', DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (29, 'u-c02', 130000, 'XOF', 'PROCESSING', 'TRK-0029', DATEADD('DAY', 6, CURRENT_TIMESTAMP), DATEADD('DAY', -15, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (30, 'u-c05', 3594000, 'XOF', 'PENDING', 'TRK-0030', DATEADD('DAY', 4, CURRENT_TIMESTAMP), DATEADD('DAY', -28, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (31, 'u-c11', 980000, 'XOF', 'READY_TO_DELIVER', 'TRK-0031', DATEADD('DAY', 3, CURRENT_TIMESTAMP), DATEADD('DAY', -27, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (32, 'u-c09', 55000, 'XOF', 'READY_TO_DELIVER', 'TRK-0032', DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -29, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (33, 'u-c03', 3172000, 'XOF', 'DELIVERY_IN_PROGRESS', 'TRK-0033', DATEADD('DAY', 3, CURRENT_TIMESTAMP), DATEADD('DAY', 0, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (34, 'u-c05', 205000, 'XOF', 'REFUNDED', 'TRK-0034', DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -28, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (35, 'u-c04', 1345000, 'XOF', 'PENDING', 'TRK-0035', DATEADD('DAY', 7, CURRENT_TIMESTAMP), DATEADD('DAY', -16, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (36, 'u-c15', 688000, 'XOF', 'DELIVERY_IN_PROGRESS', 'TRK-0036', DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -15, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (37, 'u-c06', 468000, 'XOF', 'CANCELED', 'TRK-0037', DATEADD('DAY', 4, CURRENT_TIMESTAMP), DATEADD('DAY', -21, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (38, 'u-c11', 250000, 'XOF', 'CANCELED', 'TRK-0038', DATEADD('DAY', 2, CURRENT_TIMESTAMP), DATEADD('DAY', -22, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (39, 'u-c06', 5019000, 'XOF', 'PAID', 'TRK-0039', DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -24, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (40, 'u-c09', 2587000, 'XOF', 'DELIVERED', 'TRK-0040', DATEADD('DAY', 1, CURRENT_TIMESTAMP), DATEADD('DAY', -16, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (41, 'u-c15', 1197000, 'XOF', 'REFUNDED', 'TRK-0041', DATEADD('DAY', 6, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (42, 'u-c04', 775000, 'XOF', 'PROCESSING', 'TRK-0042', DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -16, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (43, 'u-c02', 2337000, 'XOF', 'PROCESSING', 'TRK-0043', DATEADD('DAY', 4, CURRENT_TIMESTAMP), DATEADD('DAY', -23, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (44, 'u-c08', 2666000, 'XOF', 'PROCESSING', 'TRK-0044', DATEADD('DAY', 1, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (45, 'u-c13', 2172000, 'XOF', 'CANCELED', 'TRK-0045', DATEADD('DAY', 1, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (46, 'u-c10', 673000, 'XOF', 'REFUNDED', 'TRK-0046', DATEADD('DAY', 2, CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (47, 'u-c13', 1672000, 'XOF', 'CANCELED', 'TRK-0047', DATEADD('DAY', 0, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (48, 'u-c13', 45000, 'XOF', 'CANCELED', 'TRK-0048', DATEADD('DAY', 4, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (49, 'u-c15', 1687000, 'XOF', 'CANCELED', 'TRK-0049', DATEADD('DAY', 2, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL),
  (50, 'u-c02', 16000, 'XOF', 'REFUNDED', 'TRK-0050', DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL);

-- Order articles
INSERT INTO order_article (id, order_id, article_id, quantity, price_at_order, created_at, updated_at, created_by, updated_by) VALUES
  (1, 1, 38, 3, 299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 1, 43, 1, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 1, 6, 3, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 1, 28, 1, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 2, 21, 1, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 2, 30, 2, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, 2, 22, 2, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, 2, 18, 2, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, 3, 48, 3, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, 4, 50, 3, 699000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (11, 5, 54, 1, 120000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (12, 5, 40, 1, 8000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (13, 6, 30, 3, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (14, 6, 17, 2, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (15, 7, 20, 1, 799000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (16, 7, 38, 1, 299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (17, 8, 46, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (18, 8, 5, 3, 85000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (19, 8, 45, 3, 35000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (20, 8, 16, 1, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (21, 9, 23, 3, 45000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (22, 10, 1, 2, 129000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (23, 10, 53, 2, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (24, 10, 7, 2, 399000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (25, 11, 28, 1, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (26, 11, 47, 3, 85000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (27, 12, 28, 3, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (28, 12, 38, 2, 299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (29, 12, 21, 1, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (30, 12, 54, 1, 120000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (31, 13, 37, 3, 199000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (32, 13, 43, 2, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (33, 13, 22, 1, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (34, 13, 32, 2, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (35, 14, 22, 2, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (36, 14, 57, 3, 35000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (37, 14, 45, 2, 35000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (38, 15, 16, 3, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (39, 16, 42, 3, 45000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (40, 16, 32, 2, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (41, 16, 51, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (42, 16, 6, 2, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (43, 17, 43, 3, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (44, 17, 24, 2, 120000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (45, 17, 36, 3, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (46, 18, 45, 2, 35000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (47, 18, 18, 2, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (48, 18, 17, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (49, 19, 48, 3, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (50, 20, 47, 3, 85000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (51, 20, 49, 3, 249000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (52, 20, 39, 2, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (53, 21, 24, 1, 120000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (54, 21, 20, 1, 799000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (55, 22, 36, 2, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (56, 23, 56, 1, 999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (57, 24, 22, 1, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (58, 24, 4, 2, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (59, 24, 56, 2, 999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (60, 24, 8, 1, 299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (61, 25, 10, 3, 20000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (62, 25, 20, 1, 799000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (63, 26, 50, 3, 699000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (64, 26, 25, 2, 129000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (65, 27, 37, 3, 199000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (66, 27, 4, 3, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (67, 27, 48, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (68, 28, 11, 1, 85000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (69, 29, 27, 2, 65000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (70, 30, 19, 3, 599000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (71, 30, 19, 3, 599000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (72, 31, 51, 3, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (73, 31, 38, 3, 299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (74, 31, 52, 1, 8000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (75, 32, 59, 2, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (76, 32, 53, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (77, 33, 29, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (78, 33, 30, 3, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (79, 33, 20, 3, 799000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (80, 34, 6, 3, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (81, 34, 3, 2, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (82, 34, 48, 2, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (83, 34, 39, 2, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (84, 35, 37, 1, 199000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (85, 35, 49, 1, 249000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (86, 35, 31, 3, 299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (87, 36, 38, 2, 299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (88, 36, 41, 2, 45000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (89, 37, 21, 3, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (90, 37, 7, 1, 399000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (91, 37, 22, 2, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (92, 38, 30, 1, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (93, 39, 56, 3, 999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (94, 39, 53, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (95, 39, 43, 3, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (96, 39, 30, 2, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (97, 40, 41, 2, 45000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (98, 40, 49, 1, 249000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (99, 40, 14, 2, 999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (100, 40, 36, 1, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (101, 41, 2, 3, 399000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (102, 42, 36, 1, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (103, 42, 36, 2, 250000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (104, 42, 6, 1, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (105, 43, 60, 3, 120000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (106, 43, 19, 3, 599000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (107, 43, 46, 2, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (108, 43, 27, 2, 65000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (109, 44, 13, 3, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (110, 44, 33, 3, 45000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (111, 44, 57, 1, 35000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (112, 44, 56, 1, 999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (113, 45, 60, 3, 120000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (114, 45, 18, 1, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (115, 45, 19, 3, 599000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (116, 46, 29, 3, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (117, 46, 31, 2, 299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (118, 47, 60, 2, 120000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (119, 47, 56, 1, 999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (120, 47, 45, 1, 35000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (121, 47, 37, 2, 199000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (122, 48, 21, 3, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (123, 49, 43, 3, 499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (124, 49, 10, 2, 20000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (125, 49, 3, 1, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (126, 49, 33, 3, 45000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (127, 50, 34, 2, 8000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Shipments
INSERT INTO shipment (id, order_id, carrier, tracking_id, status, eta, cost, courier_reference, courier_name, courier_phone, courier_user, scanned_at, delivery_code, delivery_code_generated_at, delivered_at, created_at, updated_at, created_by, updated_by) VALUES
  (1, '2', 'DHL', 'TRK-DHL-0002', 'EN_COURS', DATEADD('DAY', 0, CURRENT_DATE), 3000, 'CR-0001', 'Ibrahima', '+225056878299', 'u-l01', DATEADD('HOUR', -10, CURRENT_TIMESTAMP), '5342', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, '4', 'DHL', 'TRK-DHL-0004', 'EN_PREPARATION', DATEADD('DAY', -1, CURRENT_DATE), 3500, 'CR-0002', 'Moussa', '+225056668663', 'u-l02', DATEADD('HOUR', -43, CURRENT_TIMESTAMP), '7226', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, '5', 'DHL', 'TRK-DHL-0005', 'EN_PREPARATION', DATEADD('DAY', 3, CURRENT_DATE), 3500, 'CR-0003', 'Moussa', '+225058186400', 'u-l02', DATEADD('HOUR', -5, CURRENT_TIMESTAMP), '2121', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, '13', 'DHL', 'TRK-DHL-0013', 'EN_PREPARATION', DATEADD('DAY', 0, CURRENT_DATE), 3000, 'CR-0004', 'Ibrahima', '+225054821419', 'u-l01', DATEADD('HOUR', -12, CURRENT_TIMESTAMP), '2612', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, '14', 'DHL', 'TRK-DHL-0014', 'LIVREE', DATEADD('DAY', 2, CURRENT_DATE), 1500, 'CR-0005', 'Kadiatou', '+225051686231', 'u-l03', DATEADD('HOUR', -39, CURRENT_TIMESTAMP), '1753', CURRENT_TIMESTAMP, DATEADD('DAY', -1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, '15', 'DHL', 'TRK-DHL-0015', 'EN_PREPARATION', DATEADD('DAY', 1, CURRENT_DATE), 2500, 'CR-0006', 'Moussa', '+225050941524', 'u-l02', DATEADD('HOUR', -46, CURRENT_TIMESTAMP), '8056', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, '16', 'DHL', 'TRK-DHL-0016', 'EN_PREPARATION', DATEADD('DAY', 3, CURRENT_DATE), 3500, 'CR-0007', 'Ibrahima', '+225054096953', 'u-l01', DATEADD('HOUR', -53, CURRENT_TIMESTAMP), '3950', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, '17', 'DHL', 'TRK-DHL-0017', 'EN_PREPARATION', DATEADD('DAY', -1, CURRENT_DATE), 3500, 'CR-0008', 'Ibrahima', '+225052937176', 'u-l01', DATEADD('HOUR', -49, CURRENT_TIMESTAMP), '4945', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, '18', 'DHL', 'TRK-DHL-0018', 'LIVREE', DATEADD('DAY', 0, CURRENT_DATE), 2500, 'CR-0009', 'Moussa', '+225059783753', 'u-l02', DATEADD('HOUR', -60, CURRENT_TIMESTAMP), '8529', CURRENT_TIMESTAMP, DATEADD('DAY', -1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, '19', 'DHL', 'TRK-DHL-0019', 'LIVREE', DATEADD('DAY', 2, CURRENT_DATE), 2000, 'CR-0010', 'Moussa', '+225050157662', 'u-l02', DATEADD('HOUR', -70, CURRENT_TIMESTAMP), '2210', CURRENT_TIMESTAMP, DATEADD('DAY', -2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (11, '21', 'DHL', 'TRK-DHL-0021', 'EN_COURS', DATEADD('DAY', 3, CURRENT_DATE), 3000, 'CR-0011', 'Moussa', '+225055797629', 'u-l02', DATEADD('HOUR', -39, CURRENT_TIMESTAMP), '5097', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (12, '28', 'DHL', 'TRK-DHL-0028', 'EN_COURS', DATEADD('DAY', 0, CURRENT_DATE), 3000, 'CR-0012', 'Moussa', '+225055068760', 'u-l02', DATEADD('HOUR', -50, CURRENT_TIMESTAMP), '2747', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (13, '31', 'DHL', 'TRK-DHL-0031', 'EN_PREPARATION', DATEADD('DAY', 3, CURRENT_DATE), 3500, 'CR-0013', 'Ibrahima', '+225056398231', 'u-l01', DATEADD('HOUR', -46, CURRENT_TIMESTAMP), '5847', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (14, '32', 'DHL', 'TRK-DHL-0032', 'EN_PREPARATION', DATEADD('DAY', -1, CURRENT_DATE), 2500, 'CR-0014', 'Kadiatou', '+225054953150', 'u-l03', DATEADD('HOUR', -51, CURRENT_TIMESTAMP), '1132', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (15, '33', 'DHL', 'TRK-DHL-0033', 'EN_COURS', DATEADD('DAY', 3, CURRENT_DATE), 2500, 'CR-0015', 'Kadiatou', '+225050822825', 'u-l03', DATEADD('HOUR', -64, CURRENT_TIMESTAMP), '4770', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (16, '36', 'DHL', 'TRK-DHL-0036', 'EN_COURS', DATEADD('DAY', 0, CURRENT_DATE), 3500, 'CR-0016', 'Kadiatou', '+225055910964', 'u-l03', DATEADD('HOUR', -25, CURRENT_TIMESTAMP), '5106', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (17, '40', 'DHL', 'TRK-DHL-0040', 'LIVREE', DATEADD('DAY', -1, CURRENT_DATE), 2500, 'CR-0017', 'Kadiatou', '+225052294774', 'u-l03', DATEADD('HOUR', -6, CURRENT_TIMESTAMP), '8222', CURRENT_TIMESTAMP, DATEADD('DAY', -5, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Return requests
INSERT INTO return_request (id, order_id, order_number, email, reason, details, status, created_at, updated_at, created_by, updated_by) VALUES
  (1, 14, 'cmd-0014', 'mariam.diallo@lid.fr', 'Ne convient pas', 'Demande générée pour dataset local.', 'REJECTED', DATEADD('DAY', -2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, NULL, NULL);

-- Return request items
INSERT INTO return_request_item (id, return_request_id, article_id, article_name, quantity, unit_price, created_at, updated_at, created_by, updated_by) VALUES
  (1, 1, 22, 'T-shirt Dell Edition 22', 1, 12000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Discounts
INSERT INTO discount (id, code, description, type, target, target_id, min_order_amount, start_at, end_at, is_active, usage_max, usage_max_per_user, usage_count, discount_value, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'WELCOME10', 'Réduction de bienvenue', 'PERCENTAGE', 'GLOBAL', NULL, 100000, DATEADD('DAY', -30, CURRENT_TIMESTAMP), DATEADD('DAY', 90, CURRENT_TIMESTAMP), TRUE, 1000, 1, 120, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'SHOP5', 'Réduction boutique', 'PERCENTAGE', 'BOUTIQUE', '1', 50000, DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', 45, CURRENT_TIMESTAMP), TRUE, 5000, 3, 340, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'FREESHIP', 'Livraison offerte', 'FIXED', 'GLOBAL', NULL, 50000, DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', 20, CURRENT_TIMESTAMP), TRUE, 2000, 2, 210, 2500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'FLASH15', 'Promo flash', 'PERCENTAGE', 'GLOBAL', NULL, 0, DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', 2, CURRENT_TIMESTAMP), TRUE, 500, 1, 33, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'VIP20', 'Réduction VIP', 'PERCENTAGE', 'UTILISATEUR', 'u-c01', 0, DATEADD('DAY', -60, CURRENT_TIMESTAMP), DATEADD('DAY', 60, CURRENT_TIMESTAMP), TRUE, 50, 10, 12, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 'HOME7', 'Maison -7%', 'PERCENTAGE', 'BOUTIQUE', '3', 30000, DATEADD('DAY', -15, CURRENT_TIMESTAMP), DATEADD('DAY', 30, CURRENT_TIMESTAMP), TRUE, 800, 2, 55, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Blog posts
INSERT INTO blog_post (id, title, excerpt, content, image_url, category, published_at, author, featured, read_time, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'Article Blog #1', 'Aperçu de l''article', 'Contenu long de démonstration (post 1).', 'https://picsum.photos/seed/blog1/1200/600', 'Conseils', DATEADD('DAY', -9, CURRENT_TIMESTAMP), 'Equipe LID', TRUE, '7 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'Article Blog #2', 'Aperçu de l''article', 'Contenu long de démonstration (post 2).', 'https://picsum.photos/seed/blog2/1200/600', 'Maison', DATEADD('DAY', -18, CURRENT_TIMESTAMP), 'Admin', TRUE, '5 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'Article Blog #3', 'Aperçu de l''article', 'Contenu long de démonstration (post 3).', 'https://picsum.photos/seed/blog3/1200/600', 'Mode', DATEADD('DAY', -19, CURRENT_TIMESTAMP), 'Equipe LID', TRUE, '9 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'Article Blog #4', 'Aperçu de l''article', 'Contenu long de démonstration (post 4).', 'https://picsum.photos/seed/blog4/1200/600', 'E-commerce', DATEADD('DAY', -30, CURRENT_TIMESTAMP), 'Admin', FALSE, '4 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'Article Blog #5', 'Aperçu de l''article', 'Contenu long de démonstration (post 5).', 'https://picsum.photos/seed/blog5/1200/600', 'Conseils', DATEADD('DAY', -26, CURRENT_TIMESTAMP), 'Equipe LID', FALSE, '3 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 'Article Blog #6', 'Aperçu de l''article', 'Contenu long de démonstration (post 6).', 'https://picsum.photos/seed/blog6/1200/600', 'Mode', DATEADD('DAY', -1, CURRENT_TIMESTAMP), 'Equipe LID', FALSE, '7 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, 'Article Blog #7', 'Aperçu de l''article', 'Contenu long de démonstration (post 7).', 'https://picsum.photos/seed/blog7/1200/600', 'E-commerce', DATEADD('DAY', -30, CURRENT_TIMESTAMP), 'Equipe LID', FALSE, '8 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, 'Article Blog #8', 'Aperçu de l''article', 'Contenu long de démonstration (post 8).', 'https://picsum.photos/seed/blog8/1200/600', 'Tech', DATEADD('DAY', -38, CURRENT_TIMESTAMP), 'Equipe LID', FALSE, '9 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, 'Article Blog #9', 'Aperçu de l''article', 'Contenu long de démonstration (post 9).', 'https://picsum.photos/seed/blog9/1200/600', 'Tech', DATEADD('DAY', -7, CURRENT_TIMESTAMP), 'Admin', FALSE, '6 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, 'Article Blog #10', 'Aperçu de l''article', 'Contenu long de démonstration (post 10).', 'https://picsum.photos/seed/blog10/1200/600', 'E-commerce', DATEADD('DAY', -40, CURRENT_TIMESTAMP), 'Equipe LID', FALSE, '7 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Ticket events
INSERT INTO ticket_event (id, title, event_date, location, price, image_url, category, available, description, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'Event LID #1', DATEADD('DAY', 17, CURRENT_TIMESTAMP), 'Abidjan', 25000, 'https://picsum.photos/seed/event1/1200/600', 'Culture', TRUE, 'Événement de démonstration pour dataset local.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'Event LID #2', DATEADD('DAY', 44, CURRENT_TIMESTAMP), 'Grand-Bassam', 5000, 'https://picsum.photos/seed/event2/1200/600', 'Business', TRUE, 'Événement de démonstration pour dataset local.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'Event LID #3', DATEADD('DAY', 5, CURRENT_TIMESTAMP), 'Abidjan', 15000, 'https://picsum.photos/seed/event3/1200/600', 'Sport', TRUE, 'Événement de démonstration pour dataset local.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'Event LID #4', DATEADD('DAY', 10, CURRENT_TIMESTAMP), 'Abidjan', 10000, 'https://picsum.photos/seed/event4/1200/600', 'Business', TRUE, 'Événement de démonstration pour dataset local.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'Event LID #5', DATEADD('DAY', 27, CURRENT_TIMESTAMP), 'Grand-Bassam', 15000, 'https://picsum.photos/seed/event5/1200/600', 'Sport', TRUE, 'Événement de démonstration pour dataset local.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 'Event LID #6', DATEADD('DAY', 40, CURRENT_TIMESTAMP), 'Yamoussoukro', 25000, 'https://picsum.photos/seed/event6/1200/600', 'Tech', TRUE, 'Événement de démonstration pour dataset local.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, 'Event LID #7', DATEADD('DAY', 56, CURRENT_TIMESTAMP), 'Grand-Bassam', 35000, 'https://picsum.photos/seed/event7/1200/600', 'Sport', TRUE, 'Événement de démonstration pour dataset local.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, 'Event LID #8', DATEADD('DAY', 20, CURRENT_TIMESTAMP), 'Abidjan', 15000, 'https://picsum.photos/seed/event8/1200/600', 'Business', TRUE, 'Événement de démonstration pour dataset local.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Email messages
INSERT INTO email_message (id, subject, body, status, attempt_count, last_error, next_retry_at, sent_at, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'Message #1', 'Contenu email de démonstration 1.', 'FAILED', 3, 'SMTP timeout', DATEADD('MINUTE', 30, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'Message #2', 'Contenu email de démonstration 2.', 'PENDING', 2, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'Message #3', 'Contenu email de démonstration 3.', 'SENT', 0, NULL, NULL, DATEADD('HOUR', -59, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'Message #4', 'Contenu email de démonstration 4.', 'PENDING', 0, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'Message #5', 'Contenu email de démonstration 5.', 'SENT', 1, NULL, NULL, DATEADD('HOUR', -27, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 'Message #6', 'Contenu email de démonstration 6.', 'SENT', 1, NULL, NULL, DATEADD('HOUR', -30, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, 'Message #7', 'Contenu email de démonstration 7.', 'SENT', 1, NULL, NULL, DATEADD('HOUR', -70, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, 'Message #8', 'Contenu email de démonstration 8.', 'SENT', 0, NULL, NULL, DATEADD('HOUR', -46, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, 'Message #9', 'Contenu email de démonstration 9.', 'SENT', 1, NULL, NULL, DATEADD('HOUR', -34, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, 'Message #10', 'Contenu email de démonstration 10.', 'PENDING', 3, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (11, 'Message #11', 'Contenu email de démonstration 11.', 'FAILED', 3, 'SMTP timeout', DATEADD('MINUTE', 30, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (12, 'Message #12', 'Contenu email de démonstration 12.', 'FAILED', 1, 'SMTP timeout', DATEADD('MINUTE', 30, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Email message recipients
INSERT INTO email_message_recipient (message_id, recipient) VALUES
  (1, 'paul.roux@lid.fr'),
  (1, 'mariam.diallo@lid.fr'),
  (2, 'awa.kone@lid.fr'),
  (2, 'lea.garcia@lid.fr'),
  (2, 'emma.petit@lid.fr'),
  (3, 'nina.martin@lid.fr'),
  (4, 'ines.lopez@lid.fr'),
  (5, 'home@lid.fr'),
  (6, 'kevin.durand@lid.fr'),
  (6, 'john.doe@lid.fr'),
  (6, 'emma.petit@lid.fr'),
  (7, 'sara.morel@lid.fr'),
  (7, 'mariam.diallo@lid.fr'),
  (7, 'john.doe@lid.fr'),
  (8, 'sport@lid.fr'),
  (8, 'ines.lopez@lid.fr'),
  (9, 'kevin.durand@lid.fr'),
  (10, 'ali.traore@lid.fr'),
  (11, 'fashion@lid.fr'),
  (11, 'sport@lid.fr'),
  (11, 'mariam.diallo@lid.fr'),
  (12, 'fashion@lid.fr');

-- Marketing campaigns
INSERT INTO marketing_campaign (id, name, type, status, audience, subject, content, scheduled_at, sent_at, sent_count, target_count, failed_count, open_rate, click_rate, revenue, budget_spent, attempts, next_retry_at, last_error, date_creation, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'Campagne #1', 'SMS', 'FINISHED', 'NEWSLETTER', 'Sujet campagne 1', 'Contenu campagne 1.', DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP), 172, 202, 6, 63, 8, 307042, 34069, 0, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, 'Campagne #2', 'SOCIAL', 'SCHEDULED', 'CLIENTS', 'Sujet campagne 2', 'Contenu campagne 2.', DATEADD('DAY', 2, CURRENT_TIMESTAMP), NULL, 0, 229, 0, NULL, NULL, NULL, 44677, 1, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, 'Campagne #3', 'SMS', 'FINISHED', 'NEWSLETTER', 'Sujet campagne 3', 'Contenu campagne 3.', DATEADD('DAY', -4, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), 159, 180, 10, 36, 16, 130026, 36081, 0, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, 'Campagne #4', 'SOCIAL', 'FINISHED', 'ALL', 'Sujet campagne 4', 'Contenu campagne 4.', DATEADD('DAY', 1, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), 158, 284, 0, 38, 24, 213813, 28045, 0, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, 'Campagne #5', 'SOCIAL', 'FINISHED', 'NEWSLETTER', 'Sujet campagne 5', 'Contenu campagne 5.', DATEADD('DAY', 4, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), 56, 255, 10, 64, 13, 65179, 16823, 1, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, 'Campagne #6', 'EMAIL', 'ACTIVE', 'NEWSLETTER', 'Sujet campagne 6', 'Contenu campagne 6.', DATEADD('DAY', 3, CURRENT_TIMESTAMP), NULL, 0, 155, 0, NULL, NULL, NULL, 29654, 1, DATEADD('HOUR', 2, CURRENT_TIMESTAMP), 'Provider error', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Marketing campaign deliveries
INSERT INTO marketing_campaign_delivery (id, campaign_id, channel, recipient, status, attempts, next_retry_at, sent_at, last_error, created_at) VALUES
  (1, 1, 'SMS', 'fatou.camara@lid.fr', 'SENT', 0, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (2, 1, 'SMS', 'awa.kone@lid.fr', 'FAILED', 2, DATEADD('MINUTE', 45, CURRENT_TIMESTAMP), NULL, 'SMTP timeout', CURRENT_TIMESTAMP),
  (3, 1, 'SMS', 'sara.morel@lid.fr', 'PENDING', 2, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (4, 1, 'SMS', 'yassine.benali@lid.fr', 'PENDING', 2, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (5, 1, 'SMS', 'ali.traore@lid.fr', 'FAILED', 1, DATEADD('MINUTE', 45, CURRENT_TIMESTAMP), NULL, 'SMTP timeout', CURRENT_TIMESTAMP),
  (6, 2, 'SOCIAL', 'awa.kone@lid.fr', 'PENDING', 2, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (7, 2, 'SOCIAL', 'lea.garcia@lid.fr', 'PENDING', 0, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (8, 2, 'SOCIAL', 'paul.roux@lid.fr', 'FAILED', 1, DATEADD('MINUTE', 45, CURRENT_TIMESTAMP), NULL, 'SMTP timeout', CURRENT_TIMESTAMP),
  (9, 2, 'SOCIAL', 'fatou.camara@lid.fr', 'SENT', 1, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (10, 2, 'SOCIAL', 'ines.lopez@lid.fr', 'FAILED', 1, DATEADD('MINUTE', 45, CURRENT_TIMESTAMP), NULL, 'SMTP timeout', CURRENT_TIMESTAMP),
  (11, 3, 'SMS', 'awa.kone@lid.fr', 'SENT', 2, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (12, 3, 'SMS', 'oumar.sow@lid.fr', 'PENDING', 1, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (13, 3, 'SMS', 'fatou.camara@lid.fr', 'SENT', 2, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (14, 3, 'SMS', 'lea.garcia@lid.fr', 'SENT', 2, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (15, 3, 'SMS', 'nina.martin@lid.fr', 'PENDING', 2, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (16, 4, 'SOCIAL', 'yassine.benali@lid.fr', 'FAILED', 0, DATEADD('MINUTE', 45, CURRENT_TIMESTAMP), NULL, 'SMTP timeout', CURRENT_TIMESTAMP),
  (17, 4, 'SOCIAL', 'emma.petit@lid.fr', 'SENT', 1, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (18, 4, 'SOCIAL', 'mariam.diallo@lid.fr', 'PENDING', 1, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (19, 4, 'SOCIAL', 'ali.traore@lid.fr', 'SENT', 1, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (20, 4, 'SOCIAL', 'ines.lopez@lid.fr', 'PENDING', 0, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (21, 5, 'SOCIAL', 'paul.roux@lid.fr', 'SENT', 0, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (22, 5, 'SOCIAL', 'lea.garcia@lid.fr', 'SENT', 2, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (23, 5, 'SOCIAL', 'kevin.durand@lid.fr', 'PENDING', 1, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (24, 5, 'SOCIAL', 'sara.morel@lid.fr', 'SENT', 0, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (25, 5, 'SOCIAL', 'fatou.camara@lid.fr', 'PENDING', 2, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (26, 6, 'EMAIL', 'lucas.bernard@lid.fr', 'PENDING', 1, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (27, 6, 'EMAIL', 'sara.morel@lid.fr', 'PENDING', 2, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (28, 6, 'EMAIL', 'ali.traore@lid.fr', 'SENT', 0, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (29, 6, 'EMAIL', 'oumar.sow@lid.fr', 'SENT', 0, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (30, 6, 'EMAIL', 'kevin.durand@lid.fr', 'PENDING', 0, NULL, NULL, NULL, CURRENT_TIMESTAMP);

-- Newsletter subscribers
INSERT INTO newsletter_subscriber (id, email, status, source, unsubscribed_at, created_at, updated_at, created_by, updated_by) VALUES
  ('ns-001', 'subscriber001@lid.fr', 'SUBSCRIBED', 'IMPORT', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-002', 'subscriber002@lid.fr', 'UNSUBSCRIBED', 'UNKNOWN', DATEADD('DAY', -63, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-003', 'subscriber003@lid.fr', 'UNSUBSCRIBED', 'UNKNOWN', DATEADD('DAY', -35, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-004', 'subscriber004@lid.fr', 'SUBSCRIBED', 'WEBSITE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-005', 'subscriber005@lid.fr', 'SUBSCRIBED', 'UNKNOWN', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-006', 'subscriber006@lid.fr', 'SUBSCRIBED', 'IMPORT', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-007', 'subscriber007@lid.fr', 'UNSUBSCRIBED', 'IMPORT', DATEADD('DAY', -6, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-008', 'subscriber008@lid.fr', 'SUBSCRIBED', 'UNKNOWN', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-009', 'subscriber009@lid.fr', 'SUBSCRIBED', 'WEBSITE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-010', 'subscriber010@lid.fr', 'SUBSCRIBED', 'IMPORT', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-011', 'subscriber011@lid.fr', 'SUBSCRIBED', 'BACKOFFICE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-012', 'subscriber012@lid.fr', 'SUBSCRIBED', 'IMPORT', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-013', 'subscriber013@lid.fr', 'SUBSCRIBED', 'WEBSITE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-014', 'subscriber014@lid.fr', 'SUBSCRIBED', 'UNKNOWN', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-015', 'subscriber015@lid.fr', 'UNSUBSCRIBED', 'BACKOFFICE', DATEADD('DAY', -17, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-016', 'subscriber016@lid.fr', 'UNSUBSCRIBED', 'BACKOFFICE', DATEADD('DAY', -65, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-017', 'subscriber017@lid.fr', 'SUBSCRIBED', 'WEBSITE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-018', 'subscriber018@lid.fr', 'UNSUBSCRIBED', 'WEBSITE', DATEADD('DAY', -56, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-019', 'subscriber019@lid.fr', 'SUBSCRIBED', 'UNKNOWN', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-020', 'subscriber020@lid.fr', 'SUBSCRIBED', 'IMPORT', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-021', 'subscriber021@lid.fr', 'UNSUBSCRIBED', 'UNKNOWN', DATEADD('DAY', -82, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-022', 'subscriber022@lid.fr', 'UNSUBSCRIBED', 'IMPORT', DATEADD('DAY', -15, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-023', 'subscriber023@lid.fr', 'UNSUBSCRIBED', 'WEBSITE', DATEADD('DAY', -42, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-024', 'subscriber024@lid.fr', 'SUBSCRIBED', 'UNKNOWN', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ns-025', 'subscriber025@lid.fr', 'SUBSCRIBED', 'WEBSITE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Security activity
INSERT INTO security_activity (id, event_at, user_id, action, status, ip, method, path, summary, created_at, updated_at, created_by, updated_by) VALUES
  (1, DATEADD('HOUR', -21, CURRENT_TIMESTAMP), 'u-c13', 'LOGOUT', 'SUCCESS', '192.168.0.12', 'DELETE', '/api/v1/newsletter', 'LOGOUT (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (2, DATEADD('HOUR', -20, CURRENT_TIMESTAMP), 'u-c12', 'UPDATE_ARTICLE', 'FAILED', '127.0.0.1', 'PUT', '/api/v1/backoffice/orders', 'UPDATE_ARTICLE (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (3, DATEADD('HOUR', -61, CURRENT_TIMESTAMP), 'u-p01', 'LOGOUT', 'SUCCESS', '192.168.0.12', 'PUT', '/api/v1/backoffice/orders', 'LOGOUT (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (4, DATEADD('HOUR', -40, CURRENT_TIMESTAMP), 'u-c03', 'UPDATE_ORDER', 'FAILED', '127.0.0.1', 'POST', '/api/v1/newsletter', 'UPDATE_ORDER (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (5, DATEADD('HOUR', -194, CURRENT_TIMESTAMP), 'u-p05', 'LOGOUT', 'SUCCESS', '192.168.0.25', 'DELETE', '/api/v1/discounts', 'LOGOUT (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (6, DATEADD('HOUR', -113, CURRENT_TIMESTAMP), 'u-p03', 'SEND_CAMPAIGN', 'FAILED', '192.168.0.25', 'PUT', '/api/v1/backoffice/orders', 'SEND_CAMPAIGN (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (7, DATEADD('HOUR', -152, CURRENT_TIMESTAMP), 'u-c02', 'SEND_CAMPAIGN', 'FAILED', '192.168.0.25', 'PUT', '/api/v1/backoffice/articles', 'SEND_CAMPAIGN (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (8, DATEADD('HOUR', -10, CURRENT_TIMESTAMP), 'u-c01', 'PASSWORD_RESET', 'SUCCESS', '192.168.0.12', 'DELETE', '/api/v1/discounts', 'PASSWORD_RESET (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (9, DATEADD('HOUR', -153, CURRENT_TIMESTAMP), 'u-c01', 'PASSWORD_RESET', 'FAILED', '127.0.0.1', 'GET', '/api/v1/newsletter', 'PASSWORD_RESET (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (10, DATEADD('HOUR', -233, CURRENT_TIMESTAMP), 'u-p01', 'CREATE_DISCOUNT', 'FAILED', '192.168.0.25', 'GET', '/api/v1/discounts', 'CREATE_DISCOUNT (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (11, DATEADD('HOUR', -39, CURRENT_TIMESTAMP), 'u-p03', 'CREATE_ARTICLE', 'FAILED', '192.168.0.25', 'DELETE', '/api/v1/newsletter', 'CREATE_ARTICLE (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (12, DATEADD('HOUR', -166, CURRENT_TIMESTAMP), 'u-c01', 'SEND_CAMPAIGN', 'SUCCESS', '192.168.0.12', 'GET', '/api/v1/newsletter', 'SEND_CAMPAIGN (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (13, DATEADD('HOUR', -135, CURRENT_TIMESTAMP), 'u-c05', 'LOGIN', 'SUCCESS', '192.168.0.25', 'DELETE', '/api/v1/discounts', 'LOGIN (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (14, DATEADD('HOUR', -105, CURRENT_TIMESTAMP), 'u-p01', 'UPDATE_ORDER', 'FAILED', '192.168.0.12', 'PUT', '/api/v1/discounts', 'UPDATE_ORDER (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (15, DATEADD('HOUR', -143, CURRENT_TIMESTAMP), 'u-c10', 'LOGIN', 'FAILED', '127.0.0.1', 'PUT', '/api/v1/auth/login', 'LOGIN (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (16, DATEADD('HOUR', -21, CURRENT_TIMESTAMP), 'u-l01', 'CREATE_DISCOUNT', 'FAILED', '192.168.0.12', 'POST', '/api/v1/backoffice/articles', 'CREATE_DISCOUNT (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (17, DATEADD('HOUR', -153, CURRENT_TIMESTAMP), 'u-p03', 'UPDATE_ORDER', 'FAILED', '192.168.0.12', 'DELETE', '/api/v1/backoffice/orders', 'UPDATE_ORDER (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (18, DATEADD('HOUR', -209, CURRENT_TIMESTAMP), 'u-l02', 'LOGOUT', 'FAILED', '192.168.0.25', 'DELETE', '/api/v1/backoffice/articles', 'LOGOUT (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (19, DATEADD('HOUR', -93, CURRENT_TIMESTAMP), 'u-c04', 'LOGOUT', 'FAILED', '192.168.0.25', 'PUT', '/api/v1/auth/login', 'LOGOUT (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (20, DATEADD('HOUR', -58, CURRENT_TIMESTAMP), 'u-c09', 'UPDATE_ORDER', 'SUCCESS', '192.168.0.12', 'DELETE', '/api/v1/backoffice/orders', 'UPDATE_ORDER (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (21, DATEADD('HOUR', -198, CURRENT_TIMESTAMP), 'u-c04', 'UPDATE_ORDER', 'SUCCESS', '192.168.0.12', 'GET', '/api/v1/newsletter', 'UPDATE_ORDER (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (22, DATEADD('HOUR', -97, CURRENT_TIMESTAMP), 'u-p02', 'LOGIN', 'FAILED', '192.168.0.25', 'POST', '/api/v1/newsletter', 'LOGIN (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (23, DATEADD('HOUR', -12, CURRENT_TIMESTAMP), 'u-c04', 'UPDATE_ORDER', 'SUCCESS', '192.168.0.25', 'POST', '/api/v1/discounts', 'UPDATE_ORDER (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (24, DATEADD('HOUR', -60, CURRENT_TIMESTAMP), 'u-c13', 'PASSWORD_RESET', 'SUCCESS', '192.168.0.12', 'PUT', '/api/v1/discounts', 'PASSWORD_RESET (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (25, DATEADD('HOUR', -174, CURRENT_TIMESTAMP), 'u-p02', 'CREATE_ARTICLE', 'FAILED', '192.168.0.12', 'POST', '/api/v1/backoffice/articles', 'CREATE_ARTICLE (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (26, DATEADD('HOUR', -136, CURRENT_TIMESTAMP), 'u-p03', 'SEND_CAMPAIGN', 'FAILED', '192.168.0.12', 'DELETE', '/api/v1/newsletter', 'SEND_CAMPAIGN (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (27, DATEADD('HOUR', -14, CURRENT_TIMESTAMP), 'u-c13', 'UPDATE_ORDER', 'SUCCESS', '192.168.0.25', 'POST', '/api/v1/backoffice/articles', 'UPDATE_ORDER (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (28, DATEADD('HOUR', -218, CURRENT_TIMESTAMP), 'u-p05', 'SEND_CAMPAIGN', 'FAILED', '192.168.0.25', 'GET', '/api/v1/newsletter', 'SEND_CAMPAIGN (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (29, DATEADD('HOUR', -232, CURRENT_TIMESTAMP), 'u-c03', 'UPDATE_ARTICLE', 'SUCCESS', '127.0.0.1', 'PUT', '/api/v1/discounts', 'UPDATE_ARTICLE (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (30, DATEADD('HOUR', -227, CURRENT_TIMESTAMP), 'u-p01', 'UPDATE_ORDER', 'FAILED', '127.0.0.1', 'POST', '/api/v1/discounts', 'UPDATE_ORDER (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (31, DATEADD('HOUR', -96, CURRENT_TIMESTAMP), 'u-c11', 'LOGIN', 'FAILED', '127.0.0.1', 'DELETE', '/api/v1/newsletter', 'LOGIN (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (32, DATEADD('HOUR', -82, CURRENT_TIMESTAMP), 'u-c07', 'CREATE_DISCOUNT', 'SUCCESS', '192.168.0.12', 'POST', '/api/v1/auth/login', 'CREATE_DISCOUNT (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (33, DATEADD('HOUR', -235, CURRENT_TIMESTAMP), 'u-c03', 'PASSWORD_RESET', 'SUCCESS', '127.0.0.1', 'GET', '/api/v1/backoffice/articles', 'PASSWORD_RESET (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (34, DATEADD('HOUR', -5, CURRENT_TIMESTAMP), 'u-c15', 'UPDATE_ORDER', 'FAILED', '192.168.0.12', 'GET', '/api/v1/auth/login', 'UPDATE_ORDER (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (35, DATEADD('HOUR', -199, CURRENT_TIMESTAMP), 'u-c08', 'CREATE_ARTICLE', 'SUCCESS', '192.168.0.25', 'DELETE', '/api/v1/auth/login', 'CREATE_ARTICLE (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (36, DATEADD('HOUR', -108, CURRENT_TIMESTAMP), 'u-c09', 'CREATE_ARTICLE', 'FAILED', '127.0.0.1', 'GET', '/api/v1/backoffice/orders', 'CREATE_ARTICLE (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (37, DATEADD('HOUR', -138, CURRENT_TIMESTAMP), 'u-p05', 'SEND_CAMPAIGN', 'SUCCESS', '127.0.0.1', 'DELETE', '/api/v1/newsletter', 'SEND_CAMPAIGN (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (38, DATEADD('HOUR', -158, CURRENT_TIMESTAMP), 'u-admin', 'CREATE_ARTICLE', 'SUCCESS', '192.168.0.12', 'DELETE', '/api/v1/auth/login', 'CREATE_ARTICLE (success)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (39, DATEADD('HOUR', -93, CURRENT_TIMESTAMP), 'u-c11', 'CREATE_ARTICLE', 'FAILED', '127.0.0.1', 'GET', '/api/v1/newsletter', 'CREATE_ARTICLE (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  (40, DATEADD('HOUR', -96, CURRENT_TIMESTAMP), 'u-c02', 'LOGIN', 'FAILED', '192.168.0.12', 'GET', '/api/v1/discounts', 'LOGIN (failed)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Backoffice defaults
INSERT INTO backoffice_app_config (id, store_name, contact_email, contact_phone, city, logo_url, slogan, activity_sector, created_at, updated_at, created_by, updated_by) VALUES
  (1, 'LID', 'contact@lid.fr', '+33000000000', 'Local', 'https://picsum.photos/seed/lidlogo/200/200', 'Plateforme locale', 'E-commerce', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO backoffice_security_setting (id, admin2fa_enabled, created_at, updated_at, created_by, updated_by) VALUES
  (1, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO backoffice_shipping_method (id, code, label, description, cost_amount, enabled, is_default, sort_order, created_at, updated_at, created_by, updated_by) VALUES
  ('ship-std', 'STANDARD', 'Livraison standard', '2 à 5 jours', 2500, TRUE, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ship-exp', 'EXPRESS', 'Livraison express', 'Moins de 24h', 7000, TRUE, FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO backoffice_free_shipping_rule (id, threshold_amount, progress_message_template, unlocked_message, enabled, created_at, updated_at, created_by, updated_by) VALUES
  ('fsr-001', 50000, 'Ajoutez encore %s pour bénéficier de la livraison gratuite', 'Livraison gratuite débloquée', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO backoffice_notification_preference (pref_key, label, enabled, created_at, updated_at, created_by, updated_by) VALUES
  ('ORDER_CREATED', 'Commande créée', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ORDER_PAID', 'Commande payée', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('ORDER_DELIVERED', 'Commande livrée', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('MARKETING_SUMMARY', 'Résumé marketing', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO backoffice_integration_setting (id, paydunya_connected, paydunya_mode, paydunya_public_key, paydunya_private_key, paydunya_master_key, paydunya_token, sendinblue_connected, sendinblue_api_key, slack_connected, slack_webhook_url, google_analytics_connected, google_analytics_measurement_id, created_at, updated_at, created_by, updated_by) VALUES
  (1, TRUE, 'test', 'test_public_key', 'test_private_key', 'test_master_key', 'test_token', FALSE, NULL, FALSE, NULL, FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO backoffice_social_link (id, platform, url, sort_order, created_at, updated_at, created_by, updated_by) VALUES
  ('soc-001', 'facebook', 'https://facebook.com/lid', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('soc-002', 'instagram', 'https://instagram.com/lid', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
  ('soc-003', 'x', 'https://x.com/lid', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Realign identity generators after explicit-ID seed data.
ALTER TABLE category ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE shop ALTER COLUMN shop_id RESTART WITH 1000;
ALTER TABLE article ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE stock ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE orders ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE order_article ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE shipment ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE return_request ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE return_request_item ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE discount ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE blog_post ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE ticket_event ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE email_message ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE marketing_campaign ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE marketing_campaign_delivery ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE security_activity ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE backoffice_app_config ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE backoffice_security_setting ALTER COLUMN id RESTART WITH 1000;
ALTER TABLE backoffice_integration_setting ALTER COLUMN id RESTART WITH 1000;
