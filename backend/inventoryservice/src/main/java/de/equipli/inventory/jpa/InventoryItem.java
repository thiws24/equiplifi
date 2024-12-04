package de.equipli.inventory.jpa;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
public class InventoryItem extends PanacheEntity {

    @Enumerated(EnumType.STRING)
    private ItemStatus status;
    private String location;

    @ManyToOne
    @JsonIgnore
    private Category category;

    @Transient
    @Schema(hidden = true)
    public String getUrn() {
        return "urn:de.equipli:item:" + this.id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @JsonIgnore
    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}