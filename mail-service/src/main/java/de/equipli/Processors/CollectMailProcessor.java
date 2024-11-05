package de.equipli.Processors;

import de.equipli.DTOs.MailDTO;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

@ApplicationScoped
public class CollectMailProcessor implements Processor {
    @Override
    public void process(Exchange exchange) throws Exception {
        MailDTO mailDTO = exchange.getIn().getBody(MailDTO.class);

    }
}
