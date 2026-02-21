CREATE TABLE `utilisateur` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `avatar_url` VARCHAR(255),
  `nom` VARCHAR(255),
  `prenom` VARCHAR(255),
  `email` VARCHAR(255) NOT NULL,
  `email_verifie` BOOLEAN DEFAULT false,
  `role` ENUM ('CLIENT', 'IT', 'SUSPENDU', 'SUPPRIME', 'PARTENAIRE', 'ADMIN', 'SUPER_ADMIN') NOT NULL,
  `telephone` VARCHAR(30),
  `ville` VARCHAR(100),
  `pays` VARCHAR(100),
  `date_creation` DATETIME(6),
  `date_mise_a_jour` DATETIME(6)
);

CREATE TABLE `authentification` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `utilisateur_id` CHAR(36) NOT NULL,
  `fournisseur` ENUM ('LOCAL', 'GOOGLE') NOT NULL,
  `identifiant_fournisseur` VARCHAR(255) NOT NULL,
  `mot_de_passe_hash` VARCHAR(255),
  `date_creation` DATETIME(6)
);

CREATE TABLE `boutique` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `partenaire_id` CHAR(36) UNIQUE NOT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `logo_url` VARCHAR(512),
  `background_url` VARCHAR(512),
  `statut` ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDUE') DEFAULT 'INACTIVE',
  `date_creation` DATETIME(6)
);

CREATE TABLE `categorie` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `parent_id` CHAR(36),
  `nom` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(512),
  `niveau` ENUM ('PRINCIPALE', 'SOUS_CATEGORIE', 'SOUS_SOUS_CATEGORIE') NOT NULL,
  `ordre` INT DEFAULT 0,
  `est_active` BOOLEAN DEFAULT true,
  `date_creation` DATETIME(6),
  `date_mise_a_jour` DATETIME(6)
);

CREATE TABLE `produit` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `boutique_id` CHAR(36) NOT NULL,
  `categorie_id` CHAR(36) NOT NULL,
  `reference_partenaire` VARCHAR(255) NOT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `marque` VARCHAR(255),
  `prix` DECIMAL(10,2) NOT NULL,
  `tva` DECIMAL(5,2),
  `remise_pourcent` DECIMAL(5,2),
  `statut` ENUM ('BROUILLON', 'ACTIF', 'ARCHIVE') DEFAULT 'ACTIF',
  `en_promo` BOOLEAN DEFAULT false,
  `promo_fin` DATETIME(6),
  `mis_en_avant` BOOLEAN DEFAULT false,
  `meilleur_vente` BOOLEAN DEFAULT false,
  `date_creation` DATETIME(6)
);

CREATE TABLE `produit_image` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `produit_id` CHAR(36) NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `est_principale` BOOLEAN DEFAULT false
);

CREATE TABLE `commentaire_produit` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `produit_id` CHAR(36) NOT NULL,
  `utilisateur_id` CHAR(36) NOT NULL,
  `commentaire` TEXT NOT NULL,
  `note` TINYINT COMMENT 'Valeur entre 1 et 5',
  `est_valide` BOOLEAN DEFAULT false,
  `date_creation` DATETIME(6)
);

CREATE TABLE `stock` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `produit_id` CHAR(36) NOT NULL,
  `quantite_disponible` INT NOT NULL,
  `quantite_reservee` INT DEFAULT 0,
  `date_peremption` DATE
);

CREATE TABLE `panier` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `client_id` CHAR(36),
  `date_creation` DATETIME(6)
);

CREATE TABLE `panier_ligne` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `panier_id` CHAR(36) NOT NULL,
  `produit_id` CHAR(36) NOT NULL,
  `quantite` INT NOT NULL,
  `prix_au_moment` DECIMAL(10,2)
);

CREATE TABLE `commande` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `client_id` CHAR(36) NOT NULL,
  `montant_total` DECIMAL(12,2) NOT NULL,
  `devise` VARCHAR(3) DEFAULT 'XOF',
  `statut` ENUM ('CREEE', 'PAYEE', 'EXPEDIEE', 'LIVREE', 'ANNULEE', 'REMBOURSEE') NOT NULL,
  `date_creation` DATETIME(6)
);

CREATE TABLE `commande_ligne` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `commande_id` CHAR(36) NOT NULL,
  `produit_id` CHAR(36),
  `quantite` INT,
  `prix_unitaire` DECIMAL(10,2)
);

CREATE TABLE `paiement` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `commande_id` CHAR(36),
  `fournisseur` VARCHAR(50),
  `montant` DECIMAL(19,2),
  `devise` VARCHAR(3),
  `statut` ENUM ('EN_ATTENTE', 'SUCCES', 'ECHEC', 'REMBOURSE'),
  `transaction_id` VARCHAR(255),
  `date_paiement` DATETIME(6)
);

CREATE TABLE `livraison` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `commande_id` CHAR(36) NOT NULL,
  `transporteur` VARCHAR(100),
  `numero_suivi` VARCHAR(255),
  `statut` ENUM ('EN_PREPARATION', 'EN_COURS', 'LIVREE', 'ECHEC'),
  `date_livraison_estimee` DATE,
  `date_livraison` DATETIME(6)
);

CREATE TABLE `code_promo` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `code` VARCHAR(12) NOT NULL,
  `description` VARCHAR(255),
  `pourcentage` DECIMAL(5,2) NOT NULL,
  `cible` ENUM ('GLOBAL','BOUTIQUE','UTILISATEUR') DEFAULT 'GLOBAL',
  `boutique_id` CHAR(36),
  `utilisateur_id` CHAR(36),
  `montant_min_commande` DECIMAL(10,2),
  `date_debut` DATETIME(6),
  `date_fin` DATETIME(6),
  `usage_max` INT,
  `usage_max_par_utilisateur` INT DEFAULT 1,
  `est_actif` BOOLEAN DEFAULT true,
  `date_creation` DATETIME(6)
);

CREATE TABLE `code_promo_utilisation` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `code_promo_id` CHAR(36) NOT NULL,
  `utilisateur_id` CHAR(36) NOT NULL,
  `commande_id` CHAR(36),
  `montant_reduction` DECIMAL(10,2) NOT NULL,
  `date_utilisation` DATETIME(6)
);

CREATE TABLE `systeme` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `cle` VARCHAR(120) NOT NULL,
  `valeur` VARCHAR(500) NOT NULL,
  `type` ENUM ('STRING','INT','DECIMAL','BOOLEAN','JSON') NOT NULL,
  `categorie` ENUM ('APPLICATION','BUSINESS','PAIEMENT','SECURITE','LIVRAISON','PROMOTION','NOTIFICATION','TECHNIQUE') NOT NULL,
  `description` VARCHAR(255),
  `est_actif` BOOLEAN DEFAULT true,
  `modifiable_admin` BOOLEAN DEFAULT true,
  `cacheable` BOOLEAN DEFAULT true,
  `date_creation` DATETIME(6),
  `date_mise_a_jour` DATETIME(6)
);

CREATE TABLE `blog_post` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `excerpt` TEXT,
  `content` TEXT,
  `image_url` VARCHAR(512),
  `category` VARCHAR(100),
  `date` DATETIME(6),
  `author` VARCHAR(120),
  `featured` BOOLEAN DEFAULT false,
  `read_time` VARCHAR(50)
);

CREATE TABLE `ticket_event` (
  `id` CHAR(36) PRIMARY KEY NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `date` DATETIME(6),
  `location` VARCHAR(200),
  `price` DECIMAL(12,2),
  `image_url` VARCHAR(512),
  `category` VARCHAR(100),
  `available` BOOLEAN DEFAULT true,
  `description` TEXT
);

CREATE UNIQUE INDEX `uk_utilisateur_email` ON `utilisateur` (`email`);

CREATE UNIQUE INDEX `uk_auth_unique` ON `authentification` (`fournisseur`, `identifiant_fournisseur`);

CREATE UNIQUE INDEX `uk_categorie_slug` ON `categorie` (`slug`);

CREATE UNIQUE INDEX `uk_produit_slug` ON `produit` (`slug`);

CREATE UNIQUE INDEX `uk_produit_ref` ON `produit` (`reference_partenaire`);

CREATE UNIQUE INDEX `uk_commentaire_unique` ON `commentaire_produit` (`produit_id`, `utilisateur_id`);

CREATE UNIQUE INDEX `uk_code_promo_code` ON `code_promo` (`code`);

CREATE UNIQUE INDEX `uk_systeme_cle` ON `systeme` (`cle`);

CREATE INDEX `idx_commentaire_produit` ON `commentaire_produit` (`produit_id`);

CREATE INDEX `idx_commentaire_utilisateur` ON `commentaire_produit` (`utilisateur_id`);

ALTER TABLE `commentaire_produit` ADD FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`);

ALTER TABLE `commentaire_produit` ADD FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`);

ALTER TABLE `authentification` ADD FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE;

ALTER TABLE `boutique` ADD FOREIGN KEY (`partenaire_id`) REFERENCES `utilisateur` (`id`);

ALTER TABLE `categorie` ADD CONSTRAINT `fk_categorie_parent` FOREIGN KEY (`parent_id`) REFERENCES `categorie` (`id`) ON DELETE CASCADE;

ALTER TABLE `produit` ADD FOREIGN KEY (`boutique_id`) REFERENCES `boutique` (`id`);

ALTER TABLE `produit` ADD FOREIGN KEY (`categorie_id`) REFERENCES `categorie` (`id`);

ALTER TABLE `produit_image` ADD FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`) ON DELETE CASCADE;

ALTER TABLE `stock` ADD FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`) ON DELETE CASCADE;

ALTER TABLE `panier` ADD FOREIGN KEY (`client_id`) REFERENCES `utilisateur` (`id`) ON DELETE SET NULL;

ALTER TABLE `panier_ligne` ADD FOREIGN KEY (`panier_id`) REFERENCES `panier` (`id`) ON DELETE CASCADE;

ALTER TABLE `panier_ligne` ADD FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`);

ALTER TABLE `commande` ADD FOREIGN KEY (`client_id`) REFERENCES `utilisateur` (`id`);

ALTER TABLE `commande_ligne` ADD FOREIGN KEY (`commande_id`) REFERENCES `commande` (`id`) ON DELETE CASCADE;

ALTER TABLE `commande_ligne` ADD FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`);

ALTER TABLE `paiement` ADD FOREIGN KEY (`commande_id`) REFERENCES `commande` (`id`);

ALTER TABLE `livraison` ADD FOREIGN KEY (`commande_id`) REFERENCES `commande` (`id`);

ALTER TABLE `code_promo` ADD FOREIGN KEY (`boutique_id`) REFERENCES `boutique` (`id`);

ALTER TABLE `code_promo` ADD FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`);

ALTER TABLE `code_promo_utilisation` ADD FOREIGN KEY (`code_promo_id`) REFERENCES `code_promo` (`id`) ON DELETE CASCADE;

ALTER TABLE `code_promo_utilisation` ADD FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`);

ALTER TABLE `code_promo_utilisation` ADD FOREIGN KEY (`commande_id`) REFERENCES `commande` (`id`);

INSERT INTO `utilisateur` (`id`, `avatar_url`, `nom`, `prenom`, `email`, `email_verifie`, `role`, `telephone`, `ville`, `pays`, `date_creation`, `date_mise_a_jour`) VALUES
('u-admin-001', NULL, 'Admin', 'Super', 'admin@demo.com', TRUE, 'SUPER_ADMIN', NULL, 'Paris', 'France', NOW(), NOW()),
('u-client-001', NULL, 'Doe', 'John', 'john@demo.com', TRUE, 'CLIENT', '+33600000000', 'Abidjan', 'Côte d’Ivoire', NOW(), NOW()),
('u-part-001', NULL, 'Shop', 'Partner', 'partner@demo.com', TRUE, 'PARTENAIRE', '+22501020304', 'Abidjan', 'Côte d’Ivoire', NOW(), NOW());

INSERT INTO `authentification` (`id`, `utilisateur_id`, `fournisseur`, `identifiant_fournisseur`, `mot_de_passe_hash`, `date_creation`) VALUES
('auth-001', 'u-admin-001', 'LOCAL', 'admin@demo.com', '$2b$10$hashadmin', NOW()),
('auth-002', 'u-client-001', 'LOCAL', 'john@demo.com', '$2b$10$hashclient', NOW()),
('auth-003', 'u-part-001', 'GOOGLE', 'google-oauth-id-123', NULL, NOW());

INSERT INTO `boutique` (`id`, `partenaire_id`, `nom`, `description`, `logo_url`, `background_url`, `statut`, `date_creation`) VALUES
('b-001', 'u-part-001', 'Boutique Démo', 'Boutique de démonstration', NULL, NULL, 'ACTIVE', NOW());

INSERT INTO `categorie` (`id`, `parent_id`, `nom`, `slug`, `image_url`, `niveau`, `ordre`, `est_active`, `date_creation`, `date_mise_a_jour`) VALUES
('cat-001', NULL, 'Électronique', 'electronique', NULL, 'PRINCIPALE', 1, TRUE, NOW(), NOW()),
('cat-002', 'cat-001', 'Téléphones', 'telephones', NULL, 'SOUS_CATEGORIE', 1, TRUE, NOW(), NOW());

INSERT INTO `produit` (`id`, `boutique_id`, `categorie_id`, `reference_partenaire`, `nom`, `slug`, `description`, `marque`, `prix`, `tva`, `remise_pourcent`, `statut`, `en_promo`, `promo_fin`, `mis_en_avant`, `meilleur_vente`, `date_creation`) VALUES
('p-001', 'b-001', 'cat-002', 'REF-IPHONE-01', 'iPhone Démo', 'iphone-demo', 'Téléphone de démonstration', 'Apple', 500000.00, 18.00, NULL, 'ACTIF', FALSE, NULL, FALSE, FALSE, NOW());

INSERT INTO `produit_image` (`id`, `produit_id`, `url`, `est_principale`) VALUES
('img-001', 'p-001', 'https://picsum.photos/600/600', TRUE);

INSERT INTO `stock` (`id`, `produit_id`, `quantite_disponible`, `quantite_reservee`) VALUES
('stk-001', 'p-001', 50, 0);

INSERT INTO `panier` (`id`, `client_id`, `date_creation`) VALUES
('pan-001', 'u-client-001', NOW());

INSERT INTO `panier_ligne` (`id`, `panier_id`, `produit_id`, `quantite`, `prix_au_moment`) VALUES
('pl-001', 'pan-001', 'p-001', 2, 500000.00);

INSERT INTO `commande` (`id`, `client_id`, `montant_total`, `devise`, `statut`, `date_creation`) VALUES
('cmd-001', 'u-client-001', 1000000.00, 'XOF', 'PAYEE', NOW());

INSERT INTO `commande_ligne` (`id`, `commande_id`, `produit_id`, `quantite`, `prix_unitaire`) VALUES
('cl-001', 'cmd-001', 'p-001', 2, 500000.00);

INSERT INTO `code_promo` (`id`, `code`, `description`, `pourcentage`, `cible`, `boutique_id`, `utilisateur_id`, `montant_min_commande`, `date_debut`, `date_fin`, `usage_max`, `usage_max_par_utilisateur`, `est_actif`, `date_creation`) VALUES
('promo-001', 'WELCOME10', 'Réduction de bienvenue', 10.00, 'GLOBAL', NULL, NULL, 100000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, 1, TRUE, NOW());

INSERT INTO `code_promo_utilisation` (`id`, `code_promo_id`, `utilisateur_id`, `commande_id`, `montant_reduction`, `date_utilisation`) VALUES
('cpu-001', 'promo-001', 'u-client-001', 'cmd-001', 100000.00, NOW());

INSERT INTO `paiement` (`id`, `commande_id`, `fournisseur`, `montant`, `devise`, `statut`, `transaction_id`, `date_paiement`) VALUES
('pay-001', 'cmd-001', 'PAYDUNYA', 1000000.00, 'XOF', 'SUCCES', 'TXN123456', NOW());

INSERT INTO `livraison` (`id`, `commande_id`, `transporteur`, `numero_suivi`, `statut`, `date_livraison_estimee`, `date_livraison`) VALUES
('liv-001', 'cmd-001', 'DHL', 'TRACK123', 'EN_COURS', DATE_ADD(CURDATE(), INTERVAL 3 DAY), NULL);

INSERT INTO `systeme` (`id`, `cle`, `valeur`, `type`, `categorie`, `description`, `est_actif`, `modifiable_admin`, `cacheable`, `date_creation`, `date_mise_a_jour`) VALUES
('sys-001', 'APP_NAME', 'LID Platform', 'STRING', 'APPLICATION', 'Nom de l’application', TRUE, TRUE, TRUE, NOW(), NOW()),
('sys-002', 'PAYMENT_TIMEOUT', '30', 'INT', 'PAIEMENT', 'Timeout paiement (minutes)', TRUE, TRUE, TRUE, NOW(), NOW()),
('sys-003', 'DELIVERY_ENABLED', 'true', 'BOOLEAN', 'LIVRAISON', 'Livraison activée', TRUE, TRUE, FALSE, NOW(), NOW());
