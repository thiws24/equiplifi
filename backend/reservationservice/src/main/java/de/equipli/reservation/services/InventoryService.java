package de.equipli.reservation.services;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

@RegisterRestClient(configKey = "inventory-api")
public interface InventoryService {

    @GET
    @Path("/categories/{categoryId}/items")

    List<InventoryItem> getInventoryItems(@PathParam("categoryId") Long id, @HeaderParam("Authorization") String token);

}
