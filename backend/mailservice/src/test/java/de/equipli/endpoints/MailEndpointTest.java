package de.equipli.endpoints;

import de.equipli.dto.inventoryservice.InventoryItemCreateDto;
import de.equipli.dto.mail.MailCreateDto;
import io.quarkus.test.junit.QuarkusTest;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.PostgreSQLContainer;
import static io.restassured.RestAssured.given;
import static org.hamcrest.core.Is.is;

@QuarkusTest
@Testcontainers
@Disabled
public class MailEndpointTest {

    @ConfigProperty(name = "keycloak.image")
    String keycloakImage;

    @ConfigProperty(name = "inventory-service.image")
    String inventoryServiceImage;

    @ConfigProperty(name = "quarkus.rest-client.InventoryService.uri")
    String inventoryServiceUri;

    private static final Network sharedNetwork = Network.newNetwork();
    static GenericContainer<?> inventoryService;
    static GenericContainer<?> keycloak;
    static PostgreSQLContainer<?> inventoryServiceDb;

    @BeforeEach
    void startContainers() {

        inventoryServiceDb = new PostgreSQLContainer<>("postgres:17")
                .withNetworkAliases("inventoryservicedb")
                .withDatabaseName("inventoryservicedb")
                .withUsername("inventoryservicedbuser")
                .withPassword("inventoryservicedbpw")
                .withNetwork(sharedNetwork)
                ;
        inventoryServiceDb.start();

        keycloak = new GenericContainer(keycloakImage)
                 .withNetworkAliases("keycloak")
                .withNetwork(sharedNetwork);

        inventoryService = new GenericContainer(inventoryServiceImage)
                .withExposedPorts(8080)
                .dependsOn(inventoryServiceDb)
                .withEnv("QUARKUS_DATASOURCE_JDBC_URL", "jdbc:postgresql://inventoryservicedb:5432/inventoryservicedb")
                .withEnv("QUARKUS_DATASOURCE_USERNAME", inventoryServiceDb.getUsername())
                .withEnv("QUARKUS_DATASOURCE_PASSWORD", inventoryServiceDb.getPassword())
                    .withNetworkAliases("inventoryservice")
                .withNetwork(sharedNetwork);

        keycloak.start();
        inventoryService.start();

        //Prepare inventory service

        InventoryItemCreateDto inventoryItemCreateDto = new InventoryItemCreateDto();
        inventoryItemCreateDto.setName("Volleyball");
        inventoryItemCreateDto.setPhotoUrl("https://example.com/photo.jpg");
        inventoryItemCreateDto.setIcon("🏐");
        inventoryItemCreateDto.setUrn("example-urn");

        // why is this not working?
        // Idea: Testcontainer where the Test is running is not able to reach the inventory service
        String inventoryServiceUriForPost = inventoryServiceUri + "/inventoryitems"; ;

        given()
                .contentType("application/json")
                .body(inventoryItemCreateDto)
                .when().post("http://localhost:8080/inventoryitems")
                .then()
                .statusCode(201)
                .assertThat()
                .body(is("Das InventoryItem wurde erfolgreich erstellt"));
    }

    @Test
    void testSendCollectionMailEndPoint() {

        MailCreateDto mailCreateDto = new MailCreateDto();
        mailCreateDto.setUserId("df8e4444-4e04-4fd7-a9cd-8f938ea749c2"); //Id of Alice in Keycloak
        mailCreateDto.setItemId("1");
        mailCreateDto.setStartDate("24.12.2024");
        mailCreateDto.setEndDate("24.01.2025");

        given()
                .contentType("application/json")
                .body(mailCreateDto)
                .when().post("/sendCollectionMail")
                .then()
                .statusCode(200)
                .assertThat()
                .body(is("{\"result\":\"Collection reminder sent successfully\"}"));
    }
}
