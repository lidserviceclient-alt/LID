package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.enums.NewsletterSubscriberStatus;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.repository.NewsletterSubscriberRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class RecipientService {

    public enum Segment {
        VISITOR,
        CLIENT,
        TEAM
    }

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;
    private final UtilisateurRepository utilisateurRepository;

    public RecipientService(NewsletterSubscriberRepository newsletterSubscriberRepository, UtilisateurRepository utilisateurRepository) {
        this.newsletterSubscriberRepository = newsletterSubscriberRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional(readOnly = true)
    public List<String> listEmails(Segment segment, List<RoleUtilisateur> roles, String q, int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 1000);
        Pageable pageable = PageRequest.of(0, safeLimit);
        String query = q == null || q.trim().isEmpty() ? null : q.trim();

        List<String> raw;
        if (segment == Segment.VISITOR) {
            raw = newsletterSubscriberRepository
                    .search(NewsletterSubscriberStatus.SUBSCRIBED, query, pageable)
                    .map((s) -> s.getEmail())
                    .getContent();
        } else if (segment == Segment.TEAM) {
            List<RoleUtilisateur> effective = (roles == null || roles.isEmpty())
                    ? List.of(RoleUtilisateur.ADMIN, RoleUtilisateur.SUPER_ADMIN, RoleUtilisateur.IT, RoleUtilisateur.LIVREUR, RoleUtilisateur.PARTENAIRE)
                    : roles;
            raw = utilisateurRepository.findEmailsByRoles(effective, query, pageable);
        } else {
            raw = utilisateurRepository.findEmailsByRoles(List.of(RoleUtilisateur.CLIENT), query, pageable);
        }

        Set<String> out = new LinkedHashSet<>();
        for (String email : raw) {
            if (email == null) continue;
            String v = email.trim().toLowerCase(Locale.ROOT);
            if (v.isEmpty()) continue;
            out.add(v);
        }
        return new ArrayList<>(out);
    }
}

