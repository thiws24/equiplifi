package de.equipli;


import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
public class InventoryItem extends PanacheEntity {

    @Schema(hidden = true)
    public long id;
    public String name;
    public String icon;
    public String photoUrl;
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

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public void setUrn(String urn) {
        this.urn = urn;
    }
}
