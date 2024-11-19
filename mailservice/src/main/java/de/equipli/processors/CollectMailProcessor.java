package de.equipli.processors;

import de.equipli.dto.CollectMailDto;
import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;;

@ApplicationScoped
public class CollectMailProcessor implements Processor {


    @Inject
    Template collectmail;

    @Override
    public void process(Exchange exchange) throws Exception {
        CollectMailDto collectMailDto = exchange.getIn().getBody(CollectMailDto.class);

        exchange.setProperty("to", collectMailDto.getReceiverMail());

        // Render the template with Qute
        TemplateInstance templateInstance = collectmail
                .data("name", collectMailDto.getName())
                .data("item", collectMailDto.getItem())
                .data("collectionDate", collectMailDto.getCollectionDate())
                .data("returnDate", collectMailDto.getReturnDate())
                .data("pickupLocation", collectMailDto.getPickupLocation());

        String htmlTemplate = templateInstance.render();

        // create mail
        exchange.getIn().setHeader("Subject", "Abholerinnerung | Equipli");
        exchange.getIn().setHeader("To", collectMailDto.getReceiverMail());
        exchange.getIn().setHeader("From", "info@equipli.de");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);



    }
}
