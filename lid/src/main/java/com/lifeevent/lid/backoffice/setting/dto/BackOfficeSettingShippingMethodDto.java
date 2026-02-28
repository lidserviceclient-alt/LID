package com.lifeevent.lid.backoffice.setting.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingShippingMethodDto {
    private String id;
    private String code;
    private String label;
    private String description;
    private Double costAmount;
    private Boolean enabled;
    private Boolean isDefault;
    private Integer sortOrder;
}
