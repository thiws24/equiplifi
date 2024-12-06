package de.equipli.reservation.rest;

import de.equipli.reservation.jpa.Reservation;
import de.equipli.reservation.jpa.ReservationRepository;
import de.equipli.reservation.services.InventoryItem;
import de.equipli.reservation.services.InventoryService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Path("/availability")
public class AvailabilityResource {

    private final ReservationRepository reservationRepository;
    private final InventoryService inventoryService;

    @Inject
    public AvailabilityResource(ReservationRepository reservationRepository, @RestClient InventoryService inventoryService) {
        this.reservationRepository = reservationRepository;
        this.inventoryService = inventoryService;
    }

    @GET
    @Path("/reservations/items/{itemId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get reservation time slots by item", description = "Returns a list of time slots that are unavailable for the given item.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Reservations found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "No reservations found", content = @Content(mediaType = "application/json"))
    })
    public Map<String, Object> getReservationTimeSlotsByItem(@PathParam("itemId") Long itemId) {
        List<Reservation> reservations = reservationRepository.findByItemId(itemId);

        if (reservations.isEmpty()) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("No reservations found for item " + itemId).build());
        }

        List<Map<String, LocalDateTime>> unavailability = reservations.stream()
                .map(reservation -> Map.of(
                        "startDate", reservation.getStartDate().atStartOfDay(),
                        "endDate", reservation.getEndDate().atStartOfDay()))
                .toList();
        return Map.of(
                "itemId", itemId,
                "reservations", unavailability
        );
    }

    @GET
    @Path("/reservations/categories/{categoryId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get reservation time slots by category", description = "Returns a list of time slots that are unavailable for the given category.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Reservations found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json"))
    })
    public Response getReservationTimeSlotsByCategory(@PathParam("categoryId") Long categoryId) {
        try {
            List<InventoryItem> items = inventoryService.getInventoryItems(categoryId);

            List<Long> itemIds = items.stream()
                    .map(InventoryItem::id)
                    .toList();

            List<Map<String, Object>> unavailability = itemIds.stream()
                    .map(itemId -> {
                        List<Map<String, LocalDateTime>> unavailabilityForItem = reservationRepository.findByItemId(itemId).stream()
                                .map(reservation -> Map.of(
                                        "startDate", reservation.getStartDate().atStartOfDay(),
                                        "endDate", reservation.getEndDate().atStartOfDay()))
                                .toList();
                        return Map.of(
                                "itemId", itemId,
                                "reservations", unavailabilityForItem
                        );
                    })
                    .toList();

            return Response.ok(unavailability).build();
        } catch (Exception e) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + categoryId + " not found").build());
        }
    }

    @GET
    @Path("/categories/{categoryId}/items")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get available items by category and date range", description = "Returns a list of available items for the given category and date range.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Available items found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json"))
    })
    public Response getAvailableItemsByCategoryAndDateRange(@PathParam("categoryId") Long categoryId,
                                                            @QueryParam("startDate") String startDate,
                                                            @QueryParam("endDate") String endDate) {
        try {
            List<InventoryItem> items = inventoryService.getInventoryItems(categoryId);

            List<Long> itemIds = items.stream()
                    .map(InventoryItem::id)
                    .toList();

            List<Long> unavailableItemIds = itemIds.stream()
                    .filter(itemId -> reservationRepository.findByItemId(itemId).stream()
                            .anyMatch(reservation ->
                                    (LocalDate.parse(startDate).isBefore(reservation.getEndDate()) && LocalDate.parse(endDate).isAfter(reservation.getStartDate()))))
                    .toList();

            List<InventoryItem> availableItems = items.stream()
                    .filter(item -> !unavailableItemIds.contains(item.id()))
                    .toList();

            return Response.ok(availableItems).build();
        } catch (Exception e) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + categoryId + " not found").build());
        }
    }

}
