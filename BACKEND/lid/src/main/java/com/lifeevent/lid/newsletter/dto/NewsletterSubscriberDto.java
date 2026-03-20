package com.lifeevent.lid.newsletter.dto;

import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberSource;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterSubscriberDto {
    private String id;
    private String email;
    private NewsletterSubscriberStatus status;
    private NewsletterSubscriberSource source;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime unsubscribedAt;
}
