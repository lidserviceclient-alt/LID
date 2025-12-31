DROP TABLE IF EXISTS article_categories;
DROP TABLE IF EXISTS article;
DROP TABLE IF EXISTS category;

CREATE TABLE category (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    order_idx INTEGER
);

CREATE TABLE article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price INTEGER,
    img VARCHAR(500),
    ean VARCHAR(50),
    vat REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE article_categories (
    article_id BIGINT NOT NULL,
    categories_id INTEGER NOT NULL,
    PRIMARY KEY (article_id, categories_id),
    FOREIGN KEY (article_id) REFERENCES article(id),
    FOREIGN KEY (categories_id) REFERENCES category(id)
);
