-- ================================================
-- H2 LOCAL SEED - MINIMAL DATASET
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

-- Super admin user
INSERT INTO user_entity (user_id, user_type, first_name, last_name, email, email_verified, blocked, created_at, updated_at, created_by, updated_by) VALUES
  ('u-admin', 'UserEntity', 'Super', 'Admin', 'admin@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Authentication (LOCAL) - password=admin
INSERT INTO authentication (user_id, type, password_hash, created_at, updated_at, created_by, updated_by) VALUES
  ('u-admin', 'LOCAL', '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Roles
INSERT INTO authentication_roles (authentication_user_id, roles) VALUES
  ('u-admin', 'SUPER_ADMIN'),
  ('u-admin', 'ADMIN');
