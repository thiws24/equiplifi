package de.equipli.processors;

import de.equipli.dto.MailDTO;
import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

import java.nio.file.Files;
import java.nio.file.Paths;

@ApplicationScoped
public class ReturnMailProcessor implements Processor {

    @Inject
    Template returnReminder;

    @Override
    public void process(Exchange exchange) throws Exception {
        MailDTO mailDTO = exchange.getIn().getBody(MailDTO.class);

        // Render the template with Qute
        TemplateInstance templateInstance = returnReminder
                .data("item", mailDTO.getItem())
                .data("returnDate", mailDTO.getReturnDate())
                .data("returnLocation", mailDTO.getReturnLocation())
                .data("receiver", mailDTO.getTo());

        String htmlTemplate = templateInstance.render();

        // Set headers and body for return email
        exchange.getIn().setHeader("Subject", "Rückgabeerinnerung | Equipli");
        exchange.getIn().setHeader("To", mailDTO.getTo());
        exchange.getIn().setHeader("From", "info@equipli.com");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);


    }
}
