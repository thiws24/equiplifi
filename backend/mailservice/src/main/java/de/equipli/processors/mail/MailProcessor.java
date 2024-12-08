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

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class MailProcessor implements Processor {

    @Inject
    Template mail;

    @Override
    public void process(Exchange exchange) throws Exception {

        List<MailDto> mailDtoList = exchange.getMessage().getBody(List.class);


        // The First one is also the only one as checked in ValidationProcessor
        String receiverMail = mailDtoList.getFirst().getUser().getEmail();
        String nameOfUser = mailDtoList.getFirst().getUser().getFirstName() + " " + mailDtoList.getFirst().getUser().getLastName();


        // Render the template with Qute
        TemplateInstance templateInstance = mail
                .data("name", nameOfUser)
                .data("mailDtoList", mailDtoList);

        String htmlTemplate = templateInstance.render();

        // create mail
        //TODO: Make Subject dynamic
        exchange.getIn().setHeader("Subject", "Abholerinnerung | Equipli");
        exchange.getIn().setHeader("To", receiverMail);
        exchange.getIn().setHeader("From", "info@equipli.de");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);
    }
}
