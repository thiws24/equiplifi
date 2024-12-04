package de.equipli.inventory.rest;

import de.equipli.inventory.jpa.*;
import de.equipli.inventory.rest.dto.CreateCategoryRequest;
import de.equipli.inventory.rest.dto.UpdateCategoryRequest;
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

import java.util.ArrayList;

@Path("/categories")
public class CategoryResource {

    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    @Inject
    public CategoryResource(CategoryRepository categoryRepository, InventoryRepository inventoryRepository) {
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    @Operation(summary = "Create a new category", description = "Creates a new category and persists it to the database.")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Category created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @APIResponse(responseCode = "400", description = "Category name null or empty", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "400", description = "Category name already exists", content = @Content(mediaType = "application/json"))
    })
    public Response createCategory(CreateCategoryRequest request) {
        if (request.getName() == null || request.getName().isEmpty()) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Category name cannot be null or empty").build());
        }

        if (categoryRepository.find("name", request.getName()).firstResult() != null) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Category with name " + request.getName() + " already exists").build());
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        category.setPhotoUrl(request.getPhotoUrl());
        category.setItems(new ArrayList<>());

        categoryRepository.persist(category);

        if (request.getItemCount() != null) {
            for (int i = 0; i < request.getItemCount(); i++) {
                InventoryItem item = new InventoryItem();
                item.setStatus(ItemStatus.OK);
                item.setLocation(request.getItemLocation());
                category.addItem(item);
                inventoryRepository.persist(item);
            }
        }

        return Response.status(Response.Status.CREATED).entity(category)
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .build();
    }

    @GET
    @Operation(summary = "Get all categories", description = "Returns a list of all categories.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Categories returned successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class)))
    })
    public Response getCategories() {
        return Response.ok(categoryRepository.listAll())
                .header("Cache-Control", "max-age=300")
                .build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a category by ID", description = "Returns a category by its ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Category returned successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json"))
    })
    public Response getCategory(@PathParam("id") Long id) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }
        return Response.ok(category)
                .header("Cache-Control", "max-age=300")
                .build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update a category by ID", description = "Updates a category by its ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Category updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json")),
            @APIResponse(responseCode = "400", description = "Category name already exists", content = @Content(mediaType = "application/json"))
    })
    public Response updateCategory(@PathParam("id") Long id, UpdateCategoryRequest request) {
        Category existingCategory = categoryRepository.findById(id);
        if (existingCategory == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        if (categoryRepository.find("name", request.getName()).firstResult() != null) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("Category with name " + request.getName() + " already exists").build());
        }

        existingCategory.setName(request.getName());
        existingCategory.setDescription(request.getDescription());
        existingCategory.setIcon(request.getIcon());
        existingCategory.setPhotoUrl(request.getPhotoUrl());

        categoryRepository.persist(existingCategory);

        return Response.ok(request)
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete a category by ID", description = "Deletes a category by its ID.")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Category deleted successfully"),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json"))
    })
    public Response deleteCategory(@PathParam("id") Long id) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        categoryRepository.delete(category);

        // Delete all items in the category
        inventoryRepository.delete("category", category);

        return Response.noContent()
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .build();
    }

}
