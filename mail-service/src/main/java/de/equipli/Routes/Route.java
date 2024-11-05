package de.equipli.Routes;

import de.equipli.DTOs.MailDTO;
import de.equipli.Processors.ReturnMailProcessor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.builder.RouteBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class Route extends RouteBuilder {
    
    @Inject
    ReturnMailProcessor mailProcessor;

    @ConfigProperty(name = "smtp.host")
    String smtpHost;
    
    @ConfigProperty(name = "smtp.port")
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
                .process(mailProcessor)
                .to("smtp://" + smtpHost + ":" + smtpPort );

        from("direct:sendReturnMail")
                .unmarshal().json(MailDTO.class)
                .process(mailProcessor)
                .to("smtp://" + smtpHost + ":" + smtpPort );
    }
}
