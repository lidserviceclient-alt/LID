-- H2 local parity seed (mapped from ZIP demo dataset to current schema)
-- Safe for local in-memory reset flows.

-- Clean child tables first
DELETE FROM marketing_campaign_delivery;
DELETE FROM email_message_recipient;
DELETE FROM return_request_item;
DELETE FROM order_article;
DELETE FROM stock;
DELETE FROM article_categories;
DELETE FROM authentication_roles;

-- Then parent tables
DELETE FROM shipment;
DELETE FROM return_request;
DELETE FROM email_message;
DELETE FROM marketing_campaign;
DELETE FROM newsletter_subscriber;
DELETE FROM discount;
DELETE FROM blog_post;
DELETE FROM ticket_event;
DELETE FROM orders;
DELETE FROM article;
DELETE FROM partner;
DELETE FROM customer;
DELETE FROM authentication;
DELETE FROM shop;
DELETE FROM category;
DELETE FROM user_entity;
DELETE FROM security_activity;
DELETE FROM backoffice_social_link;
DELETE FROM backoffice_notification_preference;
DELETE FROM backoffice_free_shipping_rule;
DELETE FROM backoffice_shipping_method;
DELETE FROM backoffice_security_setting;
DELETE FROM backoffice_integration_setting;
DELETE FROM backoffice_app_config;

-- Categories (ZIP: Electronique > Telephones)
INSERT INTO category (id, name, level, order_idx, is_activated, slug, image_url, parent_slug, created_at, updated_at)
VALUES
  (1, 'Electronique', 'PRINCIPALE', 1, TRUE, 'electronique', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Telephones', 'SOUS_CATEGORIE', 1, TRUE, 'telephones', NULL, 'electronique', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'Accessoires', 'SOUS_CATEGORIE', 2, TRUE, 'accessoires', NULL, 'electronique', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Shops / users / auth (ZIP-equivalent identities)
INSERT INTO shop (shop_id, shop_name, description, logo_url, background_url, status, main_category_id, shop_description, created_at, updated_at)
VALUES
  (1, 'Boutique Demo', 'Boutique de demonstration', 'https://picsum.photos/seed/shop1/200/200', 'https://picsum.photos/seed/shopbg1/1200/400', 0, 1, 'Boutique principale de demonstration', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO user_entity (user_id, user_type, first_name, last_name, email, email_verified, blocked, created_at, updated_at)
VALUES
  ('u-admin-001', 'UserEntity', 'Super', 'Admin', 'admin@demo.com', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('u-client-001', 'CUSTOMER', 'John', 'Doe', 'john@demo.com', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('u-part-001', 'PARTNER', 'Shop', 'Partner', 'partner@demo.com', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('u-client-002', 'CUSTOMER', 'Awa', 'Kone', 'awa@demo.com', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('u-livreur-001', 'UserEntity', 'Ibrahima', 'Traore', 'livreur@demo.com', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO customer (user_id, avatar_url, phone_number, city, country)
VALUES
  ('u-client-001', NULL, '+33600000000', 'Abidjan', 'Cote d''Ivoire'),
  ('u-client-002', NULL, '+22507070707', 'Yamoussoukro', 'Cote d''Ivoire');

INSERT INTO partner (user_id, phone_number, password_hash, shop_id, head_office_address, city, country, business_registration_document_url, registration_status)
VALUES
  ('u-part-001', '+22501020304', NULL, 1, 'Cocody', 'Abidjan', 'Cote d''Ivoire', NULL, 'VERIFIED');

INSERT INTO authentication (user_id, type, created_at, updated_at)
VALUES
  ('u-admin-001', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('u-client-001', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('u-part-001', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('u-client-002', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('u-livreur-001', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- UserRole ordinals: SUPER_ADMIN=0, ADMIN=1, LIVREUR=2, PARTNER=3, CUSTOMER=4
INSERT INTO authentication_roles (authentication_user_id, roles)
VALUES
  ('u-admin-001', 0),
  ('u-admin-001', 1),
  ('u-client-001', 4),
  ('u-part-001', 3),
  ('u-client-002', 4),
  ('u-livreur-001', 2);

-- Articles
INSERT INTO article (id, sku, ean, name, description, img, brand, price, vat, status, reference_partner, discount_percent, is_flash_sale, flash_sale_ends_at, is_featured, is_best_seller, created_at, updated_at)
VALUES
  (1, 'REF-IPHONE-01', 'EAN-0001', 'iPhone Demo', 'Telephone de demonstration', 'https://picsum.photos/seed/p1/600/600', 'Apple', 500000, 18.0, 'ACTIVE', 'u-part-001', NULL, FALSE, NULL, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'REF-SAMSUNG-01', 'EAN-0002', 'Galaxy Demo', 'Smartphone Android de demonstration', 'https://picsum.photos/seed/p2/600/600', 'Samsung', 420000, 18.0, 'ACTIVE', 'u-part-001', 5.0, FALSE, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'REF-CASE-01', 'EAN-0003', 'Coque Premium', 'Accessoire telephone', 'https://picsum.photos/seed/p3/600/600', 'Anker', 15000, 18.0, 'ACTIVE', 'u-part-001', NULL, FALSE, NULL, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO article_categories (article_id, categories_id)
VALUES
  (1, 2),
  (2, 2),
  (3, 3);

INSERT INTO stock (id, article_id, quantity_available, quantity_reserved, lot, best_before, created_at, updated_at)
VALUES
  (1, 1, 50, 0, 'LOT-IPH-001', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 2, 35, 2, 'LOT-SAM-001', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 3, 120, 4, 'LOT-ACC-001', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Orders / returns / logistics
INSERT INTO orders (id, customer_user_id, amount, currency, current_status, tracking_number, delivery_date, created_at, updated_at)
VALUES
  (1, 'u-client-001', 1000000, 'XOF', 'PAID', 'TRACK-001', DATEADD('DAY', 3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'u-client-002', 420000, 'XOF', 'PROCESSING', 'TRACK-002', DATEADD('DAY', 2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'u-client-001', 15000, 'XOF', 'DELIVERED', 'TRACK-003', DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP);

INSERT INTO order_article (id, order_id, article_id, quantity, price_at_order, created_at, updated_at)
VALUES
  (1, 1, 1, 2, 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 2, 2, 1, 420000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 3, 3, 1, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO return_request (id, order_id, order_number, email, reason, details, status, created_at, updated_at)
VALUES
  (1, 1, 'cmd-001', 'john@demo.com', 'Produit defectueux', 'Ecran fissure a la livraison', 'SUBMITTED', DATEADD('DAY', -1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
  (2, 3, 'cmd-003', 'john@demo.com', 'Ne convient pas', 'Demande de remboursement', 'APPROVED', DATEADD('DAY', -2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP);

INSERT INTO return_request_item (id, return_request_id, article_id, article_name, quantity, unit_price, created_at, updated_at)
VALUES
  (1, 1, 1, 'iPhone Demo', 1, 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 2, 3, 'Coque Premium', 1, 15000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO shipment (id, order_id, carrier, tracking_id, status, eta, cost, courier_reference, courier_name, courier_phone, courier_user, scanned_at, delivery_code, delivery_code_generated_at, delivered_at, created_at, updated_at)
VALUES
  (1, '1', 'DHL', 'TRK-DHL-001', 'EN_COURS', DATEADD('DAY', 2, CURRENT_DATE), 2500, 'CR-001', 'Ibrahima', '+22505050505', 'u-livreur-001', CURRENT_TIMESTAMP, '1234', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, '3', 'DHL', 'TRK-DHL-003', 'LIVREE', DATEADD('DAY', -1, CURRENT_DATE), 1500, 'CR-002', 'Ibrahima', '+22505050505', 'u-livreur-001', DATEADD('DAY', -2, CURRENT_TIMESTAMP), '4321', DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Promotions (ZIP-like WELCOME10)
INSERT INTO discount (id, code, description, type, target, target_id, min_order_amount, start_at, end_at, is_active, usage_max, usage_max_per_user, usage_count, discount_value, created_at, updated_at)
VALUES
  (1, 'WELCOME10', 'Reduction de bienvenue', 'PERCENTAGE', 'GLOBAL', NULL, 100000, DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', 30, CURRENT_TIMESTAMP), TRUE, 100, 1, 12, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'SHOP5', 'Reduction boutique partenaire', 'PERCENTAGE', 'BOUTIQUE', '1', 50000, DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', 20, CURRENT_TIMESTAMP), TRUE, 300, 3, 34, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Blog / tickets
INSERT INTO blog_post (id, title, excerpt, content, image_url, category, published_at, author, featured, read_time, created_at, updated_at)
VALUES
  (1, 'Nouveautes Produits 2026', 'Les tendances de ce trimestre', 'Contenu demo article blog #1', 'https://picsum.photos/seed/blog1/1200/600', 'E-commerce', DATEADD('DAY', -5, CURRENT_TIMESTAMP), 'Admin', TRUE, '5 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Guide Achat Smartphone', 'Comment choisir votre smartphone', 'Contenu demo article blog #2', 'https://picsum.photos/seed/blog2/1200/600', 'Conseils', DATEADD('DAY', -2, CURRENT_TIMESTAMP), 'Admin', FALSE, '7 min', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO ticket_event (id, title, event_date, location, price, image_url, category, available, description, created_at, updated_at)
VALUES
  (1, 'LID Tech Expo', DATEADD('DAY', 15, CURRENT_TIMESTAMP), 'Abidjan', 25000, 'https://picsum.photos/seed/ticket1/1200/600', 'Tech', TRUE, 'Evenement demo billetterie', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Startup Meetup', DATEADD('DAY', 30, CURRENT_TIMESTAMP), 'Yamoussoukro', 10000, 'https://picsum.photos/seed/ticket2/1200/600', 'Business', TRUE, 'Networking regional', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Messaging / marketing / newsletter
INSERT INTO email_message (id, subject, body, status, attempt_count, last_error, next_retry_at, sent_at, created_at, updated_at)
VALUES
  (1, 'Annonce Promo', 'Contenu message backoffice 1', 'SENT', 1, NULL, NULL, DATEADD('HOUR', -6, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Relance Panier', 'Contenu message backoffice 2', 'FAILED', 2, 'SMTP timeout', DATEADD('MINUTE', 30, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO email_message_recipient (message_id, recipient)
VALUES
  (1, 'john@demo.com'),
  (1, 'awa@demo.com'),
  (2, 'partner@demo.com');

INSERT INTO marketing_campaign (id, name, type, status, audience, subject, content, scheduled_at, sent_at, sent_count, target_count, failed_count, open_rate, click_rate, revenue, budget_spent, attempts, next_retry_at, last_error, date_creation, created_at, updated_at)
VALUES
  (1, 'Campagne Bienvenue', 'EMAIL', 'FINISHED', 'ALL', 'Bienvenue sur LID', 'Contenu campagne #1', DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP), 2, 2, 0, 62.5, 21.0, 150000, 10000, 1, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Promo Mensuelle', 'EMAIL', 'SCHEDULED', 'CLIENTS', 'Promo Mars', 'Contenu campagne #2', DATEADD('DAY', 1, CURRENT_TIMESTAMP), NULL, 0, 2, 0, NULL, NULL, NULL, 0, 0, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO marketing_campaign_delivery (id, campaign_id, channel, recipient, status, attempts, next_retry_at, sent_at, last_error, created_at)
VALUES
  (1, 1, 'EMAIL', 'john@demo.com', 'SENT', 1, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (2, 1, 'EMAIL', 'awa@demo.com', 'SENT', 1, NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, CURRENT_TIMESTAMP),
  (3, 2, 'EMAIL', 'john@demo.com', 'PENDING', 0, NULL, NULL, NULL, CURRENT_TIMESTAMP),
  (4, 2, 'EMAIL', 'awa@demo.com', 'PENDING', 0, NULL, NULL, NULL, CURRENT_TIMESTAMP);

INSERT INTO newsletter_subscriber (id, email, status, source, unsubscribed_at, created_at, updated_at)
VALUES
  ('ns-001', 'john@demo.com', 'SUBSCRIBED', 'WEBSITE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ns-002', 'awa@demo.com', 'SUBSCRIBED', 'BACKOFFICE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ns-003', 'old-user@demo.com', 'UNSUBSCRIBED', 'IMPORT', DATEADD('DAY', -10, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Security activity
INSERT INTO security_activity (id, event_at, user_id, action, status, ip, method, path, summary, created_at, updated_at)
VALUES
  (1, DATEADD('HOUR', -5, CURRENT_TIMESTAMP), 'u-admin-001', 'LOGIN', 'SUCCESS', '127.0.0.1', 'POST', '/api/v1/auth/login', 'Connexion backoffice', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, DATEADD('HOUR', -4, CURRENT_TIMESTAMP), 'u-admin-001', 'UPDATE_ORDER', 'SUCCESS', '127.0.0.1', 'PUT', '/api/v1/backoffice/orders/2/status', 'Mise a jour statut commande', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, DATEADD('HOUR', -3, CURRENT_TIMESTAMP), 'u-client-001', 'LOGIN', 'FAILED', '127.0.0.1', 'POST', '/api/v1/auth/login', 'Mot de passe invalide', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Backoffice settings section defaults
INSERT INTO backoffice_app_config (id, store_name, contact_email, contact_phone, city, logo_url, slogan, activity_sector, created_at, updated_at)
VALUES
  (1, 'LID E-commerce', 'contact@lid.demo', '+22501020304', 'Abidjan', 'https://picsum.photos/seed/logo/200/200', 'Plateforme de vente en ligne', 'E-commerce', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO backoffice_security_setting (id, admin2fa_enabled, created_at, updated_at)
VALUES
  (1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO backoffice_shipping_method (id, code, label, description, cost_amount, enabled, is_default, sort_order, created_at, updated_at)
VALUES
  ('ship-std', 'STANDARD', 'Livraison standard', 'Livraison sous 2 a 5 jours', 2500, TRUE, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ship-exp', 'EXPRESS', 'Livraison express', 'Livraison en moins de 24h', 7000, TRUE, FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO backoffice_free_shipping_rule (id, threshold_amount, progress_message_template, unlocked_message, enabled, created_at, updated_at)
VALUES
  ('fsr-001', 50000, 'Ajoutez encore %s pour beneficier de la livraison gratuite', 'Livraison gratuite debloquee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO backoffice_notification_preference (pref_key, label, enabled, created_at, updated_at)
VALUES
  ('ORDER_CREATED', 'Commande creee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ORDER_PAID', 'Commande payee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ORDER_DELIVERED', 'Commande livree', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('MARKETING_SUMMARY', 'Resume marketing', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO backoffice_integration_setting (id, paydunya_connected, paydunya_mode, paydunya_public_key, paydunya_private_key, paydunya_master_key, paydunya_token, sendinblue_connected, sendinblue_api_key, slack_connected, slack_webhook_url, google_analytics_connected, google_analytics_measurement_id, created_at, updated_at)
VALUES
  (1, TRUE, 'test', 'test_public_wlMc2CzSqJjLgMvO90sKK3iAYuQ', 'test_private_1n1bG4y2UAfkYwB4TftyJyMREb9', 'QoO7XToF-67Fj-q7DL-T86I-vKTCZ71xU52l', '1Jlnv5qJStNOD2jwsXXp', FALSE, NULL, FALSE, NULL, FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO backoffice_social_link (id, platform, url, sort_order, created_at, updated_at)
VALUES
  ('soc-001', 'facebook', 'https://facebook.com/lid', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('soc-002', 'instagram', 'https://instagram.com/lid', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('soc-003', 'x', 'https://x.com/lid', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
