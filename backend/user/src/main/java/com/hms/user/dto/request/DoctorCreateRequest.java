package com.hms.user.request;

public record DoctorCreateRequest(Long userId, String crmNumber, String name) {}