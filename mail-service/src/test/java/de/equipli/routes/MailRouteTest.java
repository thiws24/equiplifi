package de.equipli.routes;

import de.equipli.dto.MailDTO;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.apache.camel.CamelContext;
import org.apache.camel.EndpointInject;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.component.mock.MockEndpoint;

import org.apache.camel.quarkus.test.CamelQuarkusTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static io.restassured.RestAssured.given;
import static org.hamcrest.core.Is.is;


@QuarkusTest
public class MailRouteTest extends CamelQuarkusTestSupport {
    
    
    @EndpointInject("mock:smtp://localhost:25")
    MockEndpoint mockSmtp;

    @Inject
    ProducerTemplate template;

    @Inject
    CamelContext camelContext;

    @BeforeEach
    @Override
    public void setUp() {
        // Füge den Endpoint explizit zum CamelContext hinzu
        camelContext.getEndpoint("direct:sendCollectionMail");
    }
    
    @Test
    void testSendCollectionMailEndPoint() {


        MailDTO mailDTO = new MailDTO("test@test.de", "item", "2021-01-01", "2021-01-02", "", "");
        
        given()
                .contentType("application/json")
                .body(mailDTO)
                .when().post("/sendCollectionMail")
                .then()
                .statusCode(200)
                .assertThat()
                .body(is("{\"result\":\"Collection reminder sent successfully\"}"));
        
    }
    
    @Test
    void testSMTPFunctionality() throws InterruptedException, IOException {
        mockSmtp.reset();
        MailDTO mailDTO = new MailDTO();
        mailDTO.setTo("test@test.de");
        mailDTO.setItem("TestItem");
        mailDTO.setCollectionDate("2021-01-01");
        mailDTO.setReturnDate("2021-01-02");
        
        // Test Route directly without REST API
        // TODO: Why is the endpoint not found?
        /*ProducerTemplate template = camelContext.createProducerTemplate();*/
        template.sendBody("direct:sendCollectionMail", mailDTO);
        mockSmtp.expectedMessageCount(1);
        mockSmtp.expectedBodiesReceived(expectedBody(mailDTO));
        
        mockSmtp.assertIsSatisfied();
        
    }
    
    public String expectedBody(MailDTO mailDTO) throws IOException {
        // parse file and replace placeholders
        String expectedhtmlTemplate = new String(Files.readAllBytes(Paths.get("src/main/resources/mailTemplates/PickupReminder.html")));

        // replace placeholders with actual values
        expectedhtmlTemplate = expectedhtmlTemplate.replace("{{item}}", mailDTO.getItem());
        expectedhtmlTemplate = expectedhtmlTemplate.replace("{{collectionDate}}", mailDTO.getCollectionDate());
        expectedhtmlTemplate = expectedhtmlTemplate.replace("{{returnDate}}", mailDTO.getReturnDate());
        expectedhtmlTemplate = expectedhtmlTemplate.replace("{{receiver}}", mailDTO.getTo());


        return expectedhtmlTemplate;
        
    }

}