package com.lifeevent.lid.auth.dto;

public record AuthResponse(
        String accessToken,
        Boolean mfaRequired,
        String mfaTokenId,
        String devCode
) {
}
