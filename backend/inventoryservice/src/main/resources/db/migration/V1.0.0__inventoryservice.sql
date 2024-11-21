CREATE SEQUENCE IF NOT EXISTS InventoryItem_SEQ START WITH 1 INCREMENT BY 50;

CREATE TABLE InventoryItem (
    id BIGINT NOT NULL,
    name VARCHAR(255),
    description VARCHAR(255),
    icon VARCHAR(255),
    photoUrl VARCHAR(255),
    urn VARCHAR(255),
    PRIMARY KEY (id)
);