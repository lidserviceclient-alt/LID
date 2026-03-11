package com.lifeevent.lid.backoffice.lid.setting.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingNotificationPreferencesUpdateDto {
    private List<Item> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Item {
        private String key;
        private String label;
        private Boolean enabled;
    }
}
