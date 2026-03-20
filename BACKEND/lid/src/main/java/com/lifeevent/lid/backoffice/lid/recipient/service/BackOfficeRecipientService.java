package com.lifeevent.lid.backoffice.lid.recipient.service;

import com.lifeevent.lid.auth.constant.UserRole;

import java.util.List;

public interface BackOfficeRecipientService {

    enum Segment {
        VISITOR,
        CLIENT,
        TEAM
    }

    List<String> getRecipientEmails(Segment segment, List<UserRole> roles, String query, Integer limit);
}
