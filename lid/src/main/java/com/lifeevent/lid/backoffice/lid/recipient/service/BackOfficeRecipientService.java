package com.lifeevent.lid.backoffice.lid.recipient.service;

import java.util.List;

public interface BackOfficeRecipientService {

    enum Segment {
        VISITOR,
        CLIENT,
        TEAM
    }

    List<String> getRecipientEmails(Segment segment, List<String> roles, String query, Integer limit);
}
