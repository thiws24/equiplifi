package de.equipli.inventory.rest.dto;

import de.equipli.inventory.jpa.ItemStatus;

public class CreateInventoryItemRequest {

    private String location;
    private ItemStatus status;

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

}
