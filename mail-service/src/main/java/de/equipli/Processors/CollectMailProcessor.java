package de.equipli.Processors;

import de.equipli.DTOs.MailDTO;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

import java.nio.file.Files;
import java.nio.file.Paths;

@ApplicationScoped
public class CollectMailProcessor implements Processor {
    @Override
    public void process(Exchange exchange) throws Exception {
        MailDTO mailDTO = exchange.getIn().getBody(MailDTO.class);
        
        // Parse file 
        String htmlTemplate = new String(Files.readAllBytes(Paths.get("src/main/resources/mailTemplates/PickupReminder.html")));        
        
        // replace placeholders with actual values
        htmlTemplate = htmlTemplate.replace("{{item}}", mailDTO.getItem());
        htmlTemplate = htmlTemplate.replace("{{collectionDate}}", mailDTO.getCollectionDate());
        htmlTemplate = htmlTemplate.replace("{{returnDate}}", mailDTO.getReturnDate());
        htmlTemplate = htmlTemplate.replace("{{receiver}}", mailDTO.getTo());
        
        // create mail
        exchange.getIn().setHeader("Subject", "Abholerinnerung | Equipli");
        exchange.getIn().setHeader("To", mailDTO.getTo());
        exchange.getIn().setHeader("From", "info@equipli.com");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);
        
        

    }
}
