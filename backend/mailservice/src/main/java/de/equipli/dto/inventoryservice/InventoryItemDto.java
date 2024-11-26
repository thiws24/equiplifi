package de.equipli.dto.inventoryservice;

public class InventoryItemDto {
    private int id;
    private String name;
    private String photoUrl;
    private String icon;
    private String urn;

    public InventoryItemDto(int id, String name, String photoUrl, String icon, String urn) {
        this.id = id;
        this.name = name;
        this.photoUrl = photoUrl;
        this.icon = icon;
        this.urn = urn;
    }

    public InventoryItemDto() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    @Override
    public String toString(){
        return "InventoryItemDto{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", photoUrl='" + photoUrl + '\'' +
                ", icon='" + icon + '\'' +
                ", urn='" + urn + '\'' +
                '}';
    }
}
