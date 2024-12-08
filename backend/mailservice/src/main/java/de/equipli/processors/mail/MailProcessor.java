package de.equipli.processors.mail;

import de.equipli.dto.inventoryservice.InventoryItemDto;
import de.equipli.dto.mail.MailCreateDto;
import de.equipli.dto.mail.MailDto;
import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

import java.util.List;

@ApplicationScoped
public class MailProcessor implements Processor {

    @Inject
    Template mail;

    @Override
    public void process(Exchange exchange) throws Exception {

        List<MailDto> mailDtoList = exchange.getMessage().getBody(List.class);

        MailCreateDto mailCreateDto = exchange.getIn().getBody(MailCreateDto.class);

        // Collect the necessary data from the exchange
        String receiverMail = exchange.getProperty("receiverMail", String.class);
        String nameOfUser = exchange.getProperty("nameOfUser", String.class);
        InventoryItemDto item = exchange.getProperty("item", InventoryItemDto.class);

        // Render the template with Qute
        TemplateInstance templateInstance = mail
                .data("name", nameOfUser)
                .data("item", item.getName() + " " + item.getIcon())
                .data("collectionDate", mailCreateDto.getStartDate())
                .data("returnDate", mailCreateDto.getEndDate());

        String htmlTemplate = templateInstance.render();

        // create mail
        exchange.getIn().setHeader("Subject", "Abholerinnerung | Equipli");
        exchange.getIn().setHeader("To", receiverMail);
        exchange.getIn().setHeader("From", "info@equipli.de");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);
    }
}
