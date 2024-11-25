package de.equipli.processor;


import de.equipli.dto.mail.ReturnMailDto;

import de.equipli.processors.mail.ReturnMailProcessor;
import io.quarkus.qute.Template;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
public class ReturnMailProcessorTest {

    @Inject
    Template returnmail;

    @Inject
    ReturnMailProcessor returnMailProcessor;

    @Test
    void process_setsCorrectHeadersAndBody() throws Exception {
        ReturnMailDto returnMailDto = new ReturnMailDto();

        returnMailDto.setReceiverMail("test@test.de");
        returnMailDto.setName("TestName");
        returnMailDto.setItem("TestItem");
        returnMailDto.setReturnDate("24.01.2025");
        returnMailDto.setReturnLocation("TestLocation");

        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        exchange.getIn().setBody(returnMailDto);

        returnMailProcessor.process(exchange);

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
        assertTrue(generatedBody.contains("24.01.2025"));
        assertTrue(generatedBody.contains("TestLocation"));
    }

}
