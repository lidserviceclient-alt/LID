package com.lifeevent.lid.backoffice.user.service;

import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeUserService {
    Page<BackOfficeUserDto> getAll(Pageable pageable, String role, String q);

    BackOfficeUserDto getById(String id);

    BackOfficeUserDto update(String id, BackOfficeUserDto dto);

    void delete(String id);
}
