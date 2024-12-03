package de.equipli.reservation;

import de.equipli.reservation.jpa.Reservation;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class ReservationResourceTest {

    @Test
    void testAddReservation() {
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.now().plusDays(10));
        reservation.setEndDate(LocalDate.now().plusDays(15));
        reservation.setItemId(1L);

        given()
                .contentType(ContentType.JSON)
                .body(reservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(201)
                .body("startDate", is(reservation.getStartDate().toString()))
                .body("endDate", is(reservation.getEndDate().toString()))
                .body("itemId", is(reservation.getItemId().intValue()));
    }

    @Test
    void testAddReservationWithInvalidDates() {
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.now().plusDays(5));
        reservation.setEndDate(LocalDate.now().plusDays(1));
        reservation.setItemId(1L);

        given()
                .contentType(ContentType.JSON)
                .body(reservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(400);
    }

    @Test
    void testAddReservationWithPastStartDate() {
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.now().minusDays(1));
        reservation.setEndDate(LocalDate.now().plusDays(5));
        reservation.setItemId(1L);

        given()
                .contentType(ContentType.JSON)
                .body(reservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(400);
    }

    @Test
    void testAddReservationWithOverlap() {
        // Erst eine bestehende Reservierung hinzufügen
        Reservation existingReservation = new Reservation();
        existingReservation.setStartDate(LocalDate.now().plusDays(1));
        existingReservation.setEndDate(LocalDate.now().plusDays(5));
        existingReservation.setItemId(1L);

        given()
                .contentType(ContentType.JSON)
                .body(existingReservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(201);

        // Überlappende Reservierung hinzufügen
        Reservation newReservation = new Reservation();
        newReservation.setStartDate(LocalDate.now().plusDays(3));
        newReservation.setEndDate(LocalDate.now().plusDays(7));
        newReservation.setItemId(1L);

        given()
                .contentType(ContentType.JSON)
                .body(newReservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(400);
    }

    @Test
    void testGetReservations() {
        given()
                .when()
                .get("/reservations")
                .then()
                .statusCode(200);
    }

    @Test
    void testUpdateReservations() {
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.now().plusDays(10));
        reservation.setEndDate(LocalDate.now().plusDays(15));
        reservation.setStatus("");

        int id = given()
                .contentType(ContentType.JSON)
                .body(reservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(201)
                .extract().path("id");

        Reservation updatedItem = new Reservation();
        updatedItem.setStatus("CANCELLED");

        given()
                .contentType(ContentType.JSON)
                .body(updatedItem)
                .when()
                .put("/reservations/" + id)
                .then()
                .statusCode(200)
                .body("status", is("CANCELLED"));
    }
}