package com.lifeevent.lid.backoffice.newsletter.dto;

import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberSource;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeNewsletterSubscriberDto {
    private String id;
    private String email;
    private NewsletterSubscriberStatus status;
    private NewsletterSubscriberSource source;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
    private LocalDateTime dateDesabonnement;
}
