package de.equipli.routes;

import de.equipli.aggregator.ArrayListAggregationStrategy;
import de.equipli.dto.inventoryservice.InventoryItemDto;
import de.equipli.dto.mail.MailCreateDto;
import de.equipli.dto.mail.MailDto;
import de.equipli.dto.user.UserDto;
import de.equipli.processors.inventoryservice.GetItemToItemIdProcessor;
import de.equipli.processors.keycloak.GetUserDataFromKeycloakProcessor;
import de.equipli.processors.mail.MailProcessor;
import de.equipli.processors.mail.ValidationProcessor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.jackson.JacksonDataFormat;
import org.eclipse.microprofile.config.inject.ConfigProperty;

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
    GetUserDataFromKeycloakProcessor getUserDataFromKeycloakProcessor;

    @Inject
    GetItemToItemIdProcessor getItemToItemIdProcessor;


    @Override
    public void configure() throws Exception {

        JacksonDataFormat mailDtoFormat = new JacksonDataFormat(MailCreateDto[].class);


        rest()
                .post("/request-confirmation/")
                .to("direct:request-confirmation")

                .post("/reservation-confirmation/")
                .to("direct:reservation-confirmation")

                .post("/storekeeper-confirmation/")
                .to("direct:storekeeper-confirmation")

                .post("/cancellation-confirmation/")
                .to("direct:cancellation-confirmation")

                .post("/return-confirmation/")
                .to("direct:return-confirmation")

                .post("/return-reminder/")
                .to("direct:return-reminder")

                .post("/reservation-rejection/")
                .to("direct:reservation-rejection");


// Request Confirmation Route
        from("activemq:queue:request-confirmation")
                .routeId("sendRequestConfirmation-queue-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("request-confirmation-mail.html"))
                .to("direct:sendMail");

        from("direct:request-confirmation")
                .routeId("sendRequestConfirmation-rest-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("request-confirmation-mail.html"))
                .to("direct:sendMail");


// Reservation Confirmation Route
        from("activemq:queue:reservation-confirmation")
                .routeId("sendReservationConfirmation-queue-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("reservation-confirmation-mail.html"))
                .to("direct:sendMail");

        from("direct:reservation-confirmation")
                .routeId("sendReservationConfirmation-rest-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("reservation-confirmation-mail.html"))
                .to("direct:sendMail");

// storekeeper-confirmation Route
        from("activemq:queue:storekeeper-confirmation")
                .routeId("sendStorekeeperConfirmation-queue-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("storekeeper-confirmation-mail.html"))
                .to("direct:sendMail");

        from("direct:storekeeper-confirmation")
                .routeId("sendStorekeeperConfirmation-rest-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("storekeeper-confirmation-mail.html"))
                .to("direct:sendMail");

// cancellation-confirmation Route
        from("activemq:queue:cancellation-confirmation")
                .routeId("sendCancellationConfirmation-queue-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("cancellation-confirmation-mail.html"))
                .to("direct:sendMail");

        from("direct:cancellation-confirmation")
                .routeId("sendCancellationConfirmation-rest-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("cancellation-confirmation-mail.html"))
                .to("direct:sendMail");


// Return Confirmation Route
        from("activemq:queue:return-confirmation")
                .routeId("sendReturnConfirmation-queue-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("return-confirmation-mail.html"))
                .to("direct:sendMail");

        from("direct:return-confirmation")
                .routeId("sendReturnConfirmation-rest-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("return-confirmation-mail.html"))
                .to("direct:sendMail");

// Return Reminder Route
        from("activemq:queue:return-reminder")
                .routeId("sendReturnReminder-queue-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("return-reminder-mail.html"))
                .to("direct:sendMail");

        from("direct:return-reminder")
                .routeId("sendReturnReminder-rest-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("return-reminder-mail.html"))
                .to("direct:sendMail");

// reservation-rejection Route
        from("activemq:queue:reservation-rejection")
                .routeId("reservationRejection-queue-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("reservation-rejection.html"))
                .to("direct:sendMail");

        from("direct:reservation-rejection")
                .routeId("reservationRejection-rest-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("reservation-rejection.html"))
                .to("direct:sendMail");

// Main E-Mail Route
        from("direct:sendMail")
                // Validate Input
                .process(validationProcessor)
                .split(body(), new ArrayListAggregationStrategy())
                    .to("direct:getItemToItemId")
                    .to("direct:getUserDataFromKeycloak")
                    .to("direct:aggregateMailInformation")
                .end()
                .process(mailProcessor)
                .choice()

                //dev
                .when(simple(String.valueOf("dev".equals(activeProfile))))
                .to("smtp://{{smtp.config.host}}:{{smtp.config.port}}")

                //test
                .when(simple(String.valueOf("test".equals(activeProfile))))
                .to("smtp://{{smtp.config.host}}:{{smtp.config.port}}")

                //prod
                .otherwise()
                .to("smtps://{{smtp.config.host}}:{{smtp.config.port}}"
                    + "?username={{smtp.config.username}}&password={{smtp.config.password}}")
                .end();


// Helper Routes
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
                    mailDto.setReservationId(exchange.getMessage().getBody(MailCreateDto.class).getReservationId());

                    exchange.getMessage().setBody(mailDto);

                })
                .end();
    }
}
