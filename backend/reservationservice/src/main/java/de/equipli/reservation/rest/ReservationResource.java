package de.equipli.reservation.rest;

import de.equipli.reservation.jpa.ReservationRepository;
import de.equipli.reservation.jpa.Reservation;
import de.equipli.reservation.jpa.ReservationStatus;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;

import java.time.LocalDate;
import java.util.List;

@Authenticated
@Path("/reservations")
public class ReservationResource {

    private final ReservationRepository reservationRepository;

    @Inject
    public ReservationResource(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get all reservations", description = "Returns a list of all reservations.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Reservations found", content = @Content(mediaType = "application/json"))
    })
    @RolesAllowed("user")
    public List<Reservation> getReservations() {
        return reservationRepository.listAll();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get a reservation", description = "Returns a reservation by ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Reservation found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "Reservation not found", content = @Content(mediaType = "text/plain"))
    })
    @RolesAllowed("user")
    public Reservation getReservation(@PathParam("id") Long id) {
        Reservation reservation = reservationRepository.findById(id);
        if (reservation == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Reservation not found").build());
        }
        return reservation;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    @Operation(summary = "Add a reservation", description = "Adds a new reservation.")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Reservation created", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "400", description = "Start date must be before end date", content = @Content(mediaType = "text/plain")),
            @APIResponse(responseCode = "400", description = "Start date must be in the future", content = @Content(mediaType = "text/plain")),
            @APIResponse(responseCode = "400", description = "Item is already reserved for this time slot", content = @Content(mediaType = "text/plain")),
            @APIResponse(responseCode = "400", description = "Required fields are missing", content = @Content(mediaType = "text/plain"))
    })
    @RolesAllowed("user")
    public Response addReservation(Reservation reservation) {
        if (reservation.getItemId() == null || reservation.getUserId() == null || reservation.getStartDate() == null || reservation.getEndDate() == null) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Required fields are missing: itemId, userId, startDate, endDate").build());
        }

        LocalDate startDate = reservation.getStartDate();
        LocalDate endDate = reservation.getEndDate();

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Start date must be before end date").build());
        }

        if (startDate.isBefore(LocalDate.now())) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Start date must be in the future").build());
        }

        List<Reservation> reservations = reservationRepository.findByItemId(reservation.getItemId());
        for (Reservation r : reservations) {
            if (r.getStatus() != null && !r.getStatus().equals(ReservationStatus.CANCELLED) && startDate.isBefore(r.getEndDate()) && endDate.isAfter(r.getStartDate())) {
                throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Item is already reserved for this time slot").build());
            }
        }

        reservationRepository.persist(reservation);
        return Response.status(Response.Status.CREATED).entity(reservation).build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    @Operation(summary = "Update a reservation", description = "Updates an existing reservation.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Reservation updated", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "Reservation not found", content = @Content(mediaType = "text/plain")),
            @APIResponse(responseCode = "400", description = "Start date must be before end date", content = @Content(mediaType = "text/plain")),
            @APIResponse(responseCode = "400", description = "Start date must be in the future", content = @Content(mediaType = "text/plain")),
            @APIResponse(responseCode = "400", description = "Item is already reserved for this time slot", content = @Content(mediaType = "text/plain")),
            @APIResponse(responseCode = "400", description = "Required fields are missing", content = @Content(mediaType = "text/plain"))
    })
    @RolesAllowed("user")
    public Response updateReservation(@PathParam("id") Long id, Reservation reservation) {
        if(reservation.getItemId() == null || reservation.getUserId() == null || reservation.getStartDate() == null || reservation.getEndDate() == null) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Required fields are missing: itemId, userId, startDate, endDate").build());
        }

        Reservation existingReservation = reservationRepository.findById(id);

        if (existingReservation == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Reservation not found").build());
        }

        LocalDate startDate = reservation.getStartDate();
        LocalDate endDate = reservation.getEndDate();

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Start date must be before end date").build());
        }

        if (startDate.isBefore(LocalDate.now())) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Start date must be in the future").build());
        }

        List<Reservation> reservations = reservationRepository.findByItemId(reservation.getItemId());
        for (Reservation r : reservations) {
            if (startDate.isBefore(r.getEndDate()) && endDate.isAfter(r.getStartDate()) && !r.getId().equals(id)) {
                throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Item is already reserved for this time slot").build());
            }
        }

        existingReservation.setItemId(reservation.getItemId());
        existingReservation.setUserId(reservation.getUserId());
        existingReservation.setStartDate(reservation.getStartDate());
        existingReservation.setEndDate(reservation.getEndDate());
        existingReservation.setStatus(reservation.getStatus());

        reservationRepository.persist(existingReservation);
        return Response.ok(existingReservation).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete a reservation", description = "Deletes a reservation by ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Reservation deleted"),
            @APIResponse(responseCode = "404", description = "Reservation not found", content = @Content(mediaType = "text/plain"))
    })
    @RolesAllowed("user")
    public Response deleteReservation(@PathParam("id") Long id) {
        Reservation reservation = reservationRepository.findById(id);
        if (reservation == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Reservation not found").build());
        }
        reservationRepository.delete(reservation);
        return Response.noContent().build();
    }

}