package de.equipli;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.time.Period;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

@Path("/api/reservation")
public class ReservationResource {
    @Inject
    ReservationRepository reservationRepository;


}
