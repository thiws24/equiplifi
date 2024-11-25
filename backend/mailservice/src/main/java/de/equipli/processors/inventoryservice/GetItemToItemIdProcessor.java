package de.equipli.processors.inventoryservice;

import de.equipli.dto.inventoryservice.InventoryItemDto;
import de.equipli.dto.mail.CollectMailCreateDto;
import de.equipli.restclient.inventoryservice.InventoryService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@ApplicationScoped
public class GetItemToItemIdProcessor implements Processor {

    @Inject
    @RestClient
    InventoryService inventoryService;

    @Override
    public void process(Exchange exchange) throws Exception {
        String itemId = exchange.getIn().getBody(CollectMailCreateDto.class).getItemId();

        // Get item from inventory service with http request
        InventoryItemDto item = null;

        try {
            item = inventoryService.getInventoryItem(itemId);
        }
        catch (Exception e) {
            throw new RuntimeException("Could not get item 'itemId="+ itemId  +"' from inventory service");
        }
        if (item == null) {
            throw new RuntimeException("Item 'itemId="+ itemId  +"' not found in inventory service");
        }
        exchange.setProperty("item", item);

    }
}
