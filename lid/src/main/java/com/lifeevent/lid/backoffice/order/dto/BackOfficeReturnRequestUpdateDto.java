package com.lifeevent.lid.backoffice.order.dto;

import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;

public record BackOfficeReturnRequestUpdateDto(ReturnRequestStatus status) {
}
