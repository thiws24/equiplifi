package de.equipli.processors.keycloak;

import de.equipli.dto.CollectMailCreateDto;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class GetUserDataFromKeycloakProcessor implements Processor {


    Logger logger = LoggerFactory.getLogger(GetUserDataFromKeycloakProcessor.class);


    @Override
    public void process(Exchange exchange) throws Exception {
        CollectMailCreateDto collectMailCreateDto = exchange.getIn().getBody(CollectMailCreateDto.class);

        Keycloak keycloak = Keycloak.getInstance(
                "http://localhost:8081",       // Server URL
                "quarkus",                    // Realm
                "admin",                         // Username (null für client_credentials)
                "admin",                         // Password (null für client_credentials)
                "quarkus-app",                // Client ID
                "secret"                      // Client Secret
        );



        String id = collectMailCreateDto.getUserId();

        // Get user resource
        UserResource userResource = keycloak.realm("quarkus")
                .users()
                .get(id);

        // Get userdata
        UserRepresentation user = userResource.toRepresentation();

        if(user.getEmail() == null){
            logger.error("E-Mail from Keycloak is null");
            throw new RuntimeException("E-Mail from Keycloak is null");
        }

        logger.info("E-Mail from Keycloak: " + user.getEmail());
        exchange.setProperty("receiverMail", user.getEmail());

        String nameOfUser = user.getFirstName() + " " + user.getLastName();
        logger.info("Name of User: " + nameOfUser);

        if (user.getFirstName() == null || user.getLastName() == null) {
            logger.error("Name of User is null");
            throw new RuntimeException("Name of User is null");
        }
        exchange.setProperty("nameOfUser", nameOfUser);



    }
}
