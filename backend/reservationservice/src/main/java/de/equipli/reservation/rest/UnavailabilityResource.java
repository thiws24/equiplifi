package de.equipli.reservation.rest;

import de.equipli.reservation.jpa.Reservation;
import de.equipli.reservation.jpa.ReservationRepository;
import de.equipli.reservation.services.InventoryItem;
import de.equipli.reservation.services.InventoryService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/unavailability")
public class UnavailabilityResource {

    @Inject
    ReservationRepository reservationRepository;

    @Inject
    @RestClient
    InventoryService inventoryService;

    @GET
    @Path("/item/{itemId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, Object> getReservationTimeSlotsByItem(@PathParam("itemId") Long itemId) {
        List<Reservation> reservations = reservationRepository.findByItemId(itemId);
        List<Map<String, LocalDateTime>> unavailability = reservations.stream()
                .map(reservation -> Map.of(
                        "startDate", reservation.getStartDate().atStartOfDay(),
                        "endDate", reservation.getEndDate().atStartOfDay()))
                .collect(Collectors.toList());
        return Map.of(
                "itemId", itemId,
                "unavailability", unavailability
        );
    }

    @GET
    @Path("/category/{categoryId}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<Map<String, Object>> getReservationTimeSlotsByCategory(@PathParam("categoryId") Long categoryId) {
        List<InventoryItem> items = inventoryService.getInventoryItems(categoryId);

        List<Long> itemIds = items.stream()
                .map(InventoryItem::id)
                .toList();

        return itemIds.stream()
                .map(itemId -> {
                    List<Map<String, LocalDateTime>> unavailability = reservationRepository.findByItemId(itemId).stream()
                            .map(reservation -> Map.of(
                                    "startDate", reservation.getStartDate().atStartOfDay(),
                                    "endDate", reservation.getEndDate().atStartOfDay()))
                            .collect(Collectors.toList());
                    return Map.of(
                            "itemId", itemId,
                            "unavailability", unavailability
                    );
                })
                .collect(Collectors.toList());
    }

}
