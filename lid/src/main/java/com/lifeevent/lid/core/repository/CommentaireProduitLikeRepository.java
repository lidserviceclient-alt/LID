package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.CommentaireProduitLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CommentaireProduitLikeRepository extends JpaRepository<CommentaireProduitLike, String> {
    Optional<CommentaireProduitLike> findByCommentaireIdAndUtilisateurId(String commentaireId, String utilisateurId);
    List<CommentaireProduitLike> findByUtilisateurIdAndCommentaireIdIn(String utilisateurId, Collection<String> commentaireIds);
    long countByCommentaireId(String commentaireId);
}

