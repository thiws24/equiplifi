package de.equipli.inventory.rest;

import de.equipli.inventory.jpa.Category;
import de.equipli.inventory.jpa.CategoryRepository;
import de.equipli.inventory.jpa.InventoryItem;
import de.equipli.inventory.jpa.InventoryRepository;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import java.io.InputStream;
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
import org.jboss.resteasy.reactive.RestForm;

@Path("/categories/{categoryId}/items")
public class InventoryItemResource {

    MinioClient minioClient;
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
            @APIResponse(responseCode = "201", description = "Inventory item created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = InventoryItem.class))),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json"))
    })
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
    @Produces("image/png")
    @Path("/{id}/image")
    public Response getInventoryItemImage(@PathParam("categoryId") Long categoryId, @PathParam("id") Long itemId) {
        try {
            if (categoryId <= 0 || itemId <= 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Invalid category or item ID.")
                        .build();
            }
            String objectName = categoryId + "/" + itemId;
            GetObjectResponse object = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket("category-pictures")
                            .object(objectName)
                            .build()
            );
            return Response.ok(object.readAllBytes())
                    .type("image/png")
                    .build();
        } catch (io.minio.errors.ErrorResponseException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Image not found: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving image: " + e.getMessage())
                    .build();
        }
    }


    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Path("/{id}/upload")
    public Response uploadInventoryItemImage(
            @PathParam("categoryId") Long categoryId,
            @PathParam("id") Long itemId,
            @RestForm("file") InputStream fileInputStream) {
        try {
            if (categoryId <= 0 || itemId <= 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Invalid category or item ID.")
                        .build();
            }
            String fileName = "default.png";

            String bucketName = "category-pictures";
            String objectName = categoryId + "/" + itemId;

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(fileInputStream, fileInputStream.available(), -1)
                            .contentType("image/png")
                            .build()
            );

            return Response.status(Response.Status.CREATED)
                    .entity("Image uploaded successfully.")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error uploading image: " + e.getMessage())
                    .build();
        }
    }




    @GET
    @Path("/{id}")
    @Operation(summary = "Get an InventoryItem by ID", description = "Returns an InventoryItem by its ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Inventory item returned successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = InventoryItem.class))),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "Item not found", content = @Content(mediaType = "application/json"))
    })
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
            @APIResponse(responseCode = "200", description = "Inventory item updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = InventoryItem.class))),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "404", description = "Item not found", content = @Content(mediaType = "application/json"))
    })
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
    public Response deleteInventoryItem(@PathParam("categoryId") Long categoryId, @PathParam("id") Long itemId) {
        Category category = categoryRepository.findById(categoryId);
        if (category == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + categoryId + " not found").build());
        }

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
