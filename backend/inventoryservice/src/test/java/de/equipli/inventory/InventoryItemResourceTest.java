package de.equipli;


import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class InventoryItemResourceTest {

    @Test
    void testAddInventoryItem() {
        String name = "Test Item";
        String description = "This is a test item";
        String icon = "icon";
        String urn = "urn:test:item";
        String photoUrl = "https://www.example.com/photo.jpg";
        String itemStatus = "damaged";

        InventoryItem item = new InventoryItem();
        /*item.setName(name);
        item.setDescription(description);
        item.setIcon(icon);
        //item.setUrn(urn);
        item.setPhotoUrl(photoUrl);
        item.setItemStatus(itemStatus);*/

        given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/inventoryitems")
                .then()
                .statusCode(201)
                .body("name", is(name))
                .body("description", is(description))
                .body("icon", is(icon))
                //.body("urn", is(urn))
                .body("photoUrl", is(photoUrl))
                .body("itemStatus", is(itemStatus));
    }

    @Test
    void testGetInventoryItems() {
        given()
                .when()
                .get("/inventoryitems")
                .then()
                .statusCode(200);
    }

    @Test
    void testPutInventoryItems() {
        InventoryItem item = new InventoryItem();
        /*item.setName("Test Item");*/

        int id = given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/inventoryitems")
                .then()
                .statusCode(201)
                .extract().path("id");

        InventoryItem updatedItem = new InventoryItem();
        /*updatedItem.setName("Updated Test Item");*/

        given()
                .contentType(ContentType.JSON)
                .body(updatedItem)
                .when()
                .put("/inventoryitems/" + id)
                .then()
                .statusCode(200)
                .body("name", is("Updated Test Item"));
    }

    @Test
    void testDeleteInventoryItem() {
        InventoryItem item = new InventoryItem();
        /*item.setName("Test Item");*/

        int id = given()
                .contentType(ContentType.JSON)
                .body(item)
                .when()
                .post("/inventoryitems")
                .then()
                .statusCode(201)
                .extract().path("id");

        // Item löschen
        given()
                .when()
                .delete("/inventoryitems/" + id)
                .then()
                .statusCode(204);

        // Checken, ob Item gelöscht wurde
        given()
                .when()
                .get("/inventoryitems/" + id)
                .then()
                .statusCode(404);
    }
}
