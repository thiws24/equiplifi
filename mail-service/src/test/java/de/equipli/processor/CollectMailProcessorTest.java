package de.equipli.processor;

import de.equipli.dto.CollectMailDto;
import de.equipli.processors.CollectMailProcessor;
import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@QuarkusTest
public class CollectMailProcessorTest {

    // Quarkus injiziert das Template
    @Inject
    Template collectmail;

    @Inject
    CollectMailProcessor collectMailProcessor;


    @Test
    void process_processesTemplateCorrect() throws Exception {
        CollectMailDto collectMailDto = new CollectMailDto();
        collectMailDto.setReceiverMail("test@test.de");
        collectMailDto.setName("TestName");
        collectMailDto.setItem("TestItem");
        collectMailDto.setCollectionDate("24.12.2024");
        collectMailDto.setReturnDate("24.01.2025");
        collectMailDto.setPickupLocation("TestLocation");

        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        exchange.getIn().setBody(collectMailDto);

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