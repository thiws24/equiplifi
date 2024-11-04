package de.equipli;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Base64;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class ReservationResourceTest {
    @Test
    void testAddReservation() {
        // Testdata for 4 cases
        // case 1: positive test - add Reservation
        LocalDate startDate1 = LocalDate.now();
        LocalDate endDate1 = LocalDate.now().plusDays(10);
        Long itemId1 = 1L;
        Reservation reservation = new Reservation();
        reservation.setStartDate(startDate1);
        reservation.setEndDate(endDate1);
        reservation.setItemId(itemId1);
        given()
                .contentType(ContentType.JSON)
                .body(reservation)
                .when()
                .post("/api/reservations/")
                .then()
                .statusCode(201);
    }

    @Test
    void testAddReservation_EndDateBeforeStartDate() {

        // case 2: negative test - startDate >, endDate <

        LocalDate startDate2 = LocalDate.now().plusDays(2);
        LocalDate endDate2 = LocalDate.now().plusDays(12);
        Long itemId2 = 1L;

        // case 2
        Reservation reservation2 = new Reservation();
        reservation2.setStartDate(startDate2);
        reservation2.setEndDate(endDate2);
        reservation2.setItemId(itemId2);

        given()
                .contentType(ContentType.JSON)
                .body(reservation2)
                .when()
                .post("/api/reservations/")
                .then()
                .statusCode(400)
                .body(is("Das Item ist in diesem Zeitraum nicht verfügbar"));
    }


    @Test
    void testAddReservation_StartDateInPast() {

        // case 3: negative test - startDate <, endDate >
        LocalDate startDate3 = LocalDate.now().minusDays(10);
        LocalDate endDate3 = LocalDate.now().plusDays(2);
        Long itemId3 = 1L;

        Reservation reservation3 = new Reservation();
        reservation3.setStartDate(startDate3);
        reservation3.setEndDate(endDate3);
        reservation3.setItemId(itemId3);

        given()
                .contentType(ContentType.JSON)
                .body(reservation3)
                .when()
                .post("/api/reservations/")
                .then()
                .statusCode(400)
                .body(is("End-Datum muss vor Start-Datum liegen!"));
    }

    @Test
    void testAddReservation_StartAndEndDateInFuture() {

        // case 4: positive test - startDate >, endDate >
        LocalDate startDate4 = LocalDate.now().plusDays(20);
        LocalDate endDate4 = LocalDate.now().plusDays(30);
        Long itemId4 = 1L;

        // case 4
        Reservation reservation4 = new Reservation();
        reservation4.setStartDate(startDate4);
        reservation4.setEndDate(endDate4);
        reservation4.setItemId(itemId4);

        given()
                .contentType(ContentType.JSON)
                .body(reservation4)
                .when()
                .post("/api/reservations/")
                .then()
                .statusCode(201);
    }
}