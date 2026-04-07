package com.lifeevent.lid.order.service;

import com.lifeevent.lid.order.dto.CreateReturnRequestDto;
import com.lifeevent.lid.order.dto.ReturnRequestResponseDto;

public interface PublicReturnRequestService {
    ReturnRequestResponseDto create(CreateReturnRequestDto request);
}
