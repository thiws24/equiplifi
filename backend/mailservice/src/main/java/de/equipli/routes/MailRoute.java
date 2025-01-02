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

    private final MailProcessor mailProcessor;
    private final ValidationProcessor validationProcessor;
    private final GetUserDataFromKeycloakProcessor getUserDataFromKeycloakProcessor;
    private final GetItemToItemIdProcessor getItemToItemIdProcessor;
    private final String activeProfile;
    private final String smtpHost;
    private final String smtpPort;
    private final String username;
    private final String password;

    @Inject
    public MailRoute(
            MailProcessor mailProcessor,
            ValidationProcessor validationProcessor,
            GetUserDataFromKeycloakProcessor getUserDataFromKeycloakProcessor,
            GetItemToItemIdProcessor getItemToItemIdProcessor,
            @ConfigProperty(name = "quarkus.profile") String activeProfile,
            @ConfigProperty(name = "smtp.config.host", defaultValue = "localhost") String smtpHost,
            @ConfigProperty(name = "smtp.config.port", defaultValue = "2525") String smtpPort,
            @ConfigProperty(name = "smtp.config.username", defaultValue = "user") String username,
            @ConfigProperty(name = "smtp.config.password", defaultValue = "password") String password) {
        this.mailProcessor = mailProcessor;
        this.validationProcessor = validationProcessor;
        this.getUserDataFromKeycloakProcessor = getUserDataFromKeycloakProcessor;
        this.getItemToItemIdProcessor = getItemToItemIdProcessor;
        this.activeProfile = activeProfile;
        this.smtpHost = smtpHost;
        this.smtpPort = smtpPort;
        this.username = username;
        this.password = password;
    }


    @Override
    public void configure() throws Exception {

        JacksonDataFormat mailDtoFormat = new JacksonDataFormat(MailCreateDto[].class);


// Request Confirmation Route
        from("activemq:queue:request-confirmation")
                .routeId("sendRequestConfirmation-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("request-confirmation-mail.html"))
                .to("direct:sendMail");


// Reservation Confirmation Route
        from("activemq:queue:reservation-confirmation")
                .routeId("sendReservationConfirmation-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("reservation-confirmation-mail.html"))
                .to("direct:sendMail");

// storekeeper-confirmation Route
        from("activemq:queue:storekeeper-confirmation")
                .routeId("sendStorekeeperConfirmation-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("storekeeper-confirmation-mail.html"))
                .to("direct:sendMail");

// cancellation-confirmation Route
        from("activemq:queue:cancellation-confirmation")
                .routeId("sendCancellationConfirmation-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("cancellation-confirmation-mail.html"))
                .to("direct:sendMail");


// Return Confirmation Route
        from("activemq:queue:return-confirmation")
                .routeId("sendReturnConfirmation-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("return-confirmation-mail.html"))
                .to("direct:sendMail");

// Return Reminder Route
        from("activemq:queue:return-reminder")
                .routeId("sendReturnReminder-Route")
                .unmarshal(mailDtoFormat)
                .setProperty("mailTemplate", simple("return-reminder-mail.html"))
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
                .when(simple(String.valueOf("dev".equals(activeProfile))))
                .to("smtp://{{smtp.config.host}}:{{smtp.config.port}}")
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
