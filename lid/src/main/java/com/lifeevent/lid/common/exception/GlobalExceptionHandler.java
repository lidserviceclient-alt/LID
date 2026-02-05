package com.lifeevent.lid.common.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<ErrorResponseDto> buildErrorDto(Exception ex, WebRequest request, HttpStatus statusCode){
        return ResponseEntity
                .status(statusCode)
                .body(
                        ErrorResponseDto.builder()
                                .apiPath(request.getDescription(false))
                                .errorCode(statusCode)
                                .errorMessage(ex.getLocalizedMessage())
                                .errorTime(LocalDateTime.now())
                                .build()
                );
    }


    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ErrorResponseDto> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        return this.buildErrorDto(ex,request, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ErrorResponseDto> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        return this.buildErrorDto(ex, request, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ErrorResponseDto> handleAuthentication(AuthenticationException ex, WebRequest request) {
        return this.buildErrorDto(ex, request, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponseDto> handleException(Exception ex, WebRequest request) {
        return this.buildErrorDto(ex,request, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
