package de.equipli.endpoints;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.core.Is.is;

@QuarkusTest
public class MailEndpointTest {


    @Test
    void testSendCollectionMailEndPoint() {


        /*MailDTO mailDTO = new MailDTO("test@test.de", "item", "2021-01-01", "2021-01-02", "pickupLocation", "pickupLocation");

        given()
                .contentType("application/json")
                .body(mailDTO)
                .when().post("/sendCollectionMail")
                .then()
                .statusCode(200)
                .assertThat()
                .body(is("{\"result\":\"Collection reminder sent successfully\"}"));*/

    }
}
