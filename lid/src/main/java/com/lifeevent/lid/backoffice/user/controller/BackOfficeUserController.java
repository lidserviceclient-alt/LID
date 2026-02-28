package com.lifeevent.lid.backoffice.user.controller;

import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
import com.lifeevent.lid.backoffice.user.service.BackOfficeUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/back-office/users")
@RequiredArgsConstructor
public class BackOfficeUserController implements IBackOfficeUserController {

    private final BackOfficeUserService backOfficeUserService;

    @Override
    public ResponseEntity<Page<BackOfficeUserDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(backOfficeUserService.getAll(PageRequest.of(page, size), role, q));
    }

    @Override
    public ResponseEntity<BackOfficeUserDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeUserService.getById(id));
    }

    @Override
    public ResponseEntity<BackOfficeUserDto> update(@PathVariable String id, @RequestBody BackOfficeUserDto dto) {
        return ResponseEntity.ok(backOfficeUserService.update(id, dto));
    }

    @Override
    public ResponseEntity<Void> delete(@PathVariable String id) {
        backOfficeUserService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
