package de.equipli.reservation;

import de.equipli.reservation.jpa.Reservation;
import de.equipli.reservation.jpa.ReservationRepository;
import de.equipli.reservation.jpa.ReservationStatus;
import de.equipli.reservation.rest.AvailabilityResource;
import de.equipli.reservation.services.InventoryItem;
import de.equipli.reservation.services.InventoryService;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;


@QuarkusTest
class ReservationResourceTest {

@Mock
private ReservationRepository reservationRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private AvailabilityResource availabilityResource;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testAddReservation() {
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.now().plusDays(10));
        reservation.setEndDate(LocalDate.now().plusDays(15));
        reservation.setItemId(3L);
        reservation.setUserId("user1");

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
    @TestSecurity(user = "Bob", roles = {"user"})
    void testAddReservationWithInvalidDates() {
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.now().plusDays(5));
        reservation.setEndDate(LocalDate.now().plusDays(1));
        reservation.setItemId(1L);
        reservation.setUserId("user1");

        given()
                .contentType(ContentType.JSON)
                .body(reservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(400);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testAddReservationWithPastStartDate() {
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.now().minusDays(1));
        reservation.setEndDate(LocalDate.now().plusDays(5));
        reservation.setItemId(1L);
        reservation.setUserId("user1");

        given()
                .contentType(ContentType.JSON)
                .body(reservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(400);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testAddReservationWithOverlap() {
        // Erst eine bestehende Reservierung hinzufügen
        Reservation existingReservation = new Reservation();
        existingReservation.setStartDate(LocalDate.now().plusDays(20));
        existingReservation.setEndDate(LocalDate.now().plusDays(25));
        existingReservation.setItemId(1L);
        existingReservation.setStatus(ReservationStatus.ACTIVE);
        existingReservation.setUserId("user1");

        given()
                .contentType(ContentType.JSON)
                .body(existingReservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(201);

        // Überlappende Reservierung hinzufügen
        Reservation newReservation = new Reservation();
        newReservation.setStartDate(LocalDate.now().plusDays(23));
        newReservation.setEndDate(LocalDate.now().plusDays(27));
        newReservation.setItemId(1L);
        newReservation.setStatus(ReservationStatus.ACTIVE);
        newReservation.setUserId("user1");

        given()
                .contentType(ContentType.JSON)
                .body(newReservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(400);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetReservations() {
        given()
                .when()
                .get("/reservations")
                .then()
                .statusCode(200);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testUpdateReservations() {
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.now().plusDays(10));
        reservation.setEndDate(LocalDate.now().plusDays(15));
        reservation.setStatus(null);
        reservation.setItemId(1L);
        reservation.setUserId("user1");

        int id = given()
                .contentType(ContentType.JSON)
                .body(reservation)
                .when()
                .post("/reservations")
                .then()
                .statusCode(201)
                .extract().path("id");

        Reservation updatedItem = new Reservation();
        updatedItem.setStartDate(LocalDate.now().plusDays(10));
        updatedItem.setEndDate(LocalDate.now().plusDays(15));
        updatedItem.setItemId(1L);
        updatedItem.setUserId("user1");
        updatedItem.setStatus(ReservationStatus.CANCELLED);

        given()
                .contentType(ContentType.JSON)
                .body(updatedItem)
                .when()
                .put("/reservations/" + id)
                .then()
                .statusCode(200)
                .body("status", is("CANCELLED"));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetReservationTimeSlotsByItem() {
        Long itemId = 1L;
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.now().plusDays(1));
        reservation.setEndDate(LocalDate.now().plusDays(10));
        when(reservationRepository.findByItemId(itemId)).thenReturn(List.of(reservation));

        Map<String, Object> response = availabilityResource.getReservationTimeSlotsByItem(itemId);

        assertEquals(itemId, response.get("itemId"));
        List<Map<String, LocalDateTime>> reservations = (List<Map<String, LocalDateTime>>) response.get("reservations");
        assertEquals(1, reservations.size());
        assertEquals(LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0).truncatedTo(ChronoUnit.MINUTES), reservations.getFirst().get("startDate"));
        assertEquals(LocalDateTime.now().plusDays(10).withHour(0).withMinute(0).withSecond(0).truncatedTo(ChronoUnit.MINUTES), reservations.getFirst().get("endDate"));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetReservationTimeSlotsByCategory() {
        Long categoryId = 1L;
        InventoryItem item1 = new InventoryItem(1L, "AVAILABLE", "Location 1");
        InventoryItem item2 = new InventoryItem(2L, "AVAILABLE", "Location 2");
        when(inventoryService.getInventoryItems(categoryId, "dummyToken")).thenReturn(List.of(item1, item2));

        Reservation reservation1 = new Reservation();
        reservation1.setStartDate(LocalDate.now().plusDays(1));
        reservation1.setEndDate(LocalDate.now().plusDays(10));
        Reservation reservation2 = new Reservation();
        reservation2.setStartDate(LocalDate.now().plusDays(5));
        reservation2.setEndDate(LocalDate.now().plusDays(15));
        when(reservationRepository.findByItemId(1L)).thenReturn(List.of(reservation1));
        when(reservationRepository.findByItemId(2L)).thenReturn(List.of(reservation2));

        Response response = availabilityResource.getReservationTimeSlotsByCategory(categoryId, "dummyToken");

        assertEquals(200, response.getStatus());
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.getEntity();
        assertEquals(2, items.size());
        assertEquals(1L, items.getFirst().get("itemId"));
        List<Map<String, LocalDateTime>> reservations1 = (List<Map<String, LocalDateTime>>) items.get(0).get("reservations");
        assertEquals(1, reservations1.size());
        assertEquals(LocalDate.now().plusDays(1).atStartOfDay().truncatedTo(ChronoUnit.MINUTES), reservations1.getFirst().get("startDate"));
        assertEquals(LocalDate.now().plusDays(10).atStartOfDay().truncatedTo(ChronoUnit.MINUTES), reservations1.getFirst().get("endDate"));
        assertEquals(2L, items.get(1).get("itemId"));
        List<Map<String, LocalDateTime>> reservations2 = (List<Map<String, LocalDateTime>>) items.get(1).get("reservations");
        assertEquals(1, reservations2.size());
        assertEquals(LocalDate.now().plusDays(5).atStartOfDay().truncatedTo(ChronoUnit.MINUTES), reservations2.getFirst().get("startDate"));
        assertEquals(LocalDate.now().plusDays(15).atStartOfDay().truncatedTo(ChronoUnit.MINUTES), reservations2.getFirst().get("endDate"));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetAvailableItemsByCategoryAndDateRange() {
        String startDate = LocalDate.now().plusDays(10).toString();
        String endDate = LocalDate.now().plusDays(15).toString();
        Long categoryId = 1L;

        InventoryItem item1 = new InventoryItem(1L, "AVAILABLE", "Location 1");
        InventoryItem item2 = new InventoryItem(2L, "AVAILABLE", "Location 2");
        when(inventoryService.getInventoryItems(categoryId, "dummyToken")).thenReturn(List.of(item1, item2));

        Reservation reservation1 = new Reservation();
        reservation1.setStartDate(LocalDate.now().plusDays(5));
        reservation1.setEndDate(LocalDate.now().plusDays(12));
        reservation1.setItemId(1L);
        Reservation reservation2 = new Reservation();
        reservation2.setStartDate(LocalDate.now().plusDays(20));
        reservation2.setEndDate(LocalDate.now().plusDays(25));
        reservation2.setItemId(2L);
        when(reservationRepository.findByItemId(1L)).thenReturn(List.of(reservation1));
        when(reservationRepository.findByItemId(2L)).thenReturn(List.of(reservation2));

        Response response = availabilityResource.getAvailableItemsByCategoryAndDateRange(categoryId, startDate, endDate, "dummyToken");

        assertEquals(200, response.getStatus());
        List<InventoryItem> items = (List<InventoryItem>) response.getEntity();
        assertEquals(1, items.size());
        assertEquals(2L, items.getFirst().id());
    }

}