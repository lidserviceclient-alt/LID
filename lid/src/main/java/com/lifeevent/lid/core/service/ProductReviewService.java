package com.lifeevent.lid.core.service;

import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.core.dto.CreateProductReviewRequest;
import com.lifeevent.lid.core.dto.ProductReviewDto;
import com.lifeevent.lid.core.dto.ProductReviewsResponse;
import com.lifeevent.lid.core.dto.ReportProductReviewRequest;
import com.lifeevent.lid.core.entity.CommentaireProduit;
import com.lifeevent.lid.core.entity.CommentaireProduitLike;
import com.lifeevent.lid.core.entity.CommentaireProduitReport;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.repository.CommentaireProduitLikeRepository;
import com.lifeevent.lid.core.repository.CommentaireProduitReportRepository;
import com.lifeevent.lid.core.repository.CommentaireProduitRepository;
import com.lifeevent.lid.core.repository.ProduitRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class ProductReviewService {

    private final CommentaireProduitRepository commentaireProduitRepository;
    private final CommentaireProduitLikeRepository likeRepository;
    private final CommentaireProduitReportRepository reportRepository;
    private final ProduitRepository produitRepository;
    private final UtilisateurRepository utilisateurRepository;

    public ProductReviewService(CommentaireProduitRepository commentaireProduitRepository,
                                CommentaireProduitLikeRepository likeRepository,
                                CommentaireProduitReportRepository reportRepository,
                                ProduitRepository produitRepository,
                                UtilisateurRepository utilisateurRepository) {
        this.commentaireProduitRepository = commentaireProduitRepository;
        this.likeRepository = likeRepository;
        this.reportRepository = reportRepository;
        this.produitRepository = produitRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional(readOnly = true)
    public ProductReviewsResponse listProductReviews(String productId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 50));
        Page<CommentaireProduit> p = commentaireProduitRepository.findByProduitIdAndEstValideTrueAndDeletedAtIsNullOrderByDateCreationDesc(
                productId,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "dateCreation"))
        );

        String currentUserId = SecurityUtils.isAuthenticated() ? SecurityUtils.getCurrentUserId() : null;
        Set<String> likedIds = Set.of();
        if (currentUserId != null && !p.getContent().isEmpty()) {
            List<String> ids = p.getContent().stream().map(CommentaireProduit::getId).toList();
            likedIds = likeRepository.findByUtilisateurIdAndCommentaireIdIn(currentUserId, ids)
                    .stream()
                    .map((l) -> l.getCommentaire().getId())
                    .collect(java.util.stream.Collectors.toSet());
        }

        double avg = commentaireProduitRepository.avgRating(productId);
        long count = commentaireProduitRepository.countValid(productId);

        Set<String> likedIdsFinal = likedIds;
        List<ProductReviewDto> content = p.getContent().stream().map((c) -> toDto(c, likedIdsFinal.contains(c.getId()))).toList();
        return new ProductReviewsResponse(avg, count, content, p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }

    @Transactional
    public ProductReviewDto upsertReview(String productId, CreateProductReviewRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank()) throw new ResponseStatusException(UNAUTHORIZED);

        Produit produit = produitRepository.findById(productId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND));
        Utilisateur user = utilisateurRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED));

        CommentaireProduit existing = commentaireProduitRepository.findByProduitIdAndUtilisateurId(productId, userId).orElse(null);
        CommentaireProduit review = existing != null ? existing : new CommentaireProduit();
        review.setProduit(produit);
        review.setUtilisateur(user);
        review.setCommentaire(request.getContent().trim());
        review.setNote(request.getRating());
        review.setEstValide(true);
        review.setDeletedAt(null);

        review = commentaireProduitRepository.save(review);

        boolean likedByMe = likeRepository.findByCommentaireIdAndUtilisateurId(review.getId(), userId).isPresent();
        return toDto(review, likedByMe);
    }

    @Transactional
    public void deleteReview(String reviewId) {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank()) throw new ResponseStatusException(UNAUTHORIZED);

        CommentaireProduit review = commentaireProduitRepository.findById(reviewId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND));
        boolean isOwner = review.getUtilisateur() != null && userId.equals(review.getUtilisateur().getId());
        if (!isOwner && !SecurityUtils.isAdmin()) throw new ResponseStatusException(FORBIDDEN);

        review.setDeletedAt(LocalDateTime.now());
        commentaireProduitRepository.save(review);
    }

    @Transactional
    public long toggleLike(String reviewId) {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank()) throw new ResponseStatusException(UNAUTHORIZED);

        CommentaireProduit review = commentaireProduitRepository.findById(reviewId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND));
        if (review.getDeletedAt() != null) throw new ResponseStatusException(NOT_FOUND);

        Utilisateur user = utilisateurRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED));
        CommentaireProduitLike existing = likeRepository.findByCommentaireIdAndUtilisateurId(reviewId, userId).orElse(null);

        if (existing != null) {
            likeRepository.delete(existing);
            review.setLikeCount(Math.max(0L, (review.getLikeCount() == null ? 0L : review.getLikeCount()) - 1));
        } else {
            CommentaireProduitLike like = new CommentaireProduitLike();
            like.setCommentaire(review);
            like.setUtilisateur(user);
            likeRepository.save(like);
            review.setLikeCount((review.getLikeCount() == null ? 0L : review.getLikeCount()) + 1);
        }

        commentaireProduitRepository.save(review);
        return review.getLikeCount() == null ? 0L : review.getLikeCount();
    }

    @Transactional
    public void reportReview(String reviewId, ReportProductReviewRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank()) throw new ResponseStatusException(UNAUTHORIZED);

        CommentaireProduit review = commentaireProduitRepository.findById(reviewId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND));
        if (review.getDeletedAt() != null) throw new ResponseStatusException(NOT_FOUND);

        Utilisateur user = utilisateurRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED));
        if (reportRepository.findByCommentaireIdAndUtilisateurId(reviewId, userId).isPresent()) return;

        CommentaireProduitReport report = new CommentaireProduitReport();
        report.setCommentaire(review);
        report.setUtilisateur(user);
        report.setReason(request.getReason().trim().toUpperCase());
        String details = request.getDetails() != null ? request.getDetails().trim() : "";
        report.setDetails(details.isBlank() ? null : details);
        reportRepository.save(report);

        review.setReportCount((review.getReportCount() == null ? 0L : review.getReportCount()) + 1);
        commentaireProduitRepository.save(review);
    }

    private ProductReviewDto toDto(CommentaireProduit c, boolean likedByMe) {
        String userId = c.getUtilisateur() != null ? c.getUtilisateur().getId() : null;
        String userName = null;
        String userAvatarUrl = null;
        if (c.getUtilisateur() != null) {
            String prenom = c.getUtilisateur().getPrenom() == null ? "" : c.getUtilisateur().getPrenom().trim();
            String nom = c.getUtilisateur().getNom() == null ? "" : c.getUtilisateur().getNom().trim();
            String full = (prenom + " " + nom).trim();
            userName = full.isBlank() ? (c.getUtilisateur().getEmail() != null ? c.getUtilisateur().getEmail() : "Utilisateur") : full;
            userAvatarUrl = c.getUtilisateur().getAvatarUrl();
        }
        return new ProductReviewDto(
                c.getId(),
                c.getProduit() != null ? c.getProduit().getId() : null,
                userId,
                userName,
                userAvatarUrl,
                c.getNote(),
                c.getCommentaire(),
                c.getLikeCount() == null ? 0L : c.getLikeCount(),
                likedByMe,
                c.getDateCreation()
        );
    }
}
