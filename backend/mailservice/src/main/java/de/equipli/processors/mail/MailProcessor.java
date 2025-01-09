package de.equipli.processors.mail;

import de.equipli.dto.mail.MailDto;
import io.quarkus.qute.TemplateInstance;
import io.quarkus.qute.runtime.TemplateProducer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;


import java.util.List;


@ApplicationScoped
public class MailProcessor implements Processor {

    @Inject
    TemplateProducer templateProducer;

    @Override
    public void process(Exchange exchange) throws Exception {

        List<MailDto> mailDtoList = exchange.getMessage().getBody(List.class);

        String mailTempalte = exchange.getProperty("mailTemplate", String.class);


        // The First one is also the only one as checked in ValidationProcessor
        String receiverMail = mailDtoList.getFirst().getUser().getEmail();
        String nameOfUser = mailDtoList.getFirst().getUser().getFirstName() + " " + mailDtoList.getFirst().getUser().getLastName();


        // Render the template with Qute
        TemplateInstance templateInstance = templateProducer.getInjectableTemplate(mailTempalte)
                .data("name", nameOfUser)
                .data("mailDtoList", mailDtoList);

        String htmlTemplate = templateInstance.render();

        // create mail
        //TODO: Make Subject dynamic
        exchange.getIn().setHeader("Subject", "Eine Nachricht von equipli.de!");
        exchange.getIn().setHeader("To", receiverMail);
        exchange.getIn().setHeader("From", "equipli <info.equipli@gmail.com>");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);
    }
}
