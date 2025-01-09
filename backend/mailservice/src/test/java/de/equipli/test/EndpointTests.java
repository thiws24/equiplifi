package de.equipli.test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import jakarta.inject.Inject;
import org.apache.camel.CamelContext;
import org.apache.camel.EndpointInject;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.component.mock.MockEndpoint;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;


@QuarkusTest
@QuarkusTestResource(value = ActiveMQTestResource.class, restrictToAnnotatedClass = true)
@QuarkusTestResource(value = SMTP4DevTestResource.class, restrictToAnnotatedClass = true)
public class EndpointTests {

    @Inject
    ProducerTemplate producerTemplate;

    @EndpointInject("mock:result")
    MockEndpoint mockEndpoint;

    @Inject
    CamelContext camelContext;

    static String payload = """
                [
                  {
                    "itemId": "1",
                    "startDate": "2024-11-28",
                    "endDate": "2024-11-30",
                    "userId": "26d7ee63-43f1-4deb-9d2f-41e297c9953a",
                    "reservationId": "123"
                  },
                  {
                    "itemId": "2",
                    "startDate": "2024-12-28",
                    "endDate": "2024-12-30",
                    "userId": "26d7ee63-43f1-4deb-9d2f-41e297c9953a",
                    "reservationId": "456"
                  }
                ]
                """;


    @BeforeEach
    public void setupMocks() throws Exception {
        // Mock-Komponente global registrieren
        camelContext.getRegistry().bind("direct:sendMail", camelContext.getEndpoint("mock:direct:sendMail"));
    }



    // Sanity check
    @Test
    public void sanityCheckTest() throws Exception {

            // Erwartete Ausgabe
            String expected = "hello camel";

            // Mock-Endpoint vorbereiten
            mockEndpoint.expectedBodiesReceived(expected);

            // Nachricht an die Route senden
            producerTemplate.sendBody("direct:asd", "hello camel");

            // Verifikation
            mockEndpoint.assertIsSatisfied();
        }



    @Test
    public void testRequestConfirmation() throws Exception {
//        String mappedSmtpHost = System.getProperty("smtp.config.host");
//        String mappedSmtpPort = System.getProperty("smtp.config.port");
//
//        System.out.println("SMTP Host: " + mappedSmtpHost);
//        System.out.println("SMTP Port: " + mappedSmtpPort);
//
//        camelContext.getGlobalOptions().put("smtp.config.host", mappedSmtpHost);
//        camelContext.getGlobalOptions().put("smtp.config.port", mappedSmtpPort);

        RestAssured
                .given()
                .contentType("application/json") // Setze den Content-Type
                .body(payload)

                .when()
                .post("/cancellation-confirmation/")

                .then()
                .statusCode(200);

    }

    @Test
    public void testReservationConfirmation() throws Exception {

        RestAssured
                .given()
                .contentType("application/json") // Setze den Content-Type
                .body(payload)

                .when()
                .post("/reservation-confirmation/")

                .then()
                .statusCode(200);
    }

    @Test
    public void testStorekeeperConfirmation() throws Exception {

        RestAssured
                .given()
                .contentType("application/json") // Setze den Content-Type
                .body(payload)

                .when()
                .post("/storekeeper-confirmation/")

                .then()
                .statusCode(200);
    }

    @Test
    public void testCancellationConfirmation() throws Exception {

        RestAssured
                .given()
                .contentType("application/json") // Setze den Content-Type
                .body(payload)

                .when()
                .post("/cancellation-confirmation/")

                .then()
                .statusCode(200);
    }

    @Test
    public void testReturnConfirmation() throws Exception {

        RestAssured
                .given()
                .contentType("application/json") // Setze den Content-Type
                .body(payload)

                .when()
                .post("/return-confirmation/")

                .then()
                .statusCode(200);
    }

    @Test
    public void testReturnReminder() throws Exception {

        RestAssured
                .given()
                .contentType("application/json") // Setze den Content-Type
                .body(payload)

                .when()
                .post("/return-reminder/")

                .then()
                .statusCode(200);
    }

    @Test
    public void testReservationRejection() throws Exception {

        RestAssured
                .given()
                .contentType("application/json") // Setze den Content-Type
                .body(payload)

                .when()
                .post("/reservation-rejection/")

                .then()
                .statusCode(200);
    }



}



