package com.lifeevent.lid.payment.exception;

import com.lifeevent.lid.common.exception.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

/**
 * Gestionnaire d'exceptions pour les erreurs de paiement
 */
@RestControllerAdvice
public class PaymentExceptionHandler {
    
    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ErrorResponseDto> handlePaymentException(
            PaymentException ex, WebRequest request) {
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseDto.builder()
                .apiPath(request.getDescription(false))
                .errorCode(HttpStatus.BAD_REQUEST)
                .errorMessage(ex.getMessage())
                .errorTime(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {
        
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponseDto.builder()
                .apiPath(request.getDescription(false))
                .errorCode(HttpStatus.CONFLICT)
                .errorMessage(ex.getMessage())
                .errorTime(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseDto.builder()
                .apiPath(request.getDescription(false))
                .errorCode(HttpStatus.BAD_REQUEST)
                .errorMessage(ex.getMessage())
                .errorTime(LocalDateTime.now())
                .build());
    }
}
