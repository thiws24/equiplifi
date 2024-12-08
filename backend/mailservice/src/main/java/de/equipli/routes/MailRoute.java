package de.equipli.routes;

import de.equipli.dto.mail.MailCreateDto;
import de.equipli.processors.inventoryservice.GetItemToItemIdProcessor;
import de.equipli.processors.mail.MailProcessor;
import de.equipli.processors.mail.ReturnMailProcessor;
import de.equipli.processors.keycloak.GetUserDataFromKeycloakProcessor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.builder.RouteBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@ApplicationScoped
public class MailRoute extends RouteBuilder {

    @Inject
    MailProcessor mailProcessor;

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

    Logger logger = LoggerFactory.getLogger(MailRoute.class);

    @Override
    public void configure() throws Exception {

        // REST
/*        rest()
                .post("send-reservation-confirmation")
                .type(MailCreateDto.class)
                .to("direct:sendReservationConfirmation")

                .post("sendReturnMail")
                .type(ReturnMailDto.class)
                .to("direct:sendReturnMail");*/

        // QUEUE

        from("timer:trigger?period=10000")  // Alle 1000 ms wird diese Route ausgelöst
                .routeId("test")
                        .setBody().constant("Hello World")
                        .log("Hello World")
        .to("activemq:queue:test-queue");

        from("activemq:queue:send-reservation-confirmation-queue")
                .routeId("sendReservationConfirmation-Route")
                .unmarshal().json(List.class, MailCreateDto.class)
                .process(exchange ->
                {
                    List<MailCreateDto> mailCreateDtos = exchange.getIn().getBody(List.class);
                    logger.info("Received " + mailCreateDtos.size() + " Objects to send");
                })
                .split().body()
                    .to("direct:getItemToItemId")
                    //.to("direct:getUserDataFromKeycloak")
                .end()
                .to("activemq:queue:test-queue");


        from("direct:getItemToItemId")
                .routeId("getItemToItemId-Route")
                .unmarshal().json(MailCreateDto.class)
                .log("Split Message :${body}")
                .process(
                        exchange -> {
                            Object object = exchange.getMessage().getBody();
                            MailCreateDto mailCreateDto = exchange.getMessage().getBody(MailCreateDto.class);
                            MailCreateDto mailCreateDto1 = (MailCreateDto) object;
                            logger.info("Object : " + object);
                        }
                )

                //.process(getItemToItemIdProcessor)
                .end();

/*        from("direct:getUserDataFromKeycloak")
                .routeId("getUserDataFromKeycloak-Route")

                .process(getUserDataFromKeycloakProcessor)
                .end();*/


    }
}
