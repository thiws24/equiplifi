package de.equipli.processors.inventoryservice;

import de.equipli.MailServiceException;
import de.equipli.dto.inventoryservice.InventoryItemDto;
import de.equipli.dto.mail.MailCreateDto;
import de.equipli.restclient.inventoryservice.InventoryService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class GetItemToItemIdProcessor implements Processor {

    private final Logger logger;
    private final InventoryService inventoryService;

    @Inject
    public GetItemToItemIdProcessor(@RestClient InventoryService inventoryService) {
        this.logger = LoggerFactory.getLogger(GetItemToItemIdProcessor.class);
        this.inventoryService = inventoryService;
    }

    @Override
    public void process(Exchange exchange) throws Exception {

        logger.debug("Get item from inventory service");
        String itemId = exchange.getMessage().getBody(MailCreateDto.class).getItemId();
        // Get item from inventory service with http request
        InventoryItemDto item = null;
        try {
            item = inventoryService.getInventoryItem(itemId);
        }
        catch (Exception e) {
            throw new MailServiceException("Could not get item 'itemId="+ itemId  +"' from inventory service");
        }
        if (item == null) {
            throw new MailServiceException("Item 'itemId="+ itemId  +"' not found in inventory service");
        }
        if (logger.isInfoEnabled()) {
            logger.info("Item 'itemId={} found in inventory service: {}", itemId, item);
        }exchange.setProperty("item", item);
    }
}
