package de.equipli.Routes;

import de.equipli.DTOs.MailDTO;
import de.equipli.GenericResponse;
import de.equipli.Processors.CollectMailProcessor;
import de.equipli.Processors.ReturnMailProcessor;
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
                .unmarshal().json(MailDTO.class)
                .process(collectMailProcessor)
                .to("smtp://" + smtpHost + ":" + smtpPort)
                .process(
                        exchange -> exchange.getIn().setBody(
                                new GenericResponse("Mail sent successfully")
                        )
                )
                .marshal().json();

        from("direct:sendReturnMail")
                .unmarshal().json(MailDTO.class)
                .process(returnMailProcessor)
                .to("smtp://" + smtpHost + ":" + smtpPort);
    }
}
