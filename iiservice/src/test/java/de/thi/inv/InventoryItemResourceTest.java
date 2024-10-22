package de.thi.inv;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.util.Base64;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class InventoryItemResourceTest {

    @Test
    void testAddInventoryItem() {
        String name = "Test Item";
        String icon = "icon";
        byte[] photo = new byte[]{(byte) 0xFF, (byte) 0xD8};
        String encodedPhoto = Base64.getEncoder().encodeToString(photo);
        String urn = "urn";

        InventoryItem item = new InventoryItem();
        item.setName(name);
        item.setIcon(icon);
        item.setPhoto(photo);
        item.setUrn(urn);

        given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/api/inventoryitems/")
                .then()
                .statusCode(201)
                .body("name", is(name))
                .body("icon", is(icon))
                .body("photo", is(encodedPhoto))
                .body("urn", is(urn));
    }

    @Test
    void testGetInventoryItems() {
        given()
                .when()
                .get("/api/inventoryitems")
                .then()
                .statusCode(200);
    }

    @Test
    void testPutInventoryItems() {
        InventoryItem item = new InventoryItem();
        item.setName("Test Item");

        int id = given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/api/inventoryitems")
                .then()
                .statusCode(201)
                .extract().path("id");

        InventoryItem updatedItem = new InventoryItem();
        updatedItem.setName("Updated Test Item");

        given()
                .contentType(ContentType.JSON)
                .body(updatedItem)
                .when()
                .put("/api/inventoryitems/" + id)
                .then()
                .statusCode(200)
                .body("name", is("Updated Test Item"));
    }

    @Test
    void testDeleteInventoryItem() {
        InventoryItem item = new InventoryItem();
        item.setName("Test Item");

        int id = given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/api/inventoryitems")
                .then()
                .statusCode(201)
                .extract().path("id");

        // Item löschen
        given()
                .when()
                .delete("/api/inventoryitems/" + id)
                .then()
                .statusCode(204);

        // Checken, ob Item gelöscht wurde
        given()
                .when()
                .get("/api/inventoryitems/" + id)
                .then()
                .statusCode(404);
    }

}