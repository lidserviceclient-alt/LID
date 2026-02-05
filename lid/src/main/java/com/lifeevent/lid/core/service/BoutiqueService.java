package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.entity.Boutique;
import com.lifeevent.lid.core.repository.BoutiqueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoutiqueService {

    private final BoutiqueRepository boutiqueRepository;

    public BoutiqueService(BoutiqueRepository boutiqueRepository) {
        this.boutiqueRepository = boutiqueRepository;
    }

    public List<Boutique> listAll() {
        return boutiqueRepository.findAll();
    }
}
