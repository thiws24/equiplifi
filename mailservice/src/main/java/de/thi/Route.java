package de.thi;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.builder.RouteBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class Route extends RouteBuilder {
    
    @Inject
    MailProcessor mailProcessor;

    @ConfigProperty(name = "smtp.host")
    String smtpHost;
    
    @ConfigProperty(name = "smtp.port")
    String smtpPort;
    
    @Override
    public void configure() throws Exception {
        rest().get("/hello")
                .to("direct:hello")
                .post("sendMail")
                .type(MailDTO.class)
                .to("direct:sendmail");
        
        from("direct:hello")
                .transform().constant("Hello World");
        
        from("direct:sendmail")
                .unmarshal().json(MailDTO.class)
                .process(mailProcessor)
                .to("smtp://" + smtpHost + ":" + smtpPort );
    }
}
