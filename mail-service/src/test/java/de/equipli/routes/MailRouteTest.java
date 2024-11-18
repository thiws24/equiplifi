package de.equipli.routes;

import de.equipli.dto.CollectMailDto;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.apache.camel.CamelContext;
import org.apache.camel.EndpointInject;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.component.mock.MockEndpoint;

import org.apache.camel.quarkus.test.CamelQuarkusTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
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
    @Disabled
    void testSMTPFunctionality() throws InterruptedException, IOException {
        /*mockSmtp.reset();
        MailDTO mailDTO = new MailDTO();
        mailDTO.setReceiverMail("test@test.de");
        mailDTO.setItem("TestItem");
        mailDTO.setCollectionDate("2021-01-01");
        mailDTO.setReturnDate("2021-01-02");
        
        // Test Route directly without REST API
        // TODO: Why is the endpoint not found?
        *//*ProducerTemplate template = camelContext.createProducerTemplate();*//*
        template.sendBody("direct:sendCollectionMail", mailDTO);
        mockSmtp.expectedMessageCount(1);
        mockSmtp.expectedBodiesReceived(expectedBody(mailDTO));
        
        mockSmtp.assertIsSatisfied();*/
        
    }
    
    public String expectedBody(CollectMailDto collectMailDto) throws IOException {
        // parse file and replace placeholders
        String expectedhtmlTemplate = new String(Files.readAllBytes(Paths.get("src/main/resources/mailTemplates/PickupReminder.html")));

        // replace placeholders with actual values
        expectedhtmlTemplate = expectedhtmlTemplate.replace("{{item}}", collectMailDto.getItem());
        expectedhtmlTemplate = expectedhtmlTemplate.replace("{{collectionDate}}", collectMailDto.getCollectionDate());
        expectedhtmlTemplate = expectedhtmlTemplate.replace("{{returnDate}}", collectMailDto.getReturnDate());
        expectedhtmlTemplate = expectedhtmlTemplate.replace("{{receiver}}", collectMailDto.getReceiverMail());


        return expectedhtmlTemplate;
        
    }

}