package com.lifeevent.lid.payment.exception;

/**
 * Exception levée lorsqu'une erreur de paiement PayDunya se produit
 */
public class PaymentException extends RuntimeException {
    
    private String errorCode;
    private String errorDetails;
    
    public PaymentException(String message) {
        super(message);
    }
    
    public PaymentException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public PaymentException(String message, String errorCode, String errorDetails) {
        super(message);
        this.errorCode = errorCode;
        this.errorDetails = errorDetails;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public String getErrorDetails() {
        return errorDetails;
    }
}
