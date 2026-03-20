package com.lifeevent.lid.backoffice.lid.setting.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingShopProfileDto {
    private String storeName;
    private String contactEmail;
    private String contactPhone;
    private String city;
    private String logoUrl;
    private String slogan;
    private String activitySector;
}
