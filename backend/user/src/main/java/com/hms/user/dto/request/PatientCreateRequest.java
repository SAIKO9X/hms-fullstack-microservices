package com.hms.user.dto.request;

public record PatientCreateRequest(Long userId, String cpf, String name) {}
