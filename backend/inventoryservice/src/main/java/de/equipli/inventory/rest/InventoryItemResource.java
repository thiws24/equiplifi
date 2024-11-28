package de.equipli.inventory.rest;

import de.equipli.inventory.jpa.Category;
import de.equipli.inventory.jpa.CategoryRepository;
import de.equipli.inventory.jpa.InventoryItem;
import de.equipli.inventory.jpa.InventoryRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/categories/{categoryId}/items")
public class InventoryItemResource {

    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    @Inject
    public InventoryItemResource(CategoryRepository categoryRepository, InventoryRepository inventoryRepository) {
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response createInventoryItem(@PathParam("categoryId") Long id, InventoryItem item) {
        Category category = categoryRepository.findById(id);
        if(category == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        item.setCategory(category);
        inventoryRepository.persist(item);

        return Response.status(Response.Status.CREATED).entity(item).build();
    }

    @GET
    public Response getInventoryItems(@PathParam("categoryId") Long id) {
        Category category = categoryRepository.findById(id);
        if(category == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        return Response.ok(category.getItems()).build();
    }

    @GET
    @Path("/{id}")
    public Response getInventoryItem(@PathParam("categoryId") Long id, @PathParam("id") Long itemId) {
        Category category = categoryRepository.findById(id);
        if(category == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        InventoryItem item = inventoryRepository.findById(itemId);
        if(item == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Item " + itemId + " not found").build());
        }

        return Response.ok(item).build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response updateInventoryItem(@PathParam("categoryId") Long id, @PathParam("id") Long itemId, InventoryItem item) {
        Category category = categoryRepository.findById(id);
        if(category == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        InventoryItem existingItem = inventoryRepository.findById(itemId);
        if(existingItem == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Item " + itemId + " not found").build());
        }

        existingItem.setStatus(item.getStatus());
        existingItem.setLocation(item.getLocation());

        inventoryRepository.persist(existingItem);

        return Response.ok(existingItem).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteInventoryItem(@PathParam("categoryId") Long id, @PathParam("id") Long itemId) {
        Category category = categoryRepository.findById(id);
        if(category == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        InventoryItem item = inventoryRepository.findById(itemId);
        if(item == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Item " + itemId + " not found").build());
        }

        inventoryRepository.delete(item);

        return Response.noContent().build();
    }

}
