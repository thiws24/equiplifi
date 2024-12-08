package de.equipli.dto.mail;


//{
//  "itemId": "1",
//  "startDate": "2024-11-28",
//  "endDate": "2024-11-30",
//  "userId": "user_1",
//  "reservationId": "123"
//}

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MailCreateDto {

    private String itemId;
    private String startDate;
    private String endDate;
    private String userId;
    private String reservationId;

    public MailCreateDto() {
    }

    public MailCreateDto(String itemId, String startDate, String endDate, String userId, String reservationId) {
        this.itemId = itemId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.userId = userId;
        this.reservationId = reservationId;
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }
}
