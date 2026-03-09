package com.lifeevent.lid.backoffice.order.service;

import com.lifeevent.lid.backoffice.order.dto.BackOfficeOrderCreateBootstrapDto;

public interface BackOfficeOrderBootstrapService {
    BackOfficeOrderCreateBootstrapDto getCreateBootstrap(int customersPage, int customersSize, int productsPage, int productsSize);
}
