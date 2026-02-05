package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.entity.Boutique;
import com.lifeevent.lid.core.service.BoutiqueService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/boutiques")
public class BoutiquesController {

    private final BoutiqueService boutiqueService;

    public BoutiquesController(BoutiqueService boutiqueService) {
        this.boutiqueService = boutiqueService;
    }

    @GetMapping
    public List<Boutique> listBoutiques() {
        return boutiqueService.listAll();
    }
}
