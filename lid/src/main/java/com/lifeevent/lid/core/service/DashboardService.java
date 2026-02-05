package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.DashboardResponseDto;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.enums.StatutCommande;
import com.lifeevent.lid.core.enums.StatutProduit;
import com.lifeevent.lid.core.repository.CommandeRepository;
import com.lifeevent.lid.core.repository.ProduitRepository;
import com.lifeevent.lid.core.repository.StockRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardService {

    private final CommandeRepository commandeRepository;
    private final ProduitRepository produitRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final StockRepository stockRepository;

    public DashboardService(CommandeRepository commandeRepository,
                            ProduitRepository produitRepository,
                            UtilisateurRepository utilisateurRepository,
                            StockRepository stockRepository) {
        this.commandeRepository = commandeRepository;
        this.produitRepository = produitRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.stockRepository = stockRepository;
    }

    public DashboardResponseDto getDashboard() {
        long totalOrders = commandeRepository.count();
        BigDecimal totalRevenue = commandeRepository.sumTotalRevenue();
        long pendingOrders = commandeRepository.countByStatut(StatutCommande.CREEE);
        long activeProducts = produitRepository.countByStatut(StatutProduit.ACTIF);
        long customers = utilisateurRepository.countByRole(RoleUtilisateur.CLIENT);
        long lowStock = stockRepository.countByQuantiteDisponibleLessThan(10);

        return new DashboardResponseDto(
            totalOrders,
            totalRevenue,
            pendingOrders,
            activeProducts,
            customers,
            lowStock
        );
    }
}
