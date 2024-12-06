package de.equipli.inventory.rest.dto;

import de.equipli.inventory.jpa.ItemStatus;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

public class InventoryItemWithCategoryDTO {

    @Schema(defaultValue = "1")
    private Long id;
    @Schema(defaultValue = "1")
    private Long categoryId;
    private String name;
    private String description;
    private String icon;
    private String photoUrl;
    private ItemStatus status;
    private String location;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
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
