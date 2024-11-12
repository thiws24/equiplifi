package de.equipli;

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

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getInventoryItem(@PathParam("id") Long id) {
        InventoryItem item = inventoryItemRepository.findById(id);
        
        if (item == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(item).build();
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
        //ToDO: Es kann aktuell nicht auf "null" gesetzt werden
        if (item.getName() != null) {
            existingItem.setName(item.getName());
        }
        if (item.getPhotoUrl() != null) {
            existingItem.setPhotoUrl(item.getPhotoUrl());
        }
        if (item.getIcon() != null) {
            existingItem.setIcon(item.getIcon());
        }
        if (item.getUrn() != null) {
            existingItem.setUrn(item.getUrn());
        }
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
        System.out.println("Deleting item with id: " + id);
        inventoryItemRepository.delete(existingItem);
    }
}