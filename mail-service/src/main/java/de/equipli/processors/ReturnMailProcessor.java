package de.equipli.processors;

import de.equipli.dto.CollectMailDto;
import de.equipli.dto.ReturnMailDto;
import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

@ApplicationScoped
public class ReturnMailProcessor implements Processor {

    @Inject
    Template returnmail;

    @Override
    public void process(Exchange exchange) throws Exception {
        ReturnMailDto returnMailDto = exchange.getIn().getBody(ReturnMailDto.class);

        exchange.setProperty("to", returnMailDto.getReceiverMail());

        System.out.println(returnMailDto.getReturnDate());

        // Render the template with Qute
        TemplateInstance templateInstance = returnmail
                .data("name", returnMailDto.getName())
                .data("item", returnMailDto.getItem())
                .data("returnDate", returnMailDto.getReturnDate())
                .data("returnLocation", returnMailDto.getReturnLocation());

        String htmlTemplate = templateInstance.render();

        // Set headers and body for return email
        exchange.getIn().setHeader("Subject", "Rückgabeerinnerung | Equipli");
        exchange.getIn().setHeader("To", returnMailDto.getReceiverMail());
        exchange.getIn().setHeader("From", "info@equipli.de");
        exchange.getIn().setHeader("Content-Type", "text/html");
        exchange.getIn().setBody(htmlTemplate);


    }
}
