package com.lifeevent.lid.backoffice.lid.marketing.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.marketing.entity.MarketingCampaign;
import com.lifeevent.lid.marketing.entity.MarketingCampaignDelivery;
import com.lifeevent.lid.marketing.enumeration.MarketingAudience;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import com.lifeevent.lid.marketing.enumeration.MarketingDeliveryStatus;
import com.lifeevent.lid.marketing.repository.MarketingCampaignDeliveryRepository;
import com.lifeevent.lid.marketing.repository.MarketingCampaignRepository;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import com.lifeevent.lid.newsletter.repository.NewsletterSubscriberRepository;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import jakarta.mail.internet.InternetAddress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackOfficeMarketingAutomationService {

    private final MarketingCampaignRepository marketingCampaignRepository;
    private final MarketingCampaignDeliveryRepository deliveryRepository;
    private final NewsletterSubscriberRepository newsletterSubscriberRepository;
    private final CustomerRepository customerRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${config.marketing.dispatch.max-campaigns-per-run:5}")
    private int maxCampaignsPerRun;

    @Value("${config.marketing.dispatch.batch-size:50}")
    private int batchSize;

    @Transactional
    public MarketingCampaign queueSendNow(Long campaignId) {
        MarketingCampaign campaign = marketingCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("MarketingCampaign", "id", String.valueOf(campaignId)));

        if (campaign.getStatus() == MarketingCampaignStatus.FINISHED && campaign.getSentAt() != null) {
            throw new IllegalArgumentException("Campagne déjà envoyée");
        }

        campaign = restartCampaignDispatch(campaign);

        dispatchOneCampaign(campaign, Math.max(1, Math.min(batchSize, 50)));
        return marketingCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("MarketingCampaign", "id", String.valueOf(campaignId)));
    }

    private MarketingCampaign restartCampaignDispatch(MarketingCampaign campaign) {
        if (campaign.getId() != null && deliveryRepository.existsByCampaign_Id(campaign.getId())) {
            deliveryRepository.deleteByCampaign_Id(campaign.getId());
        }

        campaign.setStatus(MarketingCampaignStatus.SCHEDULED);
        campaign.setScheduledAt(LocalDateTime.now());
        campaign.setSentAt(null);
        campaign.setTargetCount(0L);
        campaign.setSentCount(0L);
        campaign.setFailedCount(0L);
        campaign.setAttempts(0);
        campaign.setNextRetryAt(null);
        campaign.setLastError(null);
        return marketingCampaignRepository.save(campaign);
    }

    @Scheduled(fixedDelayString = "${config.marketing.dispatch.delay-ms:30000}")
    public void dispatchDue() {
        try {
            dispatchDueInternal();
        } catch (Exception ex) {
            log.warn("Marketing dispatch error: {}", ex.getMessage());
        }
    }

    @Transactional
    protected void dispatchDueInternal() {
        int safeMax = Math.max(1, Math.min(maxCampaignsPerRun, 50));
        LocalDateTime now = LocalDateTime.now();
        List<MarketingCampaign> due = marketingCampaignRepository.findDueCampaigns(now, PageRequest.of(0, safeMax));
        for (MarketingCampaign campaign : due) {
            dispatchOneCampaign(campaign, batchSize);
        }
    }

    private void dispatchOneCampaign(MarketingCampaign campaign, int batchLimit) {
        if (campaign == null) return;
        if (campaign.getStatus() != MarketingCampaignStatus.SCHEDULED) return;
        if (campaign.getSentAt() != null) return;

        try {
            ensureDeliveries(campaign);
            processDeliveries(campaign, batchLimit);
            syncCampaignCountsAndStatus(campaign);
        } catch (Exception ex) {
            int attempts = campaign.getAttempts() == null ? 0 : campaign.getAttempts();
            attempts += 1;
            campaign.setAttempts(attempts);
            campaign.setLastError(ex.getMessage());
            campaign.setNextRetryAt(LocalDateTime.now().plusMinutes(Math.min(60, (int) Math.pow(2, Math.max(1, attempts)))));
            marketingCampaignRepository.save(campaign);
        }
    }

    private void ensureDeliveries(MarketingCampaign campaign) {
        if (campaign.getType() == MarketingCampaignType.SOCIAL) {
            ensureSocialDelivery(campaign);
            return;
        }
        if (deliveryRepository.existsByCampaign_Id(campaign.getId())) {
            return;
        }

        Set<String> recipients = resolveRecipients(campaign);
        if (recipients.isEmpty()) {
            throw new IllegalArgumentException("Aucun destinataire pour cette campagne");
        }

        List<MarketingCampaignDelivery> deliveries = new java.util.ArrayList<>();
        for (String recipient : recipients) {
            deliveries.add(MarketingCampaignDelivery.builder()
                    .campaign(campaign)
                    .channel(campaign.getType())
                    .recipient(recipient)
                    .status(MarketingDeliveryStatus.PENDING)
                    .build());
        }

        deliveryRepository.saveAll(deliveries);
        campaign.setTargetCount((long) recipients.size());
        campaign.setSentCount(0L);
        campaign.setFailedCount(0L);
        marketingCampaignRepository.save(campaign);
    }

    private void ensureSocialDelivery(MarketingCampaign campaign) {
        if (deliveryRepository.existsByCampaign_Id(campaign.getId())) {
            return;
        }
        MarketingCampaignDelivery delivery = MarketingCampaignDelivery.builder()
                .campaign(campaign)
                .channel(MarketingCampaignType.SOCIAL)
                .recipient("SOCIAL_POST")
                .status(MarketingDeliveryStatus.PENDING)
                .build();
        deliveryRepository.save(delivery);
        campaign.setTargetCount(1L);
        marketingCampaignRepository.save(campaign);
    }

    private Set<String> resolveRecipients(MarketingCampaign campaign) {
        MarketingAudience audience = campaign.getAudience() == null ? MarketingAudience.NEWSLETTER : campaign.getAudience();
        Set<String> out = new LinkedHashSet<>();

        if (campaign.getType() == MarketingCampaignType.EMAIL) {
            if (audience == MarketingAudience.NEWSLETTER || audience == MarketingAudience.ALL) {
                for (String email : newsletterSubscriberRepository.findEmailsByStatus(NewsletterSubscriberStatus.SUBSCRIBED)) {
                    String normalized = normalizeEmail(email);
                    if (isValidEmail(normalized)) out.add(normalized);
                }
            }
            if (audience == MarketingAudience.CLIENTS || audience == MarketingAudience.ALL) {
                for (String email : customerRepository.findClientEmails()) {
                    String normalized = normalizeEmail(email);
                    if (isValidEmail(normalized)) out.add(normalized);
                }
            }
        }

        if (campaign.getType() == MarketingCampaignType.SMS) {
            for (String phone : customerRepository.findClientPhones()) {
                String normalized = normalizePhone(phone);
                if (!normalized.isBlank()) out.add(normalized);
            }
        }

        return out;
    }

    private void processDeliveries(MarketingCampaign campaign, int batchLimit) {
        LocalDateTime now = LocalDateTime.now();
        int safeBatch = Math.max(1, Math.min(batchLimit, 500));
        List<MarketingCampaignDelivery> batch = deliveryRepository.findDueBatch(campaign.getId(), now, PageRequest.of(0, safeBatch));
        if (batch.isEmpty()) return;

        for (MarketingCampaignDelivery delivery : batch) {
            if (campaign.getType() == MarketingCampaignType.EMAIL) {
                sendEmailDelivery(campaign, delivery);
                continue;
            }
            delivery.setStatus(MarketingDeliveryStatus.SENT);
            delivery.setSentAt(LocalDateTime.now());
            delivery.setLastError(null);
            delivery.setNextRetryAt(null);
        }
        deliveryRepository.saveAll(batch);
    }

    private void sendEmailDelivery(MarketingCampaign campaign, MarketingCampaignDelivery delivery) {
        String to = delivery.getRecipient();
        if (!isValidEmail(to)) {
            markDeliveryFailed(delivery, "Email invalide");
            return;
        }

        String subject = (campaign.getSubject() == null || campaign.getSubject().isBlank())
                ? (campaign.getName() == null ? "Newsletter" : campaign.getName())
                : campaign.getSubject().trim();

        String content = campaign.getContent();
        if (content == null || content.isBlank()) {
            markDeliveryFailed(delivery, "Contenu vide");
            return;
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            if (fromEmail != null && !fromEmail.isBlank()) msg.setFrom(fromEmail);
            msg.setSubject(subject);
            msg.setText(content);
            mailSender.send(msg);

            delivery.setStatus(MarketingDeliveryStatus.SENT);
            delivery.setSentAt(LocalDateTime.now());
            delivery.setLastError(null);
            delivery.setNextRetryAt(null);
        } catch (Exception ex) {
            markDeliveryFailed(delivery, ex.getMessage());
        }
    }

    private static void markDeliveryFailed(MarketingCampaignDelivery delivery, String message) {
        int attempts = delivery.getAttempts() == null ? 0 : delivery.getAttempts();
        attempts += 1;
        delivery.setAttempts(attempts);
        delivery.setStatus(MarketingDeliveryStatus.FAILED);
        delivery.setLastError(message);
        delivery.setNextRetryAt(LocalDateTime.now().plusMinutes(Math.min(60, (int) Math.pow(2, Math.max(1, attempts)))));
    }

    private void syncCampaignCountsAndStatus(MarketingCampaign campaign) {
        Long id = campaign.getId();

        long total = deliveryRepository.countByCampaign_Id(id);
        long sent = deliveryRepository.countByCampaign_IdAndStatus(id, MarketingDeliveryStatus.SENT);
        long failed = deliveryRepository.countByCampaign_IdAndStatus(id, MarketingDeliveryStatus.FAILED);
        long pending = total - sent - failed;

        campaign.setTargetCount(total);
        campaign.setSentCount(sent);
        campaign.setFailedCount(failed);

        if (pending <= 0 && failed <= 0 && total > 0) {
            campaign.setStatus(MarketingCampaignStatus.FINISHED);
            campaign.setSentAt(LocalDateTime.now());
            campaign.setNextRetryAt(null);
            campaign.setLastError(null);
        } else if (failed > 0) {
            campaign.setStatus(MarketingCampaignStatus.SCHEDULED);
            campaign.setLastError("Certains envois ont échoué");
            LocalDateTime earliest = deliveryRepository.findEarliestRetryAt(id);
            campaign.setNextRetryAt(earliest != null ? earliest : LocalDateTime.now().plusMinutes(1));
        }

        marketingCampaignRepository.save(campaign);
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizePhone(String phone) {
        if (phone == null) return "";
        String trimmed = phone.trim();
        return trimmed.isBlank() ? "" : trimmed;
    }

    private static boolean isValidEmail(String email) {
        if (email == null) return false;
        String e = email.trim().toLowerCase(Locale.ROOT);
        if (e.isBlank()) return false;
        try {
            InternetAddress addr = new InternetAddress(e, true);
            addr.validate();
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
