package de.equipli.dto.mail;


public class CollectMailCreateDto {
    
    private String userId;
    private String itemId;
    private String startDate;
    private String endDate;

    public CollectMailCreateDto(String receiverMail, String itemId, String startDate, String endDate) {
        this.userId = receiverMail;
        this.itemId = itemId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public CollectMailCreateDto() {
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
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
