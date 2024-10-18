package de.thi.inv;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/inventoryitems")
public class InventoryItemResource {

    @Inject
    InventoryItemRepository inventoryItemRepository;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response addInventoryItem(InventoryItem item) {
        if (item.getName() == null || item.getName().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Inventory item name cannot be null or empty").build();
        }

        inventoryItemRepository.persist(item);
        return Response.status(Response.Status.CREATED).entity(item).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<InventoryItem> getInventoryItems() {
        return inventoryItemRepository.listAll();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Transactional
    public InventoryItem updateInventoryItem(@PathParam("id") Long id, InventoryItem item) {
        InventoryItem existingItem = inventoryItemRepository.findById(id);
        if (existingItem == null) {
            throw new WebApplicationException("Inventory item with id '" + id + "' not found", 404);
        }
        // TODO: Nur updaten wenn nicht null (?)
        existingItem.setName(item.getName());
        existingItem.setPhoto(item.getPhoto());
        existingItem.setIcon(item.getIcon());
        existingItem.setUrn(item.getUrn());

        inventoryItemRepository.persist(existingItem);
        return existingItem;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void deleteInventoryItem(@PathParam("id") Long id) {
        InventoryItem existingItem = inventoryItemRepository.findById(id);
        if (existingItem == null) {
            throw new WebApplicationException("Inventory item with id '" + id + "' not found", 404);
        }

        inventoryItemRepository.delete(existingItem);
    }
}