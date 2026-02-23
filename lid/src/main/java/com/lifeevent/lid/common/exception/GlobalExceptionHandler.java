package com.lifeevent.lid.common.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @Value("${spring.profiles.active:}")
    private String activeProfile;

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
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
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
        if (activeProfile != null && (activeProfile.contains("local") || activeProfile.contains("local-h2"))) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String principal = authentication != null ? authentication.getName() : "null";
            String authorities = authentication != null
                    ? authentication.getAuthorities().stream()
                        .map(a -> a != null ? a.getAuthority() : null)
                        .filter(a -> a != null && !a.isBlank())
                        .collect(java.util.stream.Collectors.joining(","))
                    : "";
            String message = ex.getLocalizedMessage() + " (principal=" + principal + ", authorities=" + authorities + ")";
            return this.buildErrorDto(message, request, HttpStatus.FORBIDDEN);
        }
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
