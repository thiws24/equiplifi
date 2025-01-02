package de.equipli.processor;

import de.equipli.dto.inventoryservice.InventoryItemDto;
import de.equipli.dto.mail.MailCreateDto;
import de.equipli.processors.mail.MailProcessor;
import io.quarkus.qute.Template;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
@Disabled
class MailProcessorTest {

    @Inject
    Template mail;

    @Inject
    MailProcessor mailProcessor;


    @Test
    void process_processesTemplateCorrect() throws Exception {

        // Arrange
        MailCreateDto mailCreateDto = new MailCreateDto();
        mailCreateDto.setUserId("df8e4444-4e04-4fd7-a9cd-8f938ea749c2"); //Id of Alice in Keycloak
        mailCreateDto.setItemId("1");
        mailCreateDto.setStartDate("24.12.2024");
        mailCreateDto.setEndDate("24.01.2025");

        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        exchange.getIn().setBody(mailCreateDto);

        // mock call to keycloak and inventoryservice
        exchange.setProperty("nameOfUser", "TestName");

        InventoryItemDto item = new InventoryItemDto();
        item.setName("Volleyball");
        item.setPhotoUrl("https://example.com/photo.jpg");
        item.setIcon("🏐");
        item.setUrn("example-urn");
        exchange.setProperty("item", item);

        mailProcessor.process(exchange);

        String generatedBody = exchange.getMessage().getBody(String.class);

        // check for generated body
        assert generatedBody != null : "Generated body should not be null.";
        assert !generatedBody.matches(".*\\{.*?\\}.*") :
                "Template contains unresolved variables: " + generatedBody;

        // check for content
        assertTrue(generatedBody.contains("TestName"));
        assertTrue(generatedBody.contains("Volleyball 🏐"));
        assertTrue(generatedBody.contains("24.12.2024"));
        assertTrue(generatedBody.contains("24.01.2025"));

    }


}