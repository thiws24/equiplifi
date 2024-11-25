package de.equipli.processors.inventoryservice;

import de.equipli.dto.CollectMailCreateDto;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

public class GetItemToItemIdProcessor implements Processor {
    @Override
    public void process(Exchange exchange) throws Exception {
        String itemId = exchange.getIn().getBody(CollectMailCreateDto.class).getItemId();

        // Get item from inventory service with http request


    }
}
