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
public class CollectMailProcessor implements Processor {


    @Inject
    Template pickupReminder;

    @Override
    public void process(Exchange exchange) throws Exception {
        MailDTO mailDTO = exchange.getIn().getBody(MailDTO.class);

        // Render the template with Qute
        TemplateInstance templateInstance = pickupReminder
                .data("item", mailDTO.getItem())
                .data("collectionDate", mailDTO.getCollectionDate())
                .data("returnDate", mailDTO.getReturnDate())
                .data("pickupLocation", mailDTO.getPickupLocation())
                .data("receiver", mailDTO.getTo());

        String htmlTemplate = templateInstance.render();

        // create mail
        exchange.getIn().setHeader("Subject", "Abholerinnerung | Equipli");
        exchange.getIn().setHeader("To", mailDTO.getTo());
        exchange.getIn().setHeader("From", "info@equipli.de");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);



    }
}
