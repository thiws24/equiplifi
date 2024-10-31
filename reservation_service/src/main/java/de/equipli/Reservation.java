package de.equipli;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

import java.time.LocalDate;
import java.util.Date;


@Entity
public class Reservation extends PanacheEntity {
    public long id;
    public LocalDate startDate;
    public LocalDate endDate;

    public long itemId;

    public Reservation(LocalDate startDate, LocalDate endDate, long itemId) {
    }

    public long getId() {
        return id;
    }

    public long getItemId() {
        return itemId;
    }

    public void setItemId(long itemId) {
        this.itemId = itemId;
    }

    public void setId(long id) {
        this.id = id;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
