package com.lifeevent.lid.order.enumeration;

/**
 * Statuts possibles d'une commande
 */
public enum Status {
    PENDING,             // En attente de paiement
    PAID,                // Paiement confirmé
    PROCESSING,          // En traitement
    READY_TO_DELIVER,    // Prêt à livrer
    DELIVERY_IN_PROGRESS,// En cours de livraison
    DELIVERED,           // Livré
    CANCELED             // Annulé
}
