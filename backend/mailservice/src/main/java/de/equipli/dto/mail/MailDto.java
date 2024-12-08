package de.equipli.dto.mail;

import de.equipli.dto.inventoryservice.InventoryItemDto;
import de.equipli.dto.user.UserDto;

public class MailDto {
    private UserDto user;
    private InventoryItemDto inventoryItemDto;
    private String startDate;
    private String endDate;

    public MailDto() {
    }

    public MailDto(UserDto user, InventoryItemDto inventoryItemDto, String startDate, String endDate) {
        this.user = user;
        this.inventoryItemDto = inventoryItemDto;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public InventoryItemDto getInventoryItemDto() {
        return inventoryItemDto;
    }

    public void setInventoryItemDto(InventoryItemDto inventoryItemDto) {
        this.inventoryItemDto = inventoryItemDto;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
