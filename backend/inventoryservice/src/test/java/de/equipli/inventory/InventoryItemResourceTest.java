package de.equipli.inventory;

import de.equipli.inventory.jpa.*;
import de.equipli.inventory.rest.dto.CreateCategoryRequest;
import de.equipli.inventory.rest.dto.UpdateCategoryRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class InventoryItemResourceTest {

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testAddCategory() {
        String name = "Test Category";
        String description = "This is a test category";
        String icon = "icon";
        String photoUrl = "https://www.example.com/photo.jpg";

        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setPhotoUrl(photoUrl);

        given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .body("name", is(name))
                .body("description", is(description))
                .body("photoUrl", is(photoUrl))
                .body("icon", is(icon));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testAddCategoryWithItems() {
        String name = "Test Category With Items";
        String description = "This is a test category";
        String icon = "icon";

        CreateCategoryRequest category = new CreateCategoryRequest();
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setItemCount(3L);
        category.setItemLocation("Test Location");

        given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .body("name", is(name))
                .body("description", is(description))
                .body("icon", is(icon))
                .body("items.size()", is(3))
                .extract().path("id");
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testAddCategoryWithEmptyName() {
        Category category = new Category();
        category.setName("");

        given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(400);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testAddCategoryWithExistingName() {
        Category category = new Category();
        category.setName("Test Category Existing");

        given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201);

        given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(400);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetCategories() {
        given()
                .when()
                .get("/categories")
                .then()
                .statusCode(200);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetCategory() {
        Category category = new Category();
        category.setName("Test Category Get");

        int id = given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        given()
                .when()
                .get("/categories/" + id)
                .then()
                .statusCode(200);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testUpdateCategory() {
        UpdateCategoryRequest request = new UpdateCategoryRequest();
        request.setName("Test Category Update");
        request.setDescription("This is a test category");
        request.setIcon("icon");
        request.setPhotoUrl("https://www.example.com/photo.jpg");

        int id = given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        UpdateCategoryRequest updatedCategory = new UpdateCategoryRequest();

        updatedCategory.setName("Updated Test Category Update");
        updatedCategory.setDescription("Updated Description");
        updatedCategory.setIcon("updated-icon");
        updatedCategory.setPhotoUrl("https://www.example.com/updated-photo.jpg");

        given()
                .contentType(ContentType.JSON)
                .body(updatedCategory)
                .when()
                .put("/categories/" + id)
                .then()
                .statusCode(200)
                .body("name", is("Updated Test Category Update"));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testDeleteCategory() {
        Category category = new Category();
        category.setName("Test Category Delete");

        List<InventoryItem> items = new ArrayList<>();
        items.add(new InventoryItem());
        category.setItems(items);

        int id = given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        int itemId = given()
                .contentType(ContentType.JSON)
                .body(new InventoryItem())
                .when()
                .post("/categories/" + id + "/items")
                .then()
                .statusCode(201)
                .extract().path("id");

        // Kategorie löschen
        given()
                .when()
                .delete("/categories/" + id)
                .then()
                .statusCode(204);

        // Checken, ob Kategorie gelöscht wurde
        given()
                .when()
                .get("/categories/" + id)
                .then()
                .statusCode(404);

        // Checken, ob Item gelöscht wurde
        given()
                .when()
                .get("/items/" + itemId)
                .then()
                .statusCode(404);

    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testAddInventoryItem() {
        Category category = new Category();
        category.setName("Test Category Add Item");

        int categoryId = given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        InventoryItem item = new InventoryItem();
        item.setLocation("Test Location");

        int id = given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/categories/" + categoryId + "/items")
                .then()
                .statusCode(201)
                .extract().path("id");

        given()
                .when()
                .get("/categories/" + categoryId + "/items/" + id)
                .then()
                .statusCode(200)
                .body("location", is("Test Location"));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetInventoryItems() {
        Category category = new Category();
        category.setName("Test Category Get Items");

        int categoryId = given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        InventoryItem item = new InventoryItem();
        item.setLocation("Test Location");

        given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/categories/" + categoryId + "/items")
                .then()
                .statusCode(201);

        given()
                .when()
                .get("/categories/" + categoryId + "/items")
                .then()
                .statusCode(200);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetInventoryItem() {
        Category category = new Category();
        category.setName("Test Category Get Item");

        int categoryId = given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        InventoryItem item = new InventoryItem();
        item.setLocation("Test Location");

        int id = given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/categories/" + categoryId + "/items")
                .then()
                .statusCode(201)
                .extract().path("id");

        given()
                .when()
                .get("/categories/" + categoryId + "/items/" + id)
                .then()
                .statusCode(200);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testUpdateInventoryItem() {
        Category category = new Category();
        category.setName("Test Category Update Item");

        int categoryId = given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        InventoryItem item = new InventoryItem();
        item.setLocation("Test Location");

        int id = given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/categories/" + categoryId + "/items")
                .then()
                .statusCode(201)
                .extract().path("id");

        item.setLocation("Updated Location");

        given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .put("/categories/" + categoryId + "/items/" + id)
                .then()
                .statusCode(200)
                .body("location", is("Updated Location"));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testDeleteInventoryItem() {
        Category category = new Category();
        category.setName("Test Category Delete Item");

        int categoryId = given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        InventoryItem item = new InventoryItem();
        item.setLocation("Test Location");

        int id = given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/categories/" + categoryId + "/items")
                .then()
                .statusCode(201)
                .extract().path("id");

        given()
                .when()
                .delete("/categories/" + categoryId + "/items/" + id)
                .then()
                .statusCode(204);

        given()
                .when()
                .get("/categories/" + categoryId + "/items/" + id)
                .then()
                .statusCode(404);
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testCreateInventoryItemWithNonExistentCategory() {
        InventoryItem item = new InventoryItem();
        item.setLocation("Test Location");

        given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/categories/9999/items")
                .then()
                .statusCode(404)
                .body(is("Category 9999 not found"));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetInventoryItemWithNonExistentCategory() {
        given()
                .when()
                .get("/categories/9999/items/1")
                .then()
                .statusCode(404)
                .body(is("Category 9999 not found"));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testUpdateInventoryItemWithNonExistentCategory() {
        InventoryItem item = new InventoryItem();
        item.setLocation("Updated Location");

        given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .put("/categories/9999/items/1")
                .then()
                .statusCode(404)
                .body(is("Category 9999 not found"));
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGetInventoryItemDetails() {
        Category category = new Category();
        category.setName("Test Category Get Item Details");
        category.setDescription("This is a test category");
        category.setIcon("icon");

        int categoryId = given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        InventoryItem item = new InventoryItem();
        item.setLocation("Test Location");
        item.setStatus(ItemStatus.OK);

        int id = given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/categories/" + categoryId + "/items")
                .then()
                .statusCode(201)
                .extract().path("id");

        given()
                .when()
                .get("/items/" + id)
                .then()
                .statusCode(200)
                .body("location", is("Test Location"))
                .body("status", is("OK"))
                .body("name" , is("Test Category Get Item Details"))
                .body("categoryId" , is(categoryId))
                .body("description" , is("This is a test category"))
                .body("icon" , is("icon"));
    }


}