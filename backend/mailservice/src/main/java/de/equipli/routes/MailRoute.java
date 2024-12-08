package de.equipli.routes;

import de.equipli.aggregator.ArrayListAggregationStrategy;
import de.equipli.dto.inventoryservice.InventoryItemDto;
import de.equipli.dto.mail.MailCreateDto;
import de.equipli.dto.mail.MailDto;
import de.equipli.dto.user.UserDto;
import de.equipli.processors.MapToCreateMailDtoProcessor;
import de.equipli.processors.inventoryservice.GetItemToItemIdProcessor;
import de.equipli.processors.mail.MailProcessor;
import de.equipli.processors.keycloak.GetUserDataFromKeycloakProcessor;
import de.equipli.processors.mail.ValidationProcessor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.jackson.JacksonDataFormat;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@ApplicationScoped
public class MailRoute extends RouteBuilder {

    @Inject
    MailProcessor mailProcessor;

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
    ValidationProcessor validationProcessor;

    @Inject
    MapToCreateMailDtoProcessor mapToCreateMailDtoProcessor;

    @Inject
    GetUserDataFromKeycloakProcessor getUserDataFromKeycloakProcessor;

    @Inject
    GetItemToItemIdProcessor getItemToItemIdProcessor;

    Logger logger = LoggerFactory.getLogger(MailRoute.class);

    @Override
    public void configure() throws Exception {

        JacksonDataFormat mailDtoFormat = new JacksonDataFormat(MailCreateDto[].class);

        from("activemq:queue:send-reservation-confirmation-queue")
                .routeId("sendReservationConfirmation-Route")
                .log("Raw body: ${body}")
                .unmarshal(mailDtoFormat)
                .log("Unmarshalled body: ${body}")

                // Validate Input
                .process(validationProcessor)

                .split(body(), new ArrayListAggregationStrategy())
                    //.process(mapToCreateMailDtoProcessor)
                    .to("direct:getItemToItemId")
                    .to("direct:getUserDataFromKeycloak")
                    .to("direct:aggregateMailInformation")

                .end()
                .process(mailProcessor)
                .marshal().json()
                .to("activemq:queue:test-queue2");


        from("direct:getItemToItemId")
                .routeId("getItemToItemId-Route")
                .log("getItemToItemId Message :${body}")
                .process(getItemToItemIdProcessor)
                .end();

        from("direct:getUserDataFromKeycloak")
                .routeId("getUserDataFromKeycloak-Route")
                .log("getUserDataFromKeycloak Message :${body}")
                .process(getUserDataFromKeycloakProcessor)
                .end();

        from("direct:aggregateMailInformation")
                .routeId("aggregateMailInformation-Route")
                .process(exchange ->
                {

                    Object obj =  exchange.getAllProperties();

                    String receiverMail = exchange.getProperty("receiverMail", String.class);
                    String firstName = exchange.getProperty("firstName", String.class);
                    String lastName = exchange.getProperty("lastName", String.class);

                    InventoryItemDto item = exchange.getProperty("item", InventoryItemDto.class);

                    UserDto user = new UserDto();
                    user.setEmail(receiverMail);
                    user.setFirstName(firstName);
                    user.setLastName(lastName);

                    MailDto mailDto = new MailDto();
                    mailDto.setUser(user);
                    mailDto.setInventoryItemDto(item);
                    mailDto.setStartDate(exchange.getMessage().getBody(MailCreateDto.class).getStartDate());
                    mailDto.setEndDate(exchange.getMessage().getBody(MailCreateDto.class).getEndDate());


                    exchange.getMessage().setBody(mailDto);

                })
                .end();


    }
}
