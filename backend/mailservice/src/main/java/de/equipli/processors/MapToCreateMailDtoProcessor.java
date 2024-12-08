package de.equipli.processors;

import de.equipli.dto.mail.MailCreateDto;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.LinkedHashMap;

@ApplicationScoped
public class MapToCreateMailDtoProcessor implements Processor {


    private static final Logger logger = LoggerFactory.getLogger(MapToCreateMailDtoProcessor.class);

    @Override
    public void process(Exchange exchange) throws RuntimeException {
        Object object = exchange.getMessage().getBody();
          if(object instanceof LinkedHashMap<?,?>) {

            LinkedHashMap<String, String> map = (LinkedHashMap<String, String>) object;
            logger.info("Map : " + map);
            logger.info("itemId : " + map.get("itemId"));
            logger.info("startDate : " + map.get("startDate"));
            logger.info("endDate : " + map.get("endDate"));
            logger.info("userId : " + map.get("userId"));
            logger.info("reservationId : " + map.get("reservationId"));

            MailCreateDto mailCreateDto = new MailCreateDto();
            mailCreateDto.setItemId(map.get("itemId"));
            mailCreateDto.setStartDate(map.get("startDate"));
            mailCreateDto.setEndDate(map.get("endDate"));
            mailCreateDto.setUserId(map.get("userId"));
            mailCreateDto.setReservationId(map.get("reservationId"));

            exchange.getMessage().setBody(mailCreateDto);

        }
        else {
            throw new RuntimeException("Object is not of type HashMap");
        }

        logger.info("Object : " + object.getClass());
      }
}
