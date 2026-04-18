package com.lifeevent.lid.backoffice.lid.setting.config;

import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeAppConfigEntity;
import com.lifeevent.lid.backoffice.lid.setting.entity.CustomerRefundMode;
import com.lifeevent.lid.backoffice.lid.setting.entity.PartnerSettlementMode;
import com.lifeevent.lid.backoffice.lid.setting.repository.BackOfficeAppConfigRepository;
import com.lifeevent.lid.payment.config.PaydunyaProperties;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BackOfficeAppConfigInitConfig {

    private static final String DEFAULT_STORE_NAME = "LID E-commerce";
    private static final String DEFAULT_CONTACT_EMAIL = "contact@lid.ci";
    private static final String DEFAULT_CITY = "Abidjan";
    private static final String DEFAULT_SLOGAN = "Plateforme de vente en ligne";
    private static final String DEFAULT_ACTIVITY_SECTOR = "E-commerce";
    private static final String DEFAULT_SHIPPING_POLICY_NOTE = "Les frais et delais de livraison sont precises avant validation de la commande.";
    private static final double DEFAULT_VAT_PERCENT = 0.18d;
    private static final String DEFAULT_RETURN_WINDOW_UNIT = "DAYS";
    private static final int DEFAULT_RETURN_WINDOW_MIN = 30;
    private static final int DEFAULT_RETURN_WINDOW_MAX = 30;
    private static final double DEFAULT_RETURN_SHIPPING_COST_AMOUNT = 0d;
    private static final double DEFAULT_PARTNER_MARGIN_PERCENT = 0d;
    private static final String DEFAULT_PARTNER_PAYOUT_WITHDRAW_MODE = "orange-money-ci";
    private static final String DEFAULT_RETURN_POLICY_TEXT = "Les retours sont acceptes dans un delai de 30 jours conformement aux conditions affichees lors de la commande.";

    @Bean
    CommandLineRunner initBackOfficeAppConfig(
            BackOfficeAppConfigRepository appConfigRepository,
            PaydunyaProperties paydunyaProperties
    ) {
        return args -> {
            BackOfficeAppConfigEntity config = appConfigRepository.findTopByOrderByIdAsc()
                    .orElseGet(() -> BackOfficeAppConfigEntity.builder().build());

            boolean changed = false;

            if (isBlank(config.getStoreName())) {
                config.setStoreName(firstNonBlank(paydunyaProperties.getStoreName(), DEFAULT_STORE_NAME));
                changed = true;
            }
            if (isBlank(config.getContactEmail())) {
                config.setContactEmail(DEFAULT_CONTACT_EMAIL);
                changed = true;
            }
            if (isBlank(config.getContactPhone())) {
                String phone = trimToNull(paydunyaProperties.getStorePhoneNumber());
                if (phone != null && !phone.contains("X")) {
                    config.setContactPhone(phone);
                    changed = true;
                }
            }
            if (isBlank(config.getCity())) {
                config.setCity(DEFAULT_CITY);
                changed = true;
            }
            if (isBlank(config.getSlogan())) {
                config.setSlogan(firstNonBlank(paydunyaProperties.getStoreTagline(), DEFAULT_SLOGAN));
                changed = true;
            }
            if (isBlank(config.getActivitySector())) {
                config.setActivitySector(DEFAULT_ACTIVITY_SECTOR);
                changed = true;
            }
            if (isBlank(config.getShippingPolicyNote())) {
                config.setShippingPolicyNote(DEFAULT_SHIPPING_POLICY_NOTE);
                changed = true;
            }
            if (config.getVatPercent() == null || !Double.isFinite(config.getVatPercent()) || config.getVatPercent() < 0d) {
                config.setVatPercent(DEFAULT_VAT_PERCENT);
                changed = true;
            }
            if (isBlank(config.getReturnWindowUnit())) {
                config.setReturnWindowUnit(DEFAULT_RETURN_WINDOW_UNIT);
                changed = true;
            }
            if (config.getReturnWindowMin() == null || config.getReturnWindowMin() < 1) {
                config.setReturnWindowMin(DEFAULT_RETURN_WINDOW_MIN);
                changed = true;
            }
            if (config.getReturnWindowMax() == null || config.getReturnWindowMax() < 1) {
                config.setReturnWindowMax(DEFAULT_RETURN_WINDOW_MAX);
                changed = true;
            }
            if (config.getCustomerRefundMode() == null) {
                config.setCustomerRefundMode(CustomerRefundMode.FULL_WITH_SHIPPING);
                changed = true;
            }
            if (config.getPartnerSettlementMode() == null) {
                config.setPartnerSettlementMode(PartnerSettlementMode.DEDUCT_SHIPPING_AND_RETURN_COST);
                changed = true;
            }
            if (config.getReturnShippingCostAmount() == null || !Double.isFinite(config.getReturnShippingCostAmount()) || config.getReturnShippingCostAmount() < 0d) {
                config.setReturnShippingCostAmount(DEFAULT_RETURN_SHIPPING_COST_AMOUNT);
                changed = true;
            }
            if (config.getPartnerMarginPercent() == null || !Double.isFinite(config.getPartnerMarginPercent()) || config.getPartnerMarginPercent() < 0d) {
                config.setPartnerMarginPercent(DEFAULT_PARTNER_MARGIN_PERCENT);
                changed = true;
            }
            if (isBlank(config.getPartnerPayoutWithdrawMode())) {
                config.setPartnerPayoutWithdrawMode(DEFAULT_PARTNER_PAYOUT_WITHDRAW_MODE);
                changed = true;
            }
            if (isBlank(config.getReturnPolicyText())) {
                config.setReturnPolicyText(DEFAULT_RETURN_POLICY_TEXT);
                changed = true;
            }

            if (changed) {
                appConfigRepository.save(config);
            }
        };
    }

    private boolean isBlank(String value) {
        return trimToNull(value) == null;
    }

    private String firstNonBlank(String primary, String fallback) {
        String normalizedPrimary = trimToNull(primary);
        return normalizedPrimary != null ? normalizedPrimary : fallback;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
