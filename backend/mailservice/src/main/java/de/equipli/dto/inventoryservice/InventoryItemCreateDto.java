package de.equipli.dto.inventoryservice;

public class InventoryItemCreateDto {

    private String name;
    private String photoUrl;
    private String icon;
    private String urn;

    public InventoryItemCreateDto(String name, String photoUrl, String icon, String urn) {
        this.name = name;
        this.photoUrl = photoUrl;
        this.icon = icon;
        this.urn = urn;
    }

    public InventoryItemCreateDto() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getUrn() {
        return urn;
    }

    public void setUrn(String urn) {
        this.urn = urn;
    }
}
