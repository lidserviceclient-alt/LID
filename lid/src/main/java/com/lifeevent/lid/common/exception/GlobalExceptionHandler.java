package com.lifeevent.lid.common.exception;

import com.lifeevent.lid.common.logging.InternalErrorAlertService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final InternalErrorAlertService internalErrorAlertService;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    private ResponseEntity<ErrorResponseDto> buildErrorDto(Exception ex, WebRequest request, HttpStatus statusCode) {
        return buildErrorDto(ex.getLocalizedMessage(), request, statusCode);
    }

    private ResponseEntity<ErrorResponseDto> buildErrorDto(String message, WebRequest request, HttpStatus statusCode) {
        return ResponseEntity
                .status(statusCode)
                .body(ErrorResponseDto.builder()
                        .apiPath(request.getDescription(false))
                        .errorCode(statusCode)
                        .errorMessage(message)
                        .errorTime(LocalDateTime.now())
                        .build());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ErrorResponseDto> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        return buildErrorDto(ex, request, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class,
            MissingRequestCookieException.class,
            MethodArgumentTypeMismatchException.class,
            IllegalArgumentException.class
    })
    ResponseEntity<ErrorResponseDto> handleBadRequest(Exception ex, WebRequest request) {
        return buildErrorDto(ex, request, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({
            AccessDeniedException.class,
            AuthorizationDeniedException.class
    })
    ResponseEntity<ErrorResponseDto> handleAccessDenied(Exception ex, WebRequest request) {
        if (isLocalProfile()) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String principal = authentication != null ? authentication.getName() : "null";
            String authorities = authentication != null
                    ? authentication.getAuthorities().stream()
                    .map(a -> a != null ? a.getAuthority() : null)
                    .filter(a -> a != null && !a.isBlank())
                    .collect(Collectors.joining(","))
                    : "";
            String message = ex.getLocalizedMessage() + " (principal=" + principal + ", authorities=" + authorities + ")";
            return buildErrorDto(message, request, HttpStatus.FORBIDDEN);
        }
        return buildErrorDto(ex, request, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ErrorResponseDto> handleAuthentication(AuthenticationException ex, WebRequest request) {
        return buildErrorDto(ex, request, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(JwtException.class)
    ResponseEntity<ErrorResponseDto> handleJwtException(JwtException ex, WebRequest request) {
        return buildErrorDto(ex, request, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ErrorResponseDto> handleResponseStatusException(ResponseStatusException ex, WebRequest request) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        String message = ex.getReason() != null ? ex.getReason() : ex.getLocalizedMessage();
        if (status.is5xxServerError()) {
            internalErrorAlertService.notifyInternalError(request.getDescription(false), ex);
        }
        return buildErrorDto(message, request, status);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ErrorResponseDto> handleNoResourceFoundException(NoResourceFoundException ex, WebRequest request) {
        return buildErrorDto(ex.getLocalizedMessage(), request, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    ResponseEntity<Void> handleNotAcceptable(HttpMediaTypeNotAcceptableException ex, WebRequest request) {
        log.warn("Not acceptable media type on {}: {}", request.getDescription(false), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
    }

    @ExceptionHandler({
            DataAccessException.class,
            JpaSystemException.class
    })
    ResponseEntity<ErrorResponseDto> handleDatabaseExceptions(Exception ex, WebRequest request) {
        log.error("Database exception on {}", request.getDescription(false), ex);
        internalErrorAlertService.notifyInternalError(request.getDescription(false), ex);
        return buildErrorDto(ex, request, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(UnsupportedOperationException.class)
    ResponseEntity<ErrorResponseDto> handleUnsupportedOperation(UnsupportedOperationException ex, WebRequest request) {
        if (isHibernateCollectionMutationError(ex)) {
            log.error("Hibernate merge failed on immutable collection for {}", request.getDescription(false), ex);
            internalErrorAlertService.notifyInternalError(request.getDescription(false), ex);
            return buildErrorDto(ex, request, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        log.error("Unsupported operation on {}", request.getDescription(false), ex);
        internalErrorAlertService.notifyInternalError(request.getDescription(false), ex);
        return buildErrorDto(ex, request, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponseDto> handleException(Exception ex, WebRequest request) {
        log.error("Unhandled exception on {}", request.getDescription(false), ex);
        internalErrorAlertService.notifyInternalError(request.getDescription(false), ex);
        return buildErrorDto(ex, request, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private boolean isLocalProfile() {
        return activeProfile != null && (activeProfile.contains("local") || activeProfile.contains("local-h2"));
    }

    private boolean isHibernateCollectionMutationError(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            for (StackTraceElement ste : current.getStackTrace()) {
                String className = ste.getClassName();
                String methodName = ste.getMethodName();
                if (className != null
                        && className.startsWith("org.hibernate")
                        && ("replaceElements".equals(methodName)
                        || "merge".equals(methodName)
                        || className.contains("CollectionType"))) {
                    return true;
                }
            }
            current = current.getCause();
        }
        return false;
    }
}
