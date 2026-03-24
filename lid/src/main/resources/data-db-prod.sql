-- ================================================
-- POSTGRES LOCAL SEED (db-prod profile)
-- SUPER_ADMIN: admin@lid.fr / admin (BCrypt stored)
-- Idempotent script
-- ================================================

-- user_entity
INSERT INTO user_entity (
    user_id, first_name, last_name, email, email_verified, blocked, created_at, updated_at, created_by, updated_by
) VALUES (
    'u-admin', 'Super', 'Admin', 'admin@lid.fr', TRUE, FALSE, NOW(), NOW(), NULL, NULL
)
ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    blocked = EXCLUDED.blocked,
    updated_at = NOW();

-- authentication (LOCAL, password=admin)
INSERT INTO authentication (
    user_id, type, password_hash, created_at, updated_at, created_by, updated_by
) VALUES (
    'u-admin', 'LOCAL', '$2b$10$VdqC45am9tKOgZSKU4CAYuKhG0Mlk6fbR1aFxW0qZFo/5pFPHC6dS', NOW(), NOW(), NULL, NULL
)
ON CONFLICT (user_id) DO UPDATE SET
    type = EXCLUDED.type,
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- roles
DELETE FROM authentication_roles WHERE authentication_user_id = 'u-admin';
INSERT INTO authentication_roles (authentication_user_id, roles) VALUES
    ('u-admin', 'SUPER_ADMIN'),
    ('u-admin', 'ADMIN');
