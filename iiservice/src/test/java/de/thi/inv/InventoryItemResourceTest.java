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
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class InventoryItemResourceTest {

    @Test
    @Order(1)
    void testCreateInventoryItem() {
        String name = "ObjektTest";
        String icon = "icon";
        byte[] photo = new byte[]{(byte) 0xFF, (byte) 0xD8};
        String encodedPhoto = Base64.getEncoder().encodeToString(photo);
        String urn = "urn";

        InventoryItem inventoryItem = new InventoryItem();
        inventoryItem.setName(name);
        inventoryItem.setIcon(icon);
        inventoryItem.setPhoto(photo);
        inventoryItem.setUrn(urn);

        given()
                .body(inventoryItem)
                .contentType(ContentType.JSON)
                .when()
                .post("/api/inventoryitems/")
                .then()
                .statusCode(Response.Status.CREATED.getStatusCode())
                .body("name", is(name))
                .body("icon", is(icon))
                .body("photo", is(encodedPhoto))
                .body("urn", is(urn));
    }

    @Test
    @Order(2)
    void testGetInventoryItems() {
        given()
                .when()
                .get("/api/inventoryitems")
                .then()
                .statusCode(Response.Status.OK.getStatusCode())
                .body("size()", is(1));
    }

    @Test
    @Order(3)
    void testPutInventoryItems() {
        long id = 1;
        String new_name = "objektname_neu";
        String new_icon = "icon_new";
        byte[] new_photo = new byte[]{(byte) 0xFF, (byte) 0xF9};
        String encodedNewPhoto = Base64.getEncoder().encodeToString(new_photo);
        String new_urn = "urn_123";

        InventoryItem inventoryItem = new InventoryItem();
        inventoryItem.setName(new_name);
        inventoryItem.setIcon(new_icon);
        inventoryItem.setPhoto(new_photo);
        inventoryItem.setUrn(new_urn);

        given()
                .body(inventoryItem)
                .contentType(ContentType.JSON)
                .when()
                .put("/api/inventoryitems/{id}", id)
                .then()
                .statusCode(Response.Status.OK.getStatusCode())
                .body("name", is(new_name))
                .body("icon", is(new_icon))
                .body("photo", is(encodedNewPhoto))
                .body("urn", is(new_urn));
    }

    @Test
    @Order(4)
    void testDeleteInventoryItem() {
        long id = 1;

        given()
                .when()
                .delete("/api/inventoryitems/{id}", id)
                .then()
                .statusCode(Response.Status.NO_CONTENT.getStatusCode());

        given()
                .when()
                .get("/api/inventoryitems/")
                .then()
                .statusCode(Response.Status.OK.getStatusCode())
                .body("size()", is(0));
    }


}