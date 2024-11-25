package de.equipli.processor;

import de.equipli.dto.inventoryservice.InventoryItemDto;
import de.equipli.dto.mail.CollectMailCreateDto;
import de.equipli.processors.mail.CollectMailProcessor;
import io.quarkus.qute.Template;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;

@QuarkusTest
public class CollectMailProcessorTest {

    @Inject
    Template collectmail;

    @Inject
    CollectMailProcessor collectMailProcessor;


    @Test
    void process_processesTemplateCorrect() throws Exception {

        // Arrange
        CollectMailCreateDto collectMailCreateDto = new CollectMailCreateDto();
        collectMailCreateDto.setUserId("df8e4444-4e04-4fd7-a9cd-8f938ea749c2"); //Id of Alice in Keycloak
        collectMailCreateDto.setItemId("1");
        collectMailCreateDto.setStartDate("24.12.2024");
        collectMailCreateDto.setEndDate("24.01.2025");

        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        exchange.getIn().setBody(collectMailCreateDto);

        // mock call to keycloak and inventoryservice
        exchange.setProperty("nameOfUser", "TestName");

        InventoryItemDto item = new InventoryItemDto();
        item.setName("Volleyball");
        item.setPhotoUrl("https://example.com/photo.jpg");
        item.setIcon("🏐");
        item.setUrn("example-urn");
        exchange.setProperty("item", item);

        collectMailProcessor.process(exchange);

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