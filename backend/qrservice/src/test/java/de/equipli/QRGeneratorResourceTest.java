package de.equipli;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.equalTo;

@QuarkusTest
class QRGeneratorResourceTest {

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGenerateQR_PNG() {
        given()
                .queryParam("name", "TestName")
                .queryParam("id", "12345")
                .header("Accept", "image/png")
                .when().get("/qr")
                .then()
                .statusCode(200)
                .header("Content-Disposition", equalTo("attachment; filename=\"qrcode.png\""))
                .header("Cache-Control", equalTo("public, max-age=300"))
                .contentType("image/png");
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGenerateQR_PDF() {
        given()
                .queryParam("name", "TestName")
                .queryParam("id", "12345")
                .header("Accept", "application/pdf")
                .when().get("/qr")
                .then()
                .statusCode(200)
                .header("Content-Disposition", equalTo("attachment; filename=\"qrcode.pdf\""))
                .header("Cache-Control", equalTo("public, max-age=300"))
                .contentType("application/pdf");
    }

    @Test
    @TestSecurity(user = "Bob", roles = {"user"})
    void testGenerateQR_MissingParameters() {
        given()
                .queryParam("name", "TestName")
                .when().get("/qr")
                .then()
                .statusCode(400)
                .body(is("Es fehlen benötigte Parameter: Name, ID, oder Accept-Header"));
    }
}