package de.equipli.routes;

import de.equipli.dto.CollectMailDto;
import de.equipli.GenericResponse;
import de.equipli.dto.ReturnMailDto;
import de.equipli.processors.CollectMailProcessor;
import de.equipli.processors.ReturnMailProcessor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.builder.RouteBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class MailRoute extends RouteBuilder {

    @Inject
    CollectMailProcessor collectMailProcessor;

    @Inject
    ReturnMailProcessor returnMailProcessor;

    @Inject
    @ConfigProperty(name = "quarkus.profile")
    String activeProfile;

    @ConfigProperty(name = "smtp.config.host", defaultValue = "localhost")
    String smtpHost;
    
    @ConfigProperty(name = "smtp.config.port", defaultValue = "2525")
    String smtpPort;

    @ConfigProperty(name = "smtp.config.username", defaultValue = "user")
    String username;

    @ConfigProperty(name = "smtp.config.password", defaultValue = "password")
    String password;

    @Override
    public void configure() throws Exception {
        rest()
                .post("sendCollectionMail")
                .type(CollectMailDto.class)
                .to("direct:sendCollectionMail")

                .post("sendReturnMail")
                .type(ReturnMailDto.class)
                .to("direct:sendReturnMail");


        from("direct:sendCollectionMail")
                .routeId("sendCollectionMail-Route")
                .unmarshal().json(CollectMailDto.class)
                .process(collectMailProcessor)
                .choice()
                    .when(simple(String.valueOf("dev".equals(activeProfile))))
                        .to("smtp://{{smtp.config.host}}:{{smtp.config.port}}")
                    .otherwise()
                        .to("smtps://{{smtp.config.host}}:{{smtp.config.port}}"
                        + "?username={{smtp.config.username}}&password={{smtp.config.password}}")
                .end()
                // get to address from mailDTO in Property
                .log("CollectionMail sent successfully to ${exchangeProperty.to}")
                .process(
                        exchange -> exchange.getMessage().setBody(
                                new GenericResponse("Collection reminder sent successfully")
                        )
                )
                .marshal().json();

        from("direct:sendReturnMail")
                .routeId("sendReturnMail-Route")
                .unmarshal().json(ReturnMailDto.class)
                .process(returnMailProcessor)

                .choice()
                    .when(simple(String.valueOf("dev".equals(activeProfile))))
                        .to("smtp://{{smtp.config.host}}:{{smtp.config.port}}")
                    .otherwise()
                        .to("smtps://{{smtp.config.host}}:{{smtp.config.port}}"
                        + "?username={{smtp.config.username}}&password={{smtp.config.password}}")
                    .end()
                .log("ReturnMail sent successfully to ${exchangeProperty.to}")
                .process(
                        exchange -> exchange.getIn().setBody(
                                new GenericResponse("Return reminder sent successfully")
                        )
                )
                .marshal().json();

    }
}
