package de.equipli.processors.mail;

import de.equipli.MailServiceException;
import de.equipli.dto.mail.MailCreateDto;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

import java.util.List;

@ApplicationScoped
public class ValidationProcessor implements Processor {
    @Override
    public void process(Exchange exchange) throws Exception {

        List<MailCreateDto> mailCreateDtoList = exchange.getMessage().getBody(List.class);

        // Check for null values
        for (MailCreateDto mailCreateDto : mailCreateDtoList) {
            if (mailCreateDto.getUserId() == null) {
                throw new MailServiceException("UserId is null");
            }
            if (mailCreateDto.getItemId() == null) {
                throw new MailServiceException("ItemId is null");
            }
            if (mailCreateDto.getStartDate() == null) {
                throw new MailServiceException("StartDate is null");
            }
            if (mailCreateDto.getEndDate() == null) {
                throw new MailServiceException("EndDate is null");
            }
        }

        // Check if users are heterogeneous
        if (mailCreateDtoList.stream().map(MailCreateDto::getUserId).distinct().count() > 1) {
            throw new MailServiceException("Users are heterogeneous;" +
                                       "Would expect every object to reference the same user; " +
                                       "Otherwise, where would the email be sent?");
        }


    }
}
