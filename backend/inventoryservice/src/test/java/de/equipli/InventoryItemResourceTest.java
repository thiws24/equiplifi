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
        String icon = "icon";
        String photo = "https://www.thi.de/fileadmin/daten/allgemein/Inhalte_von_alter_Website/thi_logo_wb_RGB_office_DIN_A4.jpg";
        String urn = "urn";

        InventoryItem item = new InventoryItem();
        item.setName(name);
        item.setIcon(icon);
        item.setPhotoUrl(photo);
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
                .body("photo", is(photo))
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