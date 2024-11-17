package de.equipli.routes;

import de.equipli.dto.MailDTO;
import de.equipli.GenericResponse;
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

    @ConfigProperty(name = "CONFIG.SMTP.HOST", defaultValue = "localhost")
    String smtpHost;
    
    @ConfigProperty(name = "CONFIG.SMTP.PORT", defaultValue = "2525")
    String smtpPort;

    @ConfigProperty(name = "CONFIG.SMTP.USERNAME", defaultValue = "user")
    String username;

    @ConfigProperty(name = "CONFIG.SMTP.PASSWORD", defaultValue = "password")
    String password;

    @Override
    public void configure() throws Exception {
        rest()
                .post("sendCollectionMail")
                .type(MailDTO.class)
                .to("direct:sendCollectionMail")

                .post("sendReturnMail")
                .type(MailDTO.class)
                .to("direct:sendReturnMail");


        from("direct:sendCollectionMail")
                .routeId("sendCollectionMail-Route")
                .unmarshal().json(MailDTO.class)
                .process(collectMailProcessor)
                // For local testing, use smtp:// instead of smtps: and without credentials
                //.to("smtp://" + smtpHost + ":" + smtpPort)
                .to("smtps://" + smtpHost + ":" + smtpPort+ "?username="+ username +"&password="+ password)
                .process(
                        exchange -> exchange.getIn().setBody(
                                new GenericResponse("Collection reminder sent successfully")
                        )
                )
                .marshal().json();

        from("direct:sendReturnMail")
                .routeId("sendReturnMail-Route")
                .unmarshal().json(MailDTO.class)
                .process(returnMailProcessor)
                // For local testing, use smtp:// instead of smtps: and without credentials
                //.to("smtp://" + smtpHost + ":" + smtpPort)
                .to("smtps://" + smtpHost + ":" + smtpPort+ "?username="+ username +"&password="+ password)

                .process(
                        exchange -> exchange.getIn().setBody(
                                new GenericResponse("Return reminder sent successfully")
                        )
                )
                .marshal().json();

    }
}
