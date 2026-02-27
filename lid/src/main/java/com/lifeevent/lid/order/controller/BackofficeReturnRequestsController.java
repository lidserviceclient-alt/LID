package com.lifeevent.lid.order.controller;

import com.lifeevent.lid.order.dto.BackofficeReturnRequestDto;
import com.lifeevent.lid.order.dto.BackofficeReturnRequestItemDto;
import com.lifeevent.lid.order.dto.BackofficeReturnRequestUpdateDto;
import com.lifeevent.lid.order.entity.ReturnRequest;
import com.lifeevent.lid.order.entity.ReturnRequestItem;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import com.lifeevent.lid.order.repository.ReturnRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/backoffice/returns")
public class BackofficeReturnRequestsController {

    private final ReturnRequestRepository repository;
    private final UtilisateurRepository utilisateurRepository;

    public BackofficeReturnRequestsController(ReturnRequestRepository repository, UtilisateurRepository utilisateurRepository) {
        this.repository = repository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public Page<BackofficeReturnRequestDto> list(
            @RequestParam(value = "status", required = false) ReturnRequestStatus status,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        String query = q == null ? "" : q.trim();

        Page<ReturnRequest> results;
        if (status != null && !query.isBlank()) {
            results = repository.searchByStatusAndQuery(status, query, pageable);
        } else if (status != null) {
            results = repository.findByStatus(status, pageable);
        } else if (!query.isBlank()) {
            results = repository.findByOrderNumberContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);
        } else {
            results = repository.findAll(pageable);
        }

        return results.map(this::toDto);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public BackofficeReturnRequestDto get(@PathVariable Long id) {
        ReturnRequest rr = repository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Retour introuvable"));
        return toDto(rr);
    }

    @PutMapping("/{id}/status")
    @Transactional
    public BackofficeReturnRequestDto updateStatus(@PathVariable Long id, @RequestBody BackofficeReturnRequestUpdateDto request) {
        ReturnRequest rr = repository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Retour introuvable"));
        if (request == null || request.status() == null) {
            return toDto(rr);
        }
        rr.setStatus(request.status());
        ReturnRequest saved = repository.save(rr);
        return toDto(saved);
    }

    private BackofficeReturnRequestDto toDto(ReturnRequest rr) {
        String phone = null;
        if (rr != null && rr.getEmail() != null && !rr.getEmail().isBlank()) {
            phone = utilisateurRepository.findByEmail(rr.getEmail().trim().toLowerCase())
                    .map((u) -> u.getTelephone())
                    .orElse(null);
        }
        List<BackofficeReturnRequestItemDto> items = rr.getItems() == null ? List.of()
                : rr.getItems().stream()
                .map(this::toItem)
                .toList();
        return new BackofficeReturnRequestDto(
                rr.getId(),
                rr.getOrderNumber(),
                rr.getEmail(),
                phone,
                rr.getReason(),
                rr.getDetails(),
                rr.getStatus(),
                rr.getCreatedAt(),
                items
        );
    }

    private BackofficeReturnRequestItemDto toItem(ReturnRequestItem item) {
        if (item == null) return new BackofficeReturnRequestItemDto(null, null, "-", 0, null);
        return new BackofficeReturnRequestItemDto(
                item.getId(),
                item.getArticleId(),
                item.getArticleName(),
                item.getQuantity(),
                item.getUnitPrice()
        );
    }
}
