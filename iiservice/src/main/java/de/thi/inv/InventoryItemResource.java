package de.thi.inv;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/inventoryitems")
public class InventoryItemResource {

    @Inject
    InventoryItemRepository inventoryItemRepository;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public InventoryItem addInventoryItem(InventoryItem item) {
        inventoryItemRepository.persist(item);
        return item;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<InventoryItem> getInventoryItems() {
        return inventoryItemRepository.listAll();
    }
}