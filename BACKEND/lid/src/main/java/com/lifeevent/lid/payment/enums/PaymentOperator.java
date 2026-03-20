package com.lifeevent.lid.payment.enums;

/**
 * Énumération des opérateurs de paiement disponibles.
 * Support pour Orange Money, MTN Mobile Money, Wave et cartes bancaires
 */
public enum PaymentOperator {
    
    // Côte d'Ivoire
    ORANGE_MONEY_CI("orange-money-ci", "Orange Money", "CI"),
    MTN_MONEY_CI("mtn-momo-ci", "MTN Mobile Money", "CI"),
    WAVE_CI("wave-ci", "Wave", "CI"),
    CARD_CI("card", "Carte Bancaire", "CI"),
    
    // Sénégal
    ORANGE_MONEY_SENEGAL("orange-money-senegal", "Orange Money", "SN"),
    MTN_MONEY_SENEGAL("mtn-momo-senegal", "MTN Mobile Money", "SN"),
    WAVE_SENEGAL("wave-senegal", "Wave", "SN"),
    CARD_SENEGAL("card", "Carte Bancaire", "SN"),
    
    // Général (cartes)
    CARD("card", "Carte Bancaire", "GENERAL");
    
    private final String operatorCode;
    private final String displayName;
    private final String countryCode;
    
    PaymentOperator(String operatorCode, String displayName, String countryCode) {
        this.operatorCode = operatorCode;
        this.displayName = displayName;
        this.countryCode = countryCode;
    }
    
    public String getOperatorCode() {
        return operatorCode;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getCountryCode() {
        return countryCode;
    }
}
