package de.equipli.dto;


public class CollectMailDto {
    
    private String receiverMail;
    private String name;
    private String item;
    private String collectionDate;
    private String returnDate;
    private String pickupLocation;

    public CollectMailDto(String receiverMail, String name, String item, String collectionDate, String returnDate, String pickupLocation) {
        this.receiverMail = receiverMail;
        this.name = name;
        this.item = item;
        this.collectionDate = collectionDate;
        this.returnDate = returnDate;
        this.pickupLocation = pickupLocation;
    }

    public CollectMailDto() {
    }

    public String getReceiverMail() {
        return receiverMail;
    }

    public void setReceiverMail(String receiverMail) {
        this.receiverMail = receiverMail;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public String getCollectionDate() {
        return collectionDate;
    }

    public void setCollectionDate(String collectionDate) {
        this.collectionDate = collectionDate;
    }

    public String getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(String returnDate) {
        this.returnDate = returnDate;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }
}
