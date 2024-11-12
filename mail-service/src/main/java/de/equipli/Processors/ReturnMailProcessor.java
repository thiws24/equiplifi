package de.equipli.Processors;

import de.equipli.DTOs.MailDTO;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

import java.nio.file.Files;
import java.nio.file.Paths;

@ApplicationScoped
public class ReturnMailProcessor implements Processor {
    @Override
    public void process(Exchange exchange) throws Exception {
        MailDTO mailDTO = exchange.getIn().getBody(MailDTO.class);

        // Load HTML template for return reminder
        String htmlTemplate = new String(Files.readAllBytes(Paths.get("src/main/resources/mailTemplates/ReturnReminder.html")));

        // Replace placeholders
        htmlTemplate = htmlTemplate.replace("{{item}}", mailDTO.getItem());
        htmlTemplate = htmlTemplate.replace("{{returnDate}}", mailDTO.getReturnDate());
        htmlTemplate = htmlTemplate.replace("{{returnLocation}}", mailDTO.getReturnLocation());
        htmlTemplate = htmlTemplate.replace("{{receiver}}", mailDTO.getTo());

        // Set headers and body for return email
        exchange.getIn().setHeader("Subject", "Rückgabeerinnerung | Equipli");
        exchange.getIn().setHeader("To", mailDTO.getTo());
        exchange.getIn().setHeader("From", "info@equipli.com");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);


    }
}
