package com.lifeevent.lid.common.util;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;

public final class PhoneNumberUtils {

    private static final PhoneNumberUtil PHONE_NUMBER_UTIL = PhoneNumberUtil.getInstance();

    private PhoneNumberUtils() {
    }

    public static String normalizeE164OrNull(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.isBlank()) {
            return null;
        }
        try {
            Phonenumber.PhoneNumber parsed = PHONE_NUMBER_UTIL.parse(trimmed, null);
            if (!PHONE_NUMBER_UTIL.isValidNumber(parsed)) {
                return null;
            }
            return PHONE_NUMBER_UTIL.format(parsed, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException ex) {
            return null;
        }
    }

    public static String requireE164(String raw, String message) {
        String normalized = normalizeE164OrNull(raw);
        if (normalized == null) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }
}
