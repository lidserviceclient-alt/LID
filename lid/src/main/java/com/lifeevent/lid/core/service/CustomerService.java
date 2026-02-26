package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.CreateCustomerRequest;
import com.lifeevent.lid.core.dto.CustomerSummaryDto;
import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.CustomerLoyalty;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.repository.CommandeRepository;
import com.lifeevent.lid.core.repository.CustomerLoyaltyRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.springframework.http.HttpStatus.CONFLICT;

@Service
public class CustomerService {

    private final UtilisateurRepository utilisateurRepository;
    private final CommandeRepository commandeRepository;
    private final CustomerLoyaltyRepository customerLoyaltyRepository;
    private final LoyaltyService loyaltyService;

    public CustomerService(UtilisateurRepository utilisateurRepository,
                           CommandeRepository commandeRepository,
                           CustomerLoyaltyRepository customerLoyaltyRepository,
                           LoyaltyService loyaltyService) {
        this.utilisateurRepository = utilisateurRepository;
        this.commandeRepository = commandeRepository;
        this.customerLoyaltyRepository = customerLoyaltyRepository;
        this.loyaltyService = loyaltyService;
    }

    public Page<CustomerSummaryDto> listCustomers(Pageable pageable) {
        Page<Utilisateur> page = utilisateurRepository.findByRole(RoleUtilisateur.CLIENT, pageable);
        List<Utilisateur> users = page.getContent();
        List<String> ids = users.stream().map(Utilisateur::getId).filter(v -> v != null && !v.isBlank()).toList();

        Map<String, CustomerLoyalty> loyaltyByUserId = new HashMap<>();
        if (!ids.isEmpty()) {
            for (CustomerLoyalty cl : customerLoyaltyRepository.findByUtilisateurIdIn(ids)) {
                if (cl != null && cl.getUtilisateur() != null && cl.getUtilisateur().getId() != null) {
                    loyaltyByUserId.put(cl.getUtilisateur().getId(), cl);
                }
            }
        }

        List<CustomerSummaryDto> dtos = users.stream().map((u) -> toSummary(u, loyaltyByUserId.get(u.getId()))).toList();
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    public CustomerSummaryDto createCustomer(CreateCustomerRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (utilisateurRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "Email deja utilise");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setNom(request.getNom());
        utilisateur.setEmail(email);
        utilisateur.setTelephone(request.getTelephone());
        utilisateur.setVille(request.getVille());
        utilisateur.setPays(request.getPays());
        utilisateur.setRole(RoleUtilisateur.CLIENT);

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return toSummary(saved, null);
    }

    private CustomerSummaryDto toSummary(Utilisateur utilisateur, CustomerLoyalty loyalty) {
        List<Commande> commandes = commandeRepository.findByClientId(utilisateur.getId());
        long orders = commandes.size();
        BigDecimal spent = commandes.stream()
            .map(Commande::getMontantTotal)
            .filter(v -> v != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        LocalDateTime lastOrder = commandes.stream()
            .map(Commande::getDateCreation)
            .filter(v -> v != null)
            .max(LocalDateTime::compareTo)
            .orElse(null);

        String name = String.format("%s %s", nullToEmpty(utilisateur.getPrenom()), nullToEmpty(utilisateur.getNom())).trim();

        int points = loyalty != null && loyalty.getPoints() != null ? loyalty.getPoints() : 0;
        String tier = loyaltyService.tierNameForPoints(points);

        return new CustomerSummaryDto(
            utilisateur.getId(),
            name.isBlank() ? "-" : name,
            utilisateur.getEmail(),
            utilisateur.getRole() != null ? utilisateur.getRole().name() : "-",
            orders,
            spent,
            lastOrder,
            points,
            tier
        );
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
