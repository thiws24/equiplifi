package de.equipli.inventory.rest;

import de.equipli.inventory.jpa.*;
import de.equipli.inventory.rest.dto.CreateCategoryRequest;
import de.equipli.inventory.rest.dto.UpdateCategoryRequest;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.errors.MinioException;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.jboss.resteasy.reactive.RestForm;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;

@Authenticated
@Path("/categories")
public class CategoryResource {

    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final MinioClient minioClient;

    @ConfigProperty(name = "minio.bucket-name")
    String bucketName;

    @Inject
    public CategoryResource(CategoryRepository categoryRepository, InventoryRepository inventoryRepository, MinioClient minioClient) {
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
        this.minioClient = minioClient;
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
    @RolesAllowed("user")
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

                if(request.getItemLocation() != null) {
                    item.setLocation(request.getItemLocation());
                }

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
    @RolesAllowed("user")
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
    @RolesAllowed("user")
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
    @RolesAllowed("user")
    public Response updateCategory(@PathParam("id") Long id, UpdateCategoryRequest request) {
        Category existingCategory = categoryRepository.findById(id);
        if (existingCategory == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        Category existingCategoryWithName = categoryRepository.find("name", request.getName()).firstResult();
        if (existingCategoryWithName != null && !existingCategoryWithName.getId().equals(id)) {
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
    @RolesAllowed("user")
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

    // Image upload/download endpoints

    @GET
    @Path("/{id}/image")
    @Produces(MediaType.TEXT_PLAIN)
    @Operation(summary = "Get a category image by ID", description = "Returns a category image by its ID as a Base64 string.")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Category image returned successfully", content = @Content(mediaType = "text/plain")),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json"))
    })
    @RolesAllowed("user")
    public Response getCategoryImage(@PathParam("id") Long id) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        try (InputStream photo = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object("category-" + id + ".jpg")
                        .build());
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = photo.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesRead);
            }

            String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());
            return Response.ok(base64Image)
                    .header("Cache-Control", "max-age=300")
                    .build();
        } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
            throw new InternalServerErrorException(Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error retrieving category photo").build());
        }
    }

    @POST
    @Path("/{id}/image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Transactional
    @Operation(summary = "Upload a category image by ID", description = "Uploads a category image by its ID as a file.")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Category image uploaded successfully"),
            @APIResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json"))
    })
    public Response uploadCategoryImage(@PathParam("id") Long id, @RestForm InputStream fileContent, @RestForm String contentType) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new NotFoundException(Response.status(Response.Status.NOT_FOUND).entity("Category " + id + " not found").build());
        }

        if (fileContent == null) {
            throw new BadRequestException(Response.status(Response.Status.BAD_REQUEST).entity("File content cannot be null").build());
        }

        try (InputStream image = fileContent) {
            minioClient.putObject(
                    io.minio.PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object("category-" + id + ".jpg")
                            .stream(image, image.available(), -1)
                            .contentType(contentType)
                            .build()
            );
            return Response.ok()
                    .header("Cache-Control", "no-cache, no-store, must-revalidate")
                    .build();
        } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
            throw new InternalServerErrorException(Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error uploading category image").build());
        }
    }

}
