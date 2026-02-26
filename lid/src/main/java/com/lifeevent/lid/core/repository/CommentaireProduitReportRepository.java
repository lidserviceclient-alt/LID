package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.CommentaireProduitReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentaireProduitReportRepository extends JpaRepository<CommentaireProduitReport, String> {
    Optional<CommentaireProduitReport> findByCommentaireIdAndUtilisateurId(String commentaireId, String utilisateurId);
    long countByCommentaireId(String commentaireId);
}

