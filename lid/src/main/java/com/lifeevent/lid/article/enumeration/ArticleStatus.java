package com.lifeevent.lid.article.enumeration;

/**
 * Statut d'un article
 * ACTIVE : article actif et visible
 * INACTIVE : article masqué du catalogue (soft delete)
 * DISCONTINUED : article arrêté (fin de vie)
 */
public enum ArticleStatus {
    ACTIVE,
    INACTIVE,
    DISCONTINUED
}
