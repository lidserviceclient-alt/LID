package com.lifeevent.lid.backoffice.lid.setting.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingNotificationPreferenceDto {
    private String key;
    private String label;
    private Boolean enabled;
}
