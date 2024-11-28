package de.equipli.inventory.jpa;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import de.equipli.inventory.views.Views;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
public class InventoryItem extends PanacheEntity {

    @JsonView(Views.Internal.class)
    private Long id;

    @JsonView(Views.Public.class)
    private String status;

    @JsonView(Views.Public.class)
    private String location;

    @ManyToOne
    @JsonIgnore
    private Category category;

    @Transient
    @JsonView(Views.Internal.class)
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}