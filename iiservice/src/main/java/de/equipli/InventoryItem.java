package de.equipli;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

@Entity
public class InventoryItem extends PanacheEntity {
    public long id;
    public String name;
    public String icon;
    public byte[] photo;
    public String urn;

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public String getUrn() {
        return urn;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public byte[] getPhoto() {
        return photo;
    }

    public void setPhoto(byte[] photo) {
        this.photo = photo;
    }

    public void setUrn(String urn) {
        this.urn = urn;
    }
}
