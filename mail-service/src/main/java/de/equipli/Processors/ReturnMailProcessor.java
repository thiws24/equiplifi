package de.equipli.Processors;

import de.equipli.DTOs.MailDTO;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

@ApplicationScoped
public class ReturnMailProcessor implements Processor {
    @Override
    public void process(Exchange exchange) throws Exception {
        MailDTO mailDTO = exchange.getIn().getBody(MailDTO.class);
/*        exchange.getIn().setHeader("Subject", mailDTO.getSubject());
        exchange.getIn().setHeader("To", mailDTO.getTo());
        exchange.getIn().setHeader("From", mailDTO.getFrom());
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(mailDTO.getBody());
        System.out.println("Body: " + mailDTO.getBody());*/
        
        
        
    }
}
