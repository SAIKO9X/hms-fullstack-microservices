package com.hms.user.dto.request;

public record DoctorCreateRequest(Long userId, String crmNumber, String name) {}