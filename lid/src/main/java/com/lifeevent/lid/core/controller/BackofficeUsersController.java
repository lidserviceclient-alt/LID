package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BackofficeUserDto;
import com.lifeevent.lid.core.dto.CreateBackofficeUserRequest;
import com.lifeevent.lid.core.dto.UpdateBackofficeUserRequest;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.service.BackofficeUserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backoffice/users")
public class BackofficeUsersController {

    private final BackofficeUserService userService;

    public BackofficeUsersController(BackofficeUserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Page<BackofficeUserDto> list(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "role", required = false) RoleUtilisateur role,
            @RequestParam(value = "q", required = false) String q
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return userService.list(role, q, pageable);
    }

    @GetMapping("/{id}")
    public BackofficeUserDto get(@PathVariable String id) {
        return userService.getById(id);
    }

    @PostMapping
    public BackofficeUserDto create(@Valid @RequestBody CreateBackofficeUserRequest request) {
        return userService.create(request);
    }

    @PutMapping("/{id}")
    public BackofficeUserDto update(@PathVariable String id, @Valid @RequestBody UpdateBackofficeUserRequest request) {
        return userService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        userService.delete(id);
    }
}

