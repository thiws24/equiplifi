
    create sequence Reservation_SEQ start with 1 increment by 50;

    create table Reservation (
        id bigint not null,
        startDate date,
        endDate date,
        itemId bigint,
        primary key (id)
    );
