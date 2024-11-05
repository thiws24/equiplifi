
    create sequence InventoryItem_SEQ start with 1 increment by 50;

    create table InventoryItem (
        id bigint not null,
        icon varchar(255),
        name varchar(255),
        photoUrl varchar(255),
        urn varchar(255),
        primary key (id)
    );
