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
TRUNCATE TABLE partner_profile;
TRUNCATE TABLE customer_profile;
TRUNCATE TABLE delivery_driver_profile;
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
INSERT INTO user_entity (user_id, first_name, last_name, email, email_verified, blocked, created_at, updated_at, created_by, updated_by) VALUES
  ('u-admin', 'Super', 'Admin', 'admin@lid.fr', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Authentication (LOCAL) - password=admin
INSERT INTO authentication (user_id, type, password_hash, created_at, updated_at, created_by, updated_by) VALUES
  ('u-admin', 'LOCAL', '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Roles
INSERT INTO authentication_roles (authentication_user_id, roles) VALUES
  ('u-admin', 'SUPER_ADMIN'),
  ('u-admin', 'ADMIN');

-- Partner category
INSERT INTO category (
  id,
  order_idx,
  name,
  level,
  is_activated,
  image_url,
  slug,
  parent_slug,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  100,
  1,
  'Boissons locales',
  'PRINCIPALE',
  TRUE,
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80',
  'boissons-locales',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-admin',
  'u-admin'
);

-- Partner user
INSERT INTO user_entity (
  user_id,
  first_name,
  last_name,
  email,
  email_verified,
  blocked,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  'u-partner-p1',
  'Paul',
  'Marchand',
  'p1@lid.fr',
  TRUE,
  FALSE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-admin',
  'u-admin'
);

-- Partner authentication (password = aaaaaaaa)
INSERT INTO authentication (
  user_id,
  type,
  password_hash,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  'u-partner-p1',
  'LOCAL',
  '$2y$10$qkbgceV7kfSONK5Pb53m9uLD5gcOZua5VbNsVpJtLZjBb5rmX.dCO',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-admin',
  'u-admin'
);

INSERT INTO authentication_roles (authentication_user_id, roles) VALUES
  ('u-partner-p1', 'PARTNER');

-- Partner shop
INSERT INTO shop (
  shop_id,
  shop_name,
  description,
  logo_url,
  background_url,
  status,
  main_category_id,
  shop_description,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  100,
  'Cave de Cocody',
  'Boissons artisanales et coffrets frais.',
  'https://images.unsplash.com/photo-1563225409-127c18758bd5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80',
  'PRINCIPALE',
  100,
  'Sélection de boissons locales, tonics premium et coffrets prêts à offrir.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-admin',
  'u-admin'
);

-- Partner profile
INSERT INTO partner_profile (
  user_id,
  phone_number,
  shop_id,
  head_office_address,
  city,
  country,
  ninea,
  rccm,
  business_registration_document_url,
  bank_name,
  account_holder,
  rib,
  iban,
  swift,
  contract_accepted,
  id_document_url,
  ninea_document_url,
  supporting_documents_zip_url,
  registration_review_comment,
  registration_status,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  'u-partner-p1',
  '+2250700000001',
  100,
  '12 boulevard Latrille',
  'Abidjan',
  'Côte d''Ivoire',
  'CI-123-456-789',
  'RCCM-ABJ-2026-A-001',
  'https://example.com/docs/p1-business.pdf',
  'Banque Atlantique',
  'Paul Marchand',
  'CI011234567890',
  'CI9301000100000000000000001',
  'ATCIXXXX',
  TRUE,
  'https://example.com/docs/p1-id.pdf',
  'https://example.com/docs/p1-ninea.pdf',
  'https://example.com/docs/p1-supporting.zip',
  'Compte partenaire local H2 prêt pour les tests.',
  'VERIFIED',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-admin',
  'u-admin'
);

-- Partner article
INSERT INTO article (
  id,
  sku,
  ean,
  name,
  description,
  img,
  brand,
  price,
  vat,
  status,
  reference_partner,
  discount_percent,
  is_flash_sale,
  flash_sale_ends_at,
  is_featured,
  is_best_seller,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  100,
  'SKU-P1-0001',
  '2000000001001',
  'Pack Gingembre Premium',
  'Coffret de 6 bouteilles de boisson artisanale au gingembre.',
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
  'Cave de Cocody',
  12500,
  18,
  'ACTIVE',
  'u-partner-p1',
  NULL,
  FALSE,
  NULL,
  TRUE,
  FALSE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-partner-p1',
  'u-partner-p1'
);

INSERT INTO article_categories (article_id, categories_id) VALUES
  (100, 100);

INSERT INTO stock (
  id,
  article_id,
  quantity_available,
  quantity_reserved,
  lot,
  best_before,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  100,
  100,
  25,
  0,
  'LOT-P1-001',
  DATE '2026-12-31',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-partner-p1',
  'u-partner-p1'
);

-- Customer user
INSERT INTO user_entity (
  user_id,
  first_name,
  last_name,
  email,
  email_verified,
  blocked,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  'u-customer-c1',
  'Claire',
  'Amani',
  'c1@lid.fr',
  TRUE,
  FALSE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-admin',
  'u-admin'
);

-- Customer authentication (password = aaaaaaaa)
INSERT INTO authentication (
  user_id,
  type,
  password_hash,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  'u-customer-c1',
  'LOCAL',
  '$2y$10$qkbgceV7kfSONK5Pb53m9uLD5gcOZua5VbNsVpJtLZjBb5rmX.dCO',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-admin',
  'u-admin'
);

INSERT INTO authentication_roles (authentication_user_id, roles) VALUES
  ('u-customer-c1', 'CUSTOMER');

INSERT INTO customer_profile (
  user_id,
  avatar_url,
  phone_number,
  city,
  country,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  'u-customer-c1',
  NULL,
  '+2250102030405',
  'Abidjan',
  'Côte d''Ivoire',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'u-admin',
  'u-admin'
);

-- Paid customer order for the seeded partner article
INSERT INTO orders (
  id,
  customer_user_id,
  amount,
  current_status,
  delivery_date,
  tracking_number,
  currency,
  shipping_address,
  shipping_phone_number,
  shipping_method_code,
  shipping_method_label,
  shipping_cost,
  shipping_latitude,
  shipping_longitude,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  1,
  'u-customer-c1',
  15750,
  'PAID',
  NULL,
  'ORD-1',
  'XOF',
  'Riviera Palmeraie, Abidjan',
  '+2250102030405',
  'standard',
  'Livraison standard',
  3250,
  5.348,
  -3.959,
  TIMESTAMP '2026-04-18 10:15:00',
  TIMESTAMP '2026-04-18 10:18:00',
  'u-customer-c1',
  'u-admin'
);

INSERT INTO status_history (
  id,
  order_id,
  status,
  comment,
  changed_at,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES
  (
    1,
    1,
    'PENDING',
    'Commande créée - En attente de paiement',
    TIMESTAMP '2026-04-18 10:15:00',
    TIMESTAMP '2026-04-18 10:15:00',
    TIMESTAMP '2026-04-18 10:15:00',
    'u-customer-c1',
    'u-customer-c1'
  ),
  (
    2,
    1,
    'PAID',
    'Paiement confirmé',
    TIMESTAMP '2026-04-18 10:18:00',
    TIMESTAMP '2026-04-18 10:18:00',
    TIMESTAMP '2026-04-18 10:18:00',
    'u-admin',
    'u-admin'
  );

INSERT INTO order_article (
  id,
  order_id,
  item_type,
  article_id,
  ticket_event_id,
  quantity,
  price_at_order,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  1,
  1,
  'ARTICLE',
  100,
  NULL,
  1,
  12500,
  TIMESTAMP '2026-04-18 10:15:00',
  TIMESTAMP '2026-04-18 10:15:00',
  'u-customer-c1',
  'u-customer-c1'
);

INSERT INTO payment (
  id,
  order_id,
  invoice_token,
  amount,
  currency,
  description,
  operator,
  status,
  customer_name,
  customer_email,
  customer_phone,
  receipt_url,
  return_url,
  cancel_url,
  payment_date,
  failure_reason,
  transaction_id,
  paydunya_hash,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  1,
  1,
  'LOCAL-H2-ORDER-1',
  15750,
  'XOF',
  'Commande H2 partenaire Cave de Cocody',
  'ORANGE_MONEY_CI',
  'COMPLETED',
  'Claire Amani',
  'c1@lid.fr',
  '+2250102030405',
  NULL,
  'http://localhost:5173/payment/success',
  'http://localhost:5173/payment/cancel',
  TIMESTAMP '2026-04-18 10:18:00',
  NULL,
  'TX-H2-ORDER-1',
  NULL,
  TIMESTAMP '2026-04-18 10:18:00',
  TIMESTAMP '2026-04-18 10:18:00',
  'u-admin',
  'u-admin'
);

INSERT INTO partner_settlement (
  id,
  order_id,
  payment_id,
  partner_id,
  partner_name,
  currency,
  gross_amount,
  discount_allocation,
  shipping_allocation,
  return_cost_allocation,
  margin_percent,
  margin_amount,
  net_amount,
  transaction_date,
  eligible_at,
  scheduled_at,
  paid_out_at,
  payout_reference,
  last_calculated_at,
  payout_status,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  1,
  1,
  1,
  'u-partner-p1',
  'Paul Marchand',
  'XOF',
  12500,
  0,
  3250,
  0,
  0,
  0,
  9250,
  TIMESTAMP '2026-04-18 10:18:00',
  TIMESTAMP '2026-04-18 10:18:00',
  TIMESTAMP '2026-04-19 10:18:00',
  NULL,
  NULL,
  TIMESTAMP '2026-04-18 10:18:00',
  'SCHEDULED',
  TIMESTAMP '2026-04-18 10:18:00',
  TIMESTAMP '2026-04-18 10:18:00',
  'u-admin',
  'u-admin'
);
