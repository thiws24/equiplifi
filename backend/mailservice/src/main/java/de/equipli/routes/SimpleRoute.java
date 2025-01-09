package de.equipli.routes;

import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.builder.RouteBuilder;


// Only to have a sanity check test
@ApplicationScoped
public class SimpleRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        from("direct:testRoute")
                .log("Received: ${body}")
                .transform(body().convertToString())
                .to("mock:result");
    }
}
