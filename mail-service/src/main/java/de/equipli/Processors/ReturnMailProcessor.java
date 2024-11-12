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

        // Load HTML template for return reminder
        String htmlTemplate = new String(Files.readAllBytes(Paths.get("src/main/resources/mailTemplates/ReturnReminder.html")));

        // Replace placeholders
        htmlTemplate = htmlTemplate.replace("{{item}}", mailDTO.getItem());
        htmlTemplate = htmlTemplate.replace("{{collectionDate}}", mailDTO.getCollectionDate());
        htmlTemplate = htmlTemplate.replace("{{returnDate}}", mailDTO.getReturnDate());
        htmlTemplate = htmlTemplate.replace("{{receiver}}", mailDTO.getTo());

        // Set headers and body for return email
        exchange.getIn().setHeader("Subject", "Rückgabeerinnerung | Equipli");
        exchange.getIn().setHeader("To", mailDTO.getTo());
        exchange.getIn().setHeader("From", "info@equipli.com");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);


    }
}
