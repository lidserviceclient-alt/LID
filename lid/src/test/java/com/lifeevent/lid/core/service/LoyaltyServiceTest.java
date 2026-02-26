package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.AdjustLoyaltyPointsRequest;
import com.lifeevent.lid.core.entity.CustomerLoyalty;
import com.lifeevent.lid.core.entity.LoyaltyPointTransaction;
import com.lifeevent.lid.core.entity.LoyaltyTier;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.repository.CommandeRepository;
import com.lifeevent.lid.core.repository.CustomerLoyaltyRepository;
import com.lifeevent.lid.core.repository.LoyaltyConfigRepository;
import com.lifeevent.lid.core.repository.LoyaltyPointTransactionRepository;
import com.lifeevent.lid.core.repository.LoyaltyTierRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LoyaltyServiceTest {

    @Test
    void adjustPoints_increasesPoints_andCreatesAdjustmentTx() {
        LoyaltyConfigRepository cfgRepo = mock(LoyaltyConfigRepository.class);
        LoyaltyTierRepository tierRepo = mock(LoyaltyTierRepository.class);
        CustomerLoyaltyRepository loyaltyRepo = mock(CustomerLoyaltyRepository.class);
        LoyaltyPointTransactionRepository txRepo = mock(LoyaltyPointTransactionRepository.class);
        CommandeRepository commandeRepo = mock(CommandeRepository.class);
        UtilisateurRepository userRepo = mock(UtilisateurRepository.class);

        when(tierRepo.count()).thenReturn(1L);
        when(tierRepo.findAllByOrderByRankOrderAscMinPointsAsc()).thenReturn(List.of(makeTier("Bronze", 0, 1)));

        Utilisateur u = new Utilisateur();
        u.setId("u1");
        u.setEmail("a@b.com");
        u.setRole(RoleUtilisateur.CLIENT);

        CustomerLoyalty cl = new CustomerLoyalty();
        cl.setUtilisateur(u);
        cl.setPoints(10);

        when(userRepo.findById("u1")).thenReturn(Optional.of(u));
        when(loyaltyRepo.findByUtilisateurId("u1")).thenReturn(Optional.of(cl));
        when(loyaltyRepo.save(any(CustomerLoyalty.class))).thenAnswer(inv -> inv.getArgument(0));
        when(txRepo.save(any(LoyaltyPointTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        LoyaltyService svc = new LoyaltyService(cfgRepo, tierRepo, loyaltyRepo, txRepo, commandeRepo, userRepo);

        var updated = svc.adjustPoints("u1", AdjustLoyaltyPointsRequest.builder().deltaPoints(5).reason("test").build());

        assertEquals(15, updated.points());
        verify(txRepo, times(1)).save(any(LoyaltyPointTransaction.class));
    }

    @Test
    void adjustPoints_rejectsNegativeResult() {
        LoyaltyConfigRepository cfgRepo = mock(LoyaltyConfigRepository.class);
        LoyaltyTierRepository tierRepo = mock(LoyaltyTierRepository.class);
        CustomerLoyaltyRepository loyaltyRepo = mock(CustomerLoyaltyRepository.class);
        LoyaltyPointTransactionRepository txRepo = mock(LoyaltyPointTransactionRepository.class);
        CommandeRepository commandeRepo = mock(CommandeRepository.class);
        UtilisateurRepository userRepo = mock(UtilisateurRepository.class);

        when(tierRepo.count()).thenReturn(1L);
        when(tierRepo.findAllByOrderByRankOrderAscMinPointsAsc()).thenReturn(List.of(makeTier("Bronze", 0, 1)));

        Utilisateur u = new Utilisateur();
        u.setId("u1");
        u.setEmail("a@b.com");
        u.setRole(RoleUtilisateur.CLIENT);

        CustomerLoyalty cl = new CustomerLoyalty();
        cl.setUtilisateur(u);
        cl.setPoints(3);

        when(userRepo.findById("u1")).thenReturn(Optional.of(u));
        when(loyaltyRepo.findByUtilisateurId("u1")).thenReturn(Optional.of(cl));

        LoyaltyService svc = new LoyaltyService(cfgRepo, tierRepo, loyaltyRepo, txRepo, commandeRepo, userRepo);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                svc.adjustPoints("u1", AdjustLoyaltyPointsRequest.builder().deltaPoints(-10).reason("x").build())
        );
        assertEquals("Points insuffisants", ex.getMessage());
        verify(txRepo, never()).save(any());
    }

    private static LoyaltyTier makeTier(String name, int minPoints, int rank) {
        LoyaltyTier t = new LoyaltyTier();
        t.setId("t-" + name);
        t.setName(name);
        t.setMinPoints(minPoints);
        t.setRankOrder(rank);
        return t;
    }
}

