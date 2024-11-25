package de.equipli.processor;

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

    // Quarkus injiziert das Template
    @Inject
    Template collectmail;

    @Inject
    CollectMailProcessor collectMailProcessor;


    @Test
    void process_processesTemplateCorrect() throws Exception {
        CollectMailCreateDto collectMailCreateDto = new CollectMailCreateDto();
        collectMailCreateDto.setUserId("2d751263-0e51-4bac-864f-7a8ae80999dc"); //Id of Alice in Keycloak
        collectMailCreateDto.setItemId("TestItem");
        collectMailCreateDto.setStartDate("24.12.2024");
        collectMailCreateDto.setEndDate("24.01.2025");


        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        exchange.getIn().setBody(collectMailCreateDto);

        collectMailProcessor.process(exchange);

        String generatedBody = exchange.getMessage().getBody(String.class);

        // check for generated body
        assert generatedBody != null : "Generated body should not be null.";
        assert !generatedBody.matches(".*\\{.*?\\}.*") :
                "Template contains unresolved variables: " + generatedBody;

        // check for receiver
        assertEquals("test@test.de", exchange.getProperty("to"));

        // check for content
        assertTrue(generatedBody.contains("TestName"));
        assertTrue(generatedBody.contains("TestItem"));
        assertTrue(generatedBody.contains("24.12.2024"));
        assertTrue(generatedBody.contains("24.01.2025"));
        assertTrue(generatedBody.contains("TestLocation"));

    }


}