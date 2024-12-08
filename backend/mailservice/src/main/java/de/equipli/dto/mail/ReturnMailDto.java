package de.equipli.dto.mail;

@Deprecated
public class ReturnMailDto {
    private String receiverMail;
    private String name;
    private String item;
    private String returnDate;
    private String returnLocation;

    public ReturnMailDto(String receiverMail, String name, String item, String returnDate, String returnLocation) {
        this.receiverMail = receiverMail;
        this.name = name;
        this.item = item;
        this.returnDate = returnDate;
        this.returnLocation = returnLocation;
    }

    public ReturnMailDto() {
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

    public String getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(String returnDate) {
        this.returnDate = returnDate;
    }

    public String getReturnLocation() {
        return returnLocation;
    }

    public void setReturnLocation(String returnLocation) {
        this.returnLocation = returnLocation;
    }
}
