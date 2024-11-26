package de.equipli;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/categories")
public class CategoryResource {

    @Inject
    CategoryRepository categoryRepository;

    @Inject
    InventoryRepository inventoryRepository;

    @GET
    public List<Category> getAllCategories() {
        return categoryRepository.listAll();
    }

    @GET
    @Path("/{id}")
    public Category getCategoryById(@PathParam("id") Long id) {
        return categoryRepository.findById(id);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response createCategory(Category category) {
        if (category.getName() == null || category.getName().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Category name cannot be null or empty").build();
        }

        // Category already exists?

        categoryRepository.persist(category);
        return Response.status(Response.Status.CREATED).entity(category).build();
    }

    @GET
    public Response getCategories() {
        return Response.ok(categoryRepository.listAll()).build();
    }

    @GET
    @Path("/{id}")
    public Response getCategory(Long id) {
        Category category = categoryRepository.findById(id);

        if (category == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(category).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/{id}")
    @Transactional
    public Response createInventoryItem(@PathParam("id") Long id, InventoryItem item) {
        Category category = categoryRepository.findById(id);

        if (category == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Category not found").build();
        }

        item.setCategory(category);
        category.items.add(item);
        inventoryRepository.persist(item);

        return Response.status(Response.Status.CREATED).entity(item).build();
    }

}
