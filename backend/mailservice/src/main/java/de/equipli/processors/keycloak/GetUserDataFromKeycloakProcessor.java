package de.equipli.processors.keycloak;

import de.equipli.MailServiceException;
import de.equipli.dto.mail.MailCreateDto;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class GetUserDataFromKeycloakProcessor implements Processor {

    Logger logger = LoggerFactory.getLogger(GetUserDataFromKeycloakProcessor.class);

    @ConfigProperty(name ="quarkus.keycloak.admin-client.server-url")
    String keycloakServerUrl;

    @ConfigProperty(name ="quarkus.keycloak.admin-client.realm")
    String keycloakRealm;

    @ConfigProperty(name ="quarkus.keycloak.admin-client.client-id")
    String keycloakClientId;

    @ConfigProperty(name ="quarkus.keycloak.admin-client.client-secret")
    String keycloakClientSecret;

    @ConfigProperty(name ="quarkus.keycloak.admin-client.username")
    String keycloakUsername;

    @ConfigProperty(name ="quarkus.keycloak.admin-client.password")
    String keycloakPassword;

    @ConfigProperty(name = "quarkus.keycloak.admin-client.grant-type")
    String keycloakGrantType;



    @Override
    public void process(Exchange exchange) throws Exception {
        MailCreateDto mailCreateDto = exchange.getIn().getBody(MailCreateDto.class);

        Keycloak keycloak = Keycloak.getInstance(
                keycloakServerUrl,       // Server URL
                keycloakRealm,           // Realm
                keycloakUsername,        // Username (null für client_credentials)
                keycloakPassword,        // Password (null für client_credentials)
                keycloakClientId,        // Client ID
                keycloakClientSecret     // Client Secret
        );
        String id = mailCreateDto.getUserId();
        // Get user resource
        UserResource userResource = keycloak.realm(keycloakRealm)
                .users()
                .get(id);
        // Get userdata
        UserRepresentation user = userResource.toRepresentation();

        if(user.getEmail() == null){
            logger.error("E-Mail from Keycloak is null");
            throw new MailServiceException("E-Mail from Keycloak is null");
        }

        logger.info("E-Mail from Keycloak: {} ", user.getEmail());
        exchange.setProperty("receiverMail", user.getEmail());

        String firstName = user.getFirstName();
        String lastName = user.getLastName();
        logger.info("Name of User: {} {}", firstName, lastName);

        if (user.getFirstName() == null || user.getLastName() == null) {
            logger.error("Name of User is null");
            throw new MailServiceException("Name of User is null");
        }
        exchange.setProperty("firstName", firstName);
        exchange.setProperty("lastName", lastName);
    }
}
