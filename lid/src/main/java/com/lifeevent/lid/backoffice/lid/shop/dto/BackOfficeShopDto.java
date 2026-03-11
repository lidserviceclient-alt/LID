package com.lifeevent.lid.backoffice.lid.shop.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeShopDto {
    private Long id;
    private String name;
    private String description;
    private String logoUrl;
    private String backgroundUrl;
    private String status;
    private Integer mainCategoryId;
    private String mainCategoryName;
    private String partnerId;
    private String partnerEmail;
}
