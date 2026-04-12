package com.lifeevent.lid.backoffice.lid.setting.dto;

import lombok.*;

import java.util.List;
import com.lifeevent.lid.backoffice.lid.setting.entity.CustomerRefundMode;
import com.lifeevent.lid.backoffice.lid.setting.entity.PartnerSettlementMode;

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
    private String shippingPolicyNote;
    private Double vatPercent;
    private String returnWindowUnit;
    private Integer returnWindowMin;
    private Integer returnWindowMax;
    private CustomerRefundMode customerRefundMode;
    private PartnerSettlementMode partnerSettlementMode;
    private Double returnShippingCostAmount;
    private Double partnerMarginPercent;
    private String partnerPayoutWithdrawMode;
    private String returnPolicyText;
    private BackOfficeSettingFreeShippingRuleDto freeShipping;
    private List<BackOfficeSettingShippingMethodDto> shippingMethods;
}
