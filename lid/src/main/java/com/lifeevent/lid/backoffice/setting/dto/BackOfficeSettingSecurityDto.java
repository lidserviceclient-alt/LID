package com.lifeevent.lid.backoffice.setting.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingSecurityDto {
    private Boolean admin2faEnabled;
}
