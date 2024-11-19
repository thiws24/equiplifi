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
    //TODO: Implement this test
    void testSMTPFunctionality() {

        
    }
    


}