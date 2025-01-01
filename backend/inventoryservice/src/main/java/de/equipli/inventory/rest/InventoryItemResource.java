package de.equipli.inventory.rest;

import de.equipli.inventory.jpa.Category;
import de.equipli.inventory.jpa.CategoryRepository;
import de.equipli.inventory.jpa.InventoryItem;
import de.equipli.inventory.jpa.InventoryRepository;
import de.equipli.inventory.rest.dto.CreateInventoryItemRequest;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;

@Authenticated
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
    @Operation(summary = "Create a new InventoryItem", description = "Creates a new InventoryItem and persists it to the database.")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Inventory item created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CreateInventoryItemRequest.class))),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json"))
    })
    @RolesAllowed("user")
    public Response createInventoryItem(@PathParam("categoryId") Long categoryId, InventoryItem item) {
        Category category = categoryRepository.findById(categoryId);
        if (category == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + categoryId + " not found").build());
        }

        item.setCategory(category);
        inventoryRepository.persist(item);

        return Response.status(Response.Status.CREATED).entity(item)
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .build();
    }

    @GET
    @Operation(summary = "Get all InventoryItem", description = "Returns all InventoryItem for a given category.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Inventory items returned successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = InventoryItem.class))),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json"))
    })
    @RolesAllowed("user")
    public Response getInventoryItems(@PathParam("categoryId") Long categoryId) {
        Category category = categoryRepository.findById(categoryId);
        if (category == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + categoryId + " not found").build());
        }

        return Response.ok(category.getItems())
                .header("Cache-Control", "max-age=300")
                .build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get an InventoryItem by ID", description = "Returns an InventoryItem by its ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Inventory item returned successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = InventoryItem.class))),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "Item not found", content = @Content(mediaType = "application/json"))
    })
    @RolesAllowed("user")
    public Response getInventoryItem(@PathParam("categoryId") Long categoryId, @PathParam("id") Long itemId) {
        Category category = categoryRepository.findById(categoryId);
        if (category == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + categoryId + " not found").build());
        }

        InventoryItem item = inventoryRepository.findById(itemId);
        if (item == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Item " + itemId + " not found").build());
        }

        return Response.ok(item)
                .header("Cache-Control", "max-age=300")
                .build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    @Operation(summary = "Update an InventoryItem by ID", description = "Updates an InventoryItem by its ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Inventory item updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CreateInventoryItemRequest.class))),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "Item not found", content = @Content(mediaType = "application/json"))
    })
    @RolesAllowed("user")
    public Response updateInventoryItem(@PathParam("categoryId") Long categoryId, @PathParam("id") Long itemId, InventoryItem item) {
        if (categoryRepository.findById(categoryId) == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + categoryId + " not found").build());
        }

        InventoryItem existingItem = inventoryRepository.findById(itemId);
        if (existingItem == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Item " + itemId + " not found").build());
        }

        existingItem.setStatus(item.getStatus());
        existingItem.setLocation(item.getLocation());

        inventoryRepository.persist(existingItem);

        return Response.ok(existingItem)
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete an InventoryItem by ID", description = "Deletes an InventoryItem by its ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Inventory item deleted successfully"),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "Item not found", content = @Content(mediaType = "application/json"))
    })
    @RolesAllowed("user")
    public Response deleteInventoryItem(@PathParam("id") Long itemId) {
        InventoryItem item = inventoryRepository.findById(itemId);
        if (item == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Item " + itemId + " not found").build());
        }

        inventoryRepository.delete(item);

        return Response.noContent()
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .build();
    }

}
