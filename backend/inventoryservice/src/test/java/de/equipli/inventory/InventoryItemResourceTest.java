package de.equipli.inventory;

import de.equipli.inventory.jpa.Category;
import de.equipli.inventory.jpa.InventoryItem;
import de.equipli.inventory.rest.dto.UpdateCategoryRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class InventoryItemResourceTest {

    @Test
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
    void testGetCategories() {
        given()
                .when()
                .get("/categories")
                .then()
                .statusCode(200);
    }

    @Test
    void testUpdateCategory() {
        Category category = new Category();
        category.setName("Test Category");
        category.setDescription("This is a test category");
        category.setIcon("icon");
        category.setPhotoUrl("https://www.example.com/photo.jpg");

        int id = given()
                .contentType(ContentType.JSON)
                .body(category)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract().path("id");

        UpdateCategoryRequest updatedCategory = new UpdateCategoryRequest();

        updatedCategory.setName("Updated Category");
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
                .body("name", is("Updated Category"));
    }

    @Test
    void testDeleteCategory() {
        Category category = new Category();
        category.setName("Test Category");

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
    void testAddInventoryItem() {
        Category category = new Category();
        category.setName("Test Category");

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
    void testGetInventoryItems() {
        Category category = new Category();
        category.setName("Test Category");

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
    void testUpdateInventoryItem() {
        Category category = new Category();
        category.setName("Test Category");

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
    void testDeleteInventoryItem() {
        Category category = new Category();
        category.setName("Test Category");

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

}