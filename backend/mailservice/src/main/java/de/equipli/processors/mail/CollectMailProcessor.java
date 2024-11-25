package de.equipli.processors.mail;

import de.equipli.dto.inventoryservice.InventoryItemDto;
import de.equipli.dto.mail.CollectMailCreateDto;
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
        CollectMailCreateDto collectMailCreateDto = exchange.getIn().getBody(CollectMailCreateDto.class);


        // Collect the necessary data from the exchange
        String receiverMail = exchange.getProperty("receiverMail", String.class);
        String nameOfUser = exchange.getProperty("nameOfUser", String.class);
        InventoryItemDto item = exchange.getProperty("item", InventoryItemDto.class);

        // Render the template with Qute
        TemplateInstance templateInstance = collectmail
                .data("name", nameOfUser)
                .data("item", item.getName() + " " + item.getIcon())
                .data("collectionDate", collectMailCreateDto.getStartDate())
                .data("returnDate", collectMailCreateDto.getEndDate());

        String htmlTemplate = templateInstance.render();

        // create mail
        exchange.getIn().setHeader("Subject", "Abholerinnerung | Equipli");
        exchange.getIn().setHeader("To", receiverMail);
        exchange.getIn().setHeader("From", "info@equipli.de");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);



    }
}
