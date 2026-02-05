package com.lifeevent.lid.common.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<ErrorResponseDto> buildErrorDto(Exception ex, WebRequest request, HttpStatus statusCode){
        return this.buildErrorDto(ex.getLocalizedMessage(), request, statusCode);
    }

    private ResponseEntity<ErrorResponseDto> buildErrorDto(String message, WebRequest request, HttpStatus statusCode){
        return ResponseEntity
                .status(statusCode)
                .body(
                        ErrorResponseDto.builder()
                                .apiPath(request.getDescription(false))
                                .errorCode(statusCode)
                                .errorMessage(message)
                                .errorTime(LocalDateTime.now())
                                .build()
                );
    }


    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ErrorResponseDto> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        return this.buildErrorDto(ex,request, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            HttpMessageNotReadableException.class,
            IllegalArgumentException.class
    })
    ResponseEntity<ErrorResponseDto> handleBadRequest(Exception ex, WebRequest request) {
        return this.buildErrorDto(ex, request, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({
            AccessDeniedException.class,
            AuthorizationDeniedException.class
    })
    ResponseEntity<ErrorResponseDto> handleAccessDenied(Exception ex, WebRequest request) {
        return this.buildErrorDto(ex, request, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(JwtException.class)
    ResponseEntity<ErrorResponseDto> handleJwtException(JwtException ex, WebRequest request) {
        return this.buildErrorDto(ex, request, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ErrorResponseDto> handleResponseStatusException(ResponseStatusException ex, WebRequest request) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        String message = ex.getReason() != null ? ex.getReason() : ex.getLocalizedMessage();
        return this.buildErrorDto(message, request, status);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ErrorResponseDto> handleNoResourceFoundException(NoResourceFoundException ex, WebRequest request) {
        return this.buildErrorDto(ex.getLocalizedMessage(), request, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponseDto> handleException(Exception ex, WebRequest request) {
        return this.buildErrorDto(ex,request, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
