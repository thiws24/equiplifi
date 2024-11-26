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

@Path("/categories")
public class CategoryResource {

    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    @Inject
    public CategoryResource(CategoryRepository categoryRepository, InventoryRepository inventoryRepository) {
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
    }

    // Category CRUD operations

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response createCategory(Category category) {
        if (category.getName() == null || category.getName().isEmpty()) {
            throw new WebApplicationException(Response.status(Response.Status.BAD_REQUEST).entity("Category name cannot be null or empty").build());
        }

        if(categoryRepository.find("name", category.getName()).firstResult() != null) {
            throw new WebApplicationException(Response.status(Response.Status.CONFLICT).entity("Category with name " + category.getName() + " already exists").build());
        }

        categoryRepository.persist(category);

        if (category.getItems() != null) {
            for (InventoryItem item : category.getItems()) {
                item.setCategory(category);
                inventoryRepository.persist(item);
            }
        }

        return Response.status(Response.Status.CREATED).entity(category).build();
    }

    @GET
    public Response getCategories() {
        return Response.ok(categoryRepository.listAll()).build();
    }

    @GET
    @Path("/{id}")
    public Category getCategory(Long id) {
        Category category = categoryRepository.findById(id);
        if(category == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }
        return category;
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/{id}")
    @Transactional
    public Response updateCategory(@PathParam("id") Long id, Category category) {
        Category existingCategory = categoryRepository.findById(id);
        if(existingCategory == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        existingCategory.setName(category.getName());
        existingCategory.setDescription(category.getDescription());
        existingCategory.setIcon(category.getIcon());
        existingCategory.setPhotoUrl(category.getPhotoUrl());

        categoryRepository.persist(existingCategory);

        return Response.ok(existingCategory).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteCategory(@PathParam("id") Long id) {
        Category category = categoryRepository.findById(id);
        if(category == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        categoryRepository.delete(category);

        //TODO: Was passiert mit den Items?

        return Response.noContent().build();
    }

    // InventoryItem CRUD operations

    @POST
    @Path("/{id}/items")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response createInventoryItem(@PathParam("id") Long id, InventoryItem item) {
        Category category = categoryRepository.findById(id);
        if(category == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        item.setCategory(category);
        inventoryRepository.persist(item);

        return Response.status(Response.Status.CREATED).entity(item).build();
    }

    @GET
    @Path("/{id}/items")
    public Response getInventoryItems(@PathParam("id") Long id) {
        Category category = categoryRepository.findById(id);
        if(category == null) {
            throw new WebApplicationException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        return Response.ok(category.getItems()).build();
    }

    @GET
    @Path("/{id}/items/{itemId}")
    public Response getInventoryItem(@PathParam("id") Long id, @PathParam("itemId") Long itemId) {
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
    @Path("/{id}/items/{itemId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response updateInventoryItem(@PathParam("id") Long id, @PathParam("itemId") Long itemId, InventoryItem item) {
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
    @Path("/{id}/items/{itemId}")
    @Transactional
    public Response deleteInventoryItem(@PathParam("id") Long id, @PathParam("itemId") Long itemId) {
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
