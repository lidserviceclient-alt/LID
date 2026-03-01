package com.lifeevent.lid.backoffice.user.service;

import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
import com.lifeevent.lid.backoffice.user.dto.CreateBackOfficeCourierRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeUserService {
    Page<BackOfficeUserDto> getAll(Pageable pageable, String role, String q);

    BackOfficeUserDto getById(String id);

    BackOfficeUserDto create(BackOfficeUserDto dto);

    BackOfficeUserDto createCourier(CreateBackOfficeCourierRequest request);

    BackOfficeUserDto update(String id, BackOfficeUserDto dto);

    BackOfficeUserDto block(String id);

    BackOfficeUserDto unblock(String id);

    void delete(String id);
}
