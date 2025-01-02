package de.equipli.inventory.rest.dto;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

public class CreateCategoryRequest {

    private String name;
    private String description;
    private String icon;
    private String photoUrl;

    @Schema(defaultValue = "5")
    private Long itemCount;

    private String itemLocation;

    public CreateCategoryRequest() {
        // This constructor is intentionally left empty.
        // It is required for deserialization purposes.
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

    public Long getItemCount() {
        return itemCount;
    }

    public void setItemCount(Long itemCount) {
        this.itemCount = itemCount;
    }

    public String getItemLocation() {
        return itemLocation;
    }

    public void setItemLocation(String itemLocation) {
        this.itemLocation = itemLocation;
    }

}
