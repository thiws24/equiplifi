package de.equipli.processors.mail;

import de.equipli.dto.mail.MailCreateDto;
import de.equipli.dto.mail.MailDto;
import de.equipli.dto.user.UserDto;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.apache.camel.component.jackson.JacksonDataFormat;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ValidationProcessor implements Processor {
    @Override
    public void process(Exchange exchange) throws Exception {

        List<MailCreateDto> mailCreateDtoList = exchange.getMessage().getBody(List.class);

        // Check for null values
        for (MailCreateDto mailCreateDto : mailCreateDtoList) {
            if (mailCreateDto.getUserId() == null) {
                throw new RuntimeException("UserId is null");
            }
            if (mailCreateDto.getItemId() == null) {
                throw new RuntimeException("ItemId is null");
            }
            if (mailCreateDto.getStartDate() == null) {
                throw new RuntimeException("StartDate is null");
            }
            if (mailCreateDto.getEndDate() == null) {
                throw new RuntimeException("EndDate is null");
            }
        }

        // Check if users are heterogeneous
        if (mailCreateDtoList.stream().map(MailCreateDto::getUserId).distinct().count() > 1) {
            throw new RuntimeException("Users are heterogeneous;" +
                                       "Would expect every object to reference the same user; " +
                                       "Otherwise, where would the email be sent?");
        }


    }
}
