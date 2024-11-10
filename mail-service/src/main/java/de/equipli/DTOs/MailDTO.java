package de.equipli.DTOs;


public class MailDTO {
    
    private String to;
    private String item;
    private String collectionDate;
    private String returnDate;

    public MailDTO() {
    }

    public MailDTO(String to, String item, String collectionDate, String returnDate) {
        this.to = to;
        this.item = item;
        this.collectionDate = collectionDate;
        this.returnDate = returnDate;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
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
}
