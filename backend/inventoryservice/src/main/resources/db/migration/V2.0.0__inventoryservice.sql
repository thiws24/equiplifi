CREATE SEQUENCE IF NOT EXISTS Category_SEQ START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE IF NOT EXISTS InventoryItem_SEQ START WITH 1 INCREMENT BY 50;

CREATE TABLE Category (
    id BIGINT NOT NULL,
    name VARCHAR(255),
    description VARCHAR(255),
    icon VARCHAR(255),
    photoUrl VARCHAR(255),
    PRIMARY KEY (id)
);

ALTER TABLE InventoryItem
DROP COLUMN name,
    DROP COLUMN icon,
    DROP COLUMN photoUrl,
    DROP COLUMN urn,
    DROP COLUMN description;

ALTER TABLE InventoryItem
    RENAME COLUMN itemStatus TO status;

ALTER TABLE InventoryItem
    ADD COLUMN category_id BIGINT,
    ADD COLUMN location VARCHAR(255);

ALTER TABLE InventoryItem
    ADD CONSTRAINT FK8io38blkwclcvky4o7a3gl4l9
        FOREIGN KEY (category_id)
            REFERENCES Category(id);
