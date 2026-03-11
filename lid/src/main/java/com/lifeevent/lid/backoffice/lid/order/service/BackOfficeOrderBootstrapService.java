package com.lifeevent.lid.backoffice.lid.order.service;

import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeOrderCreateBootstrapDto;

public interface BackOfficeOrderBootstrapService {
    BackOfficeOrderCreateBootstrapDto getCreateBootstrap(int customersPage, int customersSize, int productsPage, int productsSize);
}
