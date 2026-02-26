package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.repository.ProduitRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EanServiceTest {

    @Test
    void isValidEan13_acceptsKnownValidCode() {
        assertTrue(EanService.isValidEan13("4006381333931"));
    }

    @Test
    void isValidEan13_rejectsInvalidCheckDigit() {
        assertFalse(EanService.isValidEan13("4006381333932"));
    }

    @Test
    void normalizeDigits_stripsNonDigits() {
        assertEquals("4006381333931", EanService.normalizeDigits("400 638-133 3931"));
    }

    @Test
    void ensureValidOrGenerate_rejectsInvalidProvidedEan() {
        ProduitRepository repo = mock(ProduitRepository.class);
        EanService svc = new EanService(repo);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> svc.ensureValidOrGenerate("SKU-1", "123"));
        assertEquals("EAN invalide.", ex.getMessage());
    }

    @Test
    void ensureValidOrGenerate_acceptsProvidedUniqueValidEan() {
        ProduitRepository repo = mock(ProduitRepository.class);
        when(repo.findByEanIgnoreCase("4006381333931")).thenReturn(Optional.empty());
        EanService svc = new EanService(repo);

        String ean = svc.ensureValidOrGenerate("SKU-1", "4006381333931");
        assertEquals("4006381333931", ean);
    }

    @Test
    void ensureValidOrGenerate_generatesValidUniqueEan() {
        ProduitRepository repo = mock(ProduitRepository.class);
        when(repo.findByEanIgnoreCase(anyString())).thenReturn(Optional.empty());
        EanService svc = new EanService(repo);

        String ean = svc.ensureValidOrGenerate("SKU-ABC", null);
        assertNotNull(ean);
        assertEquals(13, ean.length());
        assertTrue(EanService.isValidEan13(ean));
    }
}

