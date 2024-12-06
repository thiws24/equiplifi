package de.equipli.inventory.rest;

import de.equipli.inventory.jpa.Category;
import de.equipli.inventory.jpa.CategoryRepository;
import de.equipli.inventory.jpa.InventoryItem;
import de.equipli.inventory.jpa.InventoryRepository;
import de.equipli.inventory.rest.dto.InventoryItemWithCategoryDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;

@Path("/items")
public class InventoryItemByIdResource {

    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;

    @Inject
    public InventoryItemByIdResource(InventoryRepository inventoryRepository, CategoryRepository categoryRepository) {
        this.inventoryRepository = inventoryRepository;
        this.categoryRepository = categoryRepository;
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get an inventory item by ID", description = "Returns an inventory item by its ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Inventory item returned successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = InventoryItemWithCategoryDTO.class))),
            @APIResponse(responseCode = "404", description = "Item not found", content = @Content(mediaType = "application/json"))
    })
    public Response getInventoryItemById(@PathParam("id") Long itemId) {
        InventoryItem item = inventoryRepository.findById(itemId);
        if (item == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Item " + itemId + " not found").build());
        }

        Category category = categoryRepository.findByItemId(itemId);
        if (category == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("No category found for item " + itemId).build());
        }

        InventoryItemWithCategoryDTO itemWithCategory = new InventoryItemWithCategoryDTO();
        itemWithCategory.setId(item.getId());
        itemWithCategory.setCategoryId(category.getId());

        itemWithCategory.setName(category.getName());
        itemWithCategory.setIcon(category.getIcon());
        itemWithCategory.setDescription(category.getDescription());
        itemWithCategory.setPhotoUrl(category.getPhotoUrl());

        itemWithCategory.setStatus(item.getStatus());
        itemWithCategory.setLocation(item.getLocation());

        return Response.ok(itemWithCategory).build();


    }
}
