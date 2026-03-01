package com.lifeevent.lid.backoffice.recipient.service.impl;

import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.auth.repository.AuthenticationRepository;
import com.lifeevent.lid.backoffice.recipient.service.BackOfficeRecipientService;
import com.lifeevent.lid.newsletter.entity.NewsletterSubscriber;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import com.lifeevent.lid.newsletter.repository.NewsletterSubscriberRepository;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeRecipientServiceImpl implements BackOfficeRecipientService {

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;
    private final UserEntityRepository userEntityRepository;
    private final AuthenticationRepository authenticationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<String> getRecipientEmails(Segment segment, List<UserRole> roles, String query, Integer limit) {
        Segment safeSegment = segment == null ? Segment.CLIENT : segment;
        String safeQuery = normalizeQuery(query);
        int safeLimit = normalizeLimit(limit);

        List<String> raw = switch (safeSegment) {
            case VISITOR -> getVisitorEmails(safeQuery, safeLimit);
            case CLIENT -> getRoleBasedEmails(List.of(UserRole.CUSTOMER), safeQuery, safeLimit);
            case TEAM -> getRoleBasedEmails(resolveTeamRoles(roles), safeQuery, safeLimit);
        };

        return normalizeEmails(raw, safeLimit);
    }

    private List<String> getVisitorEmails(String query, int limit) {
        return newsletterSubscriberRepository.search(
                        NewsletterSubscriberStatus.SUBSCRIBED,
                        query,
                        PageRequest.of(0, limit)
                )
                .map(NewsletterSubscriber::getEmail)
                .getContent();
    }

    private List<String> getRoleBasedEmails(List<UserRole> roles, String query, int limit) {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        List<String> userIds = authenticationRepository.findUserIdsByRolesIn(roles);
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }
        List<String> emails = new ArrayList<>();
        for (var user : userEntityRepository.findAllById(userIds)) {
            String email = user.getEmail();
            if (!matches(email, query)) {
                continue;
            }
            emails.add(email);
            if (emails.size() >= limit) {
                break;
            }
        }
        return emails;
    }

    private List<UserRole> resolveTeamRoles(List<UserRole> roles) {
        if (roles != null && !roles.isEmpty()) {
            return roles;
        }
        return List.of(
                UserRole.ADMIN,
                UserRole.SUPER_ADMIN,
                UserRole.LIVREUR,
                UserRole.PARTNER
        );
    }

    private List<String> normalizeEmails(List<String> emails, int limit) {
        Set<String> deduped = new LinkedHashSet<>();
        if (emails != null) {
            for (String email : emails) {
                if (email == null) {
                    continue;
                }
                String normalized = email.trim().toLowerCase(Locale.ROOT);
                if (normalized.isEmpty()) {
                    continue;
                }
                deduped.add(normalized);
                if (deduped.size() >= limit) {
                    break;
                }
            }
        }
        return new ArrayList<>(deduped);
    }

    private boolean matches(String value, String query) {
        if (value == null) {
            return false;
        }
        if (query == null) {
            return true;
        }
        return value.toLowerCase(Locale.ROOT).contains(query);
    }

    private String normalizeQuery(String query) {
        if (query == null) {
            return null;
        }
        String trimmed = query.trim().toLowerCase(Locale.ROOT);
        return trimmed.isEmpty() ? null : trimmed;
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) {
            return 200;
        }
        return Math.max(1, Math.min(limit, 1000));
    }
}
