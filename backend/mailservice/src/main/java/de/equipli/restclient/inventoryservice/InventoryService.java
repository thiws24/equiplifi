package de.equipli.restclient.inventoryservice;

import de.equipli.dto.inventoryservice.InventoryItemDto;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@Path("/inventoryitems")
@RegisterRestClient(configKey = "inventoryservice")
public interface InventoryService {
    @GET
    @Path("/{id}")
    InventoryItemDto getInventoryItem(@PathParam("id") String id);
}
