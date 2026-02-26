package com.lifeevent.lid.core.service;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.dto.BackofficeProductReviewDto;
import com.lifeevent.lid.core.dto.UpdateBackofficeProductReviewRequest;
import com.lifeevent.lid.core.entity.CommentaireProduit;
import com.lifeevent.lid.core.repository.CommentaireProduitRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class BackofficeProductReviewService {

    private final CommentaireProduitRepository commentaireProduitRepository;

    public BackofficeProductReviewService(CommentaireProduitRepository commentaireProduitRepository) {
        this.commentaireProduitRepository = commentaireProduitRepository;
    }

    @Transactional(readOnly = true)
    public Page<BackofficeProductReviewDto> list(Pageable pageable,
                                                 String q,
                                                 String productId,
                                                 String userId,
                                                 String status) {
        String normalizedQ = q == null ? null : q.trim();
        if (normalizedQ != null && normalizedQ.isBlank()) normalizedQ = null;

        String normalizedStatus = status == null ? "ALL" : status.trim().toUpperCase();
        Boolean validated = null;
        boolean reported = false;
        boolean includeDeleted = false;
        boolean deletedOnly = false;

        if (normalizedStatus.equals("VALIDATED")) validated = true;
        else if (normalizedStatus.equals("PENDING")) validated = false;
        else if (normalizedStatus.equals("REPORTED")) reported = true;
        else if (normalizedStatus.equals("DELETED")) {
            includeDeleted = true;
            deletedOnly = true;
        }

        Page<CommentaireProduit> page = commentaireProduitRepository.searchBackoffice(
                pageable,
                normalizedQ,
                blankToNull(productId),
                blankToNull(userId),
                validated,
                reported,
                includeDeleted,
                deletedOnly
        );

        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public BackofficeProductReviewDto get(String id) {
        CommentaireProduit c = commentaireProduitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommentaireProduit", "id", id));
        return toDto(c);
    }

    @Transactional
    public BackofficeProductReviewDto update(String id, @Valid UpdateBackofficeProductReviewRequest request) {
        CommentaireProduit c = commentaireProduitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommentaireProduit", "id", id));

        c.setNote(request.getRating());
        c.setCommentaire(request.getContent().trim());
        if (request.getValidated() != null) {
            c.setEstValide(request.getValidated());
        }
        c.setDeletedAt(null);

        c = commentaireProduitRepository.save(c);
        return toDto(c);
    }

    @Transactional
    public BackofficeProductReviewDto validate(String id) {
        CommentaireProduit c = commentaireProduitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommentaireProduit", "id", id));
        c.setEstValide(true);
        c.setDeletedAt(null);
        c = commentaireProduitRepository.save(c);
        return toDto(c);
    }

    @Transactional
    public BackofficeProductReviewDto unvalidate(String id) {
        CommentaireProduit c = commentaireProduitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommentaireProduit", "id", id));
        c.setEstValide(false);
        c = commentaireProduitRepository.save(c);
        return toDto(c);
    }

    @Transactional
    public BackofficeProductReviewDto restore(String id) {
        CommentaireProduit c = commentaireProduitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommentaireProduit", "id", id));
        c.setDeletedAt(null);
        c = commentaireProduitRepository.save(c);
        return toDto(c);
    }

    @Transactional
    public void delete(String id) {
        CommentaireProduit c = commentaireProduitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommentaireProduit", "id", id));
        c.setDeletedAt(LocalDateTime.now());
        commentaireProduitRepository.save(c);
    }

    private BackofficeProductReviewDto toDto(CommentaireProduit c) {
        return new BackofficeProductReviewDto(
                c.getId(),
                c.getProduit() != null ? c.getProduit().getId() : null,
                c.getProduit() != null ? c.getProduit().getNom() : null,
                c.getUtilisateur() != null ? c.getUtilisateur().getId() : null,
                c.getUtilisateur() != null ? c.getUtilisateur().getEmail() : null,
                c.getNote(),
                c.getCommentaire(),
                c.getEstValide(),
                c.getLikeCount() == null ? 0L : c.getLikeCount(),
                c.getReportCount() == null ? 0L : c.getReportCount(),
                c.getDateCreation(),
                c.getDateModification(),
                c.getDeletedAt()
        );
    }

    private String blankToNull(String v) {
        String s = v == null ? null : v.trim();
        return s == null || s.isBlank() ? null : s;
    }
}
