package de.equipli.routes;

import de.equipli.dto.mail.CollectMailCreateDto;
import de.equipli.GenericResponse;
import de.equipli.dto.mail.ReturnMailDto;
import de.equipli.processors.inventoryservice.GetItemToItemIdProcessor;
import de.equipli.processors.mail.CollectMailProcessor;
import de.equipli.processors.mail.ReturnMailProcessor;
import de.equipli.processors.keycloak.GetUserDataFromKeycloakProcessor;
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

    @Inject
    GetUserDataFromKeycloakProcessor getUserDataFromKeycloakProcessor;

    @Inject
    GetItemToItemIdProcessor getItemToItemIdProcessor;

    @Override
    public void configure() throws Exception {
        rest()
                .post("sendCollectionMail")
                .type(CollectMailCreateDto.class)
                .to("direct:sendCollectionMail")

                .post("sendReturnMail")
                .type(ReturnMailDto.class)
                .to("direct:sendReturnMail");


        from("direct:sendCollectionMail")
                .routeId("sendCollectionMail-Route")
                .unmarshal().json(CollectMailCreateDto.class)

                .process(getItemToItemIdProcessor)
                .process(getUserDataFromKeycloakProcessor)
                
                .process(collectMailProcessor)
                .choice()
                    .when(simple(String.valueOf("dev".equals(activeProfile))))
                        .to("smtp://{{smtp.config.host}}:{{smtp.config.port}}")
                    .otherwise()
                        .to("smtps://{{smtp.config.host}}:{{smtp.config.port}}"
                        + "?username={{smtp.config.username}}&password={{smtp.config.password}}")
                .end()
                // get to address from mailDTO in Property
                .log("CollectionMail sent successfully to ${exchangeProperty.receiverMail}")
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
