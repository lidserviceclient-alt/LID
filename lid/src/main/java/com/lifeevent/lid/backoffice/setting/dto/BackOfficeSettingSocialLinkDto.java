package com.lifeevent.lid.backoffice.setting.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingSocialLinkDto {
    private String id;
    private String platform;
    private String url;
    private Integer sortOrder;
}
