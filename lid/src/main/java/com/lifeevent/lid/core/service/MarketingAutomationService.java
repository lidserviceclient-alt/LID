package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.MarketingCampaignDto;
import com.lifeevent.lid.core.entity.MarketingCampaign;
import com.lifeevent.lid.core.entity.MarketingCampaignDelivery;
import com.lifeevent.lid.core.enums.MarketingAudience;
import com.lifeevent.lid.core.enums.MarketingCampaignStatus;
import com.lifeevent.lid.core.enums.MarketingCampaignType;
import com.lifeevent.lid.core.enums.MarketingDeliveryStatus;
import com.lifeevent.lid.core.enums.NewsletterSubscriberStatus;
import com.lifeevent.lid.core.repository.MarketingCampaignDeliveryRepository;
import com.lifeevent.lid.core.repository.MarketingCampaignRepository;
import com.lifeevent.lid.core.repository.NewsletterSubscriberRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import jakarta.mail.internet.InternetAddress;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Slf4j
public class MarketingAutomationService {

    private final MarketingCampaignRepository marketingCampaignRepository;
    private final MarketingCampaignDeliveryRepository deliveryRepository;
    private final NewsletterSubscriberRepository newsletterSubscriberRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final JavaMailSender mailSender;
    private final MarketingService marketingService;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${config.marketing.dispatch.max-campaigns-per-run:5}")
    private int maxCampaignsPerRun;

    @Value("${config.marketing.dispatch.batch-size:50}")
    private int batchSize;

    public MarketingAutomationService(
            MarketingCampaignRepository marketingCampaignRepository,
            MarketingCampaignDeliveryRepository deliveryRepository,
            NewsletterSubscriberRepository newsletterSubscriberRepository,
            UtilisateurRepository utilisateurRepository,
            JavaMailSender mailSender,
            MarketingService marketingService
    ) {
        this.marketingCampaignRepository = marketingCampaignRepository;
        this.deliveryRepository = deliveryRepository;
        this.newsletterSubscriberRepository = newsletterSubscriberRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.mailSender = mailSender;
        this.marketingService = marketingService;
    }

    @Transactional
    public MarketingCampaignDto queueSendNow(String campaignId) {
        MarketingCampaign campaign = marketingCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Campagne introuvable"));

        if (campaign.getStatus() == MarketingCampaignStatus.FINISHED && campaign.getSentAt() != null) {
            throw new ResponseStatusException(BAD_REQUEST, "Campagne déjà envoyée");
        }

        campaign.setStatus(MarketingCampaignStatus.SCHEDULED);
        campaign.setScheduledAt(LocalDateTime.now());
        campaign.setSentAt(null);
        campaign.setNextRetryAt(null);
        campaign.setLastError(null);
        campaign.setAttempts(campaign.getAttempts() == null ? 0 : campaign.getAttempts());
        campaign = marketingCampaignRepository.save(campaign);

        dispatchOneCampaign(campaign, Math.max(1, Math.min(batchSize, 50)));
        return marketingService.getCampaign(campaignId);
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
            if (ex instanceof ResponseStatusException rse && rse.getStatusCode().is4xxClientError()) {
                campaign.setStatus(MarketingCampaignStatus.ACTIVE);
                campaign.setScheduledAt(null);
                campaign.setLastError(rse.getReason() != null ? rse.getReason() : ex.getMessage());
                campaign.setNextRetryAt(null);
                marketingCampaignRepository.save(campaign);
                return;
            }

            int attempts = campaign.getAttempts() == null ? 0 : campaign.getAttempts();
            attempts += 1;
            campaign.setAttempts(attempts);
            campaign.setLastError(ex.getMessage());
            campaign.setNextRetryAt(LocalDateTime.now().plusMinutes(Math.min(60, (int) Math.pow(2, Math.max(1, attempts)))));
            marketingCampaignRepository.save(campaign);
        }
    }

    private void ensureDeliveries(MarketingCampaign campaign) {
        if (campaign == null) return;

        if (campaign.getType() == MarketingCampaignType.SOCIAL) {
            if (!deliveryRepository.existsByCampaign_Id(campaign.getId())) {
                MarketingCampaignDelivery d = new MarketingCampaignDelivery();
                d.setCampaign(campaign);
                d.setChannel(MarketingCampaignType.SOCIAL);
                d.setRecipient("SOCIAL_POST");
                d.setStatus(MarketingDeliveryStatus.PENDING);
                deliveryRepository.save(d);
                campaign.setTargetCount(1L);
                marketingCampaignRepository.save(campaign);
            }
            return;
        }

        if (deliveryRepository.existsByCampaign_Id(campaign.getId())) {
            return;
        }

        Set<String> recipients = resolveRecipients(campaign);
        if (recipients.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Aucun destinataire pour cette campagne");
        }

        List<MarketingCampaignDelivery> deliveries = recipients.stream()
                .map((recipient) -> {
                    MarketingCampaignDelivery d = new MarketingCampaignDelivery();
                    d.setCampaign(campaign);
                    d.setChannel(campaign.getType());
                    d.setRecipient(recipient);
                    d.setStatus(MarketingDeliveryStatus.PENDING);
                    return d;
                })
                .toList();

        deliveryRepository.saveAll(deliveries);
        campaign.setTargetCount((long) recipients.size());
        campaign.setSentCount(0L);
        campaign.setFailedCount(0L);
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
                for (String email : utilisateurRepository.findClientEmails()) {
                    String normalized = normalizeEmail(email);
                    if (isValidEmail(normalized)) out.add(normalized);
                }
            }
        }

        if (campaign.getType() == MarketingCampaignType.SMS) {
            for (String phone : utilisateurRepository.findClientPhones()) {
                String normalized = normalizePhone(phone);
                if (!normalized.isBlank()) out.add(normalized);
            }
        }

        return out;
    }

    private void processDeliveries(MarketingCampaign campaign, int batchLimit) {
        if (campaign == null) return;
        LocalDateTime now = LocalDateTime.now();

        int safeBatch = Math.max(1, Math.min(batchLimit, 500));
        List<MarketingCampaignDelivery> batch = deliveryRepository.findDueBatch(campaign.getId(), now, PageRequest.of(0, safeBatch));
        if (batch.isEmpty()) return;

        for (MarketingCampaignDelivery delivery : batch) {
            if (delivery == null) continue;
            if (campaign.getType() == MarketingCampaignType.EMAIL) {
                sendEmailDelivery(campaign, delivery);
                continue;
            }

            // SMS/SOCIAL: simulation (à connecter à un provider)
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
            System.err.println("MARKETING MAIL FAILED: " + ex.getMessage());
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
        if (campaign == null) return;
        String id = campaign.getId();

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
