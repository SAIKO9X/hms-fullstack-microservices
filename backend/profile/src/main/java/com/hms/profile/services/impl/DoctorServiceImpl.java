package com.hms.profile.services.impl;

import com.hms.profile.clients.AppointmentFeignClient;
import com.hms.profile.dto.request.AdminDoctorUpdateRequest;
import com.hms.profile.dto.request.DoctorCreateRequest;
import com.hms.profile.dto.request.DoctorUpdateRequest;
import com.hms.profile.dto.response.DoctorDropdownResponse;
import com.hms.profile.dto.response.DoctorResponse;
import com.hms.profile.dto.response.DoctorStatusResponse;
import com.hms.profile.entities.Doctor;
import com.hms.profile.exceptions.ProfileAlreadyExistsException;
import com.hms.profile.exceptions.ProfileNotFoundException;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.services.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

  private final DoctorRepository doctorRepository;
  private final AppointmentFeignClient appointmentFeignClient;

  @Override
  public DoctorResponse createDoctorProfile(DoctorCreateRequest request) {
    if (doctorRepository.existsByUserIdOrCrmNumber(request.userId(), request.crmNumber())) {
      throw new ProfileAlreadyExistsException("Um perfil para este doutor (userId ou CRM) já existe.");
    }

    Doctor newDoctor = new Doctor();
    newDoctor.setUserId(request.userId());
    newDoctor.setCrmNumber(request.crmNumber());
    newDoctor.setName(request.name());

    return DoctorResponse.fromEntity(doctorRepository.save(newDoctor));
  }

  @Override
  @Transactional(readOnly = true)
  public DoctorResponse getDoctorProfileByUserId(Long userId) {
    return doctorRepository.findByUserId(userId)
      .map(DoctorResponse::fromEntity)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil de doutor não encontrado para o usuário com ID: " + userId));
  }

  @Override
  public DoctorResponse updateDoctorProfile(Long userId, DoctorUpdateRequest request) {
    Doctor doctorToUpdate = doctorRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil de doutor não encontrado para o usuário com ID: " + userId));

    doctorToUpdate.setName(request.name());
    doctorToUpdate.setDateOfBirth(request.dateOfBirth());
    doctorToUpdate.setSpecialization(request.specialization());
    doctorToUpdate.setDepartment(request.department());
    doctorToUpdate.setPhoneNumber(request.phoneNumber());
    doctorToUpdate.setYearsOfExperience(request.yearsOfExperience());
    doctorToUpdate.setQualifications(request.qualifications());
    doctorToUpdate.setBiography(request.biography());

    return DoctorResponse.fromEntity(doctorRepository.save(doctorToUpdate));
  }

  @Override
  public boolean doctorProfileExists(Long userId) {
    return doctorRepository.existsByUserId(userId);
  }

  @Override
  public List<DoctorDropdownResponse> getDoctorsForDropdown() {
    return doctorRepository.findAllForDropdown();
  }

  @Override
  @Transactional(readOnly = true)
  public List<DoctorResponse> findAllDoctors() {
    return doctorRepository.findAll().stream()
      .map(DoctorResponse::fromEntity)
      .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public DoctorResponse getDoctorProfileById(Long id) {
    return doctorRepository.findById(id)
      .map(DoctorResponse::fromEntity)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil de médico não encontrado para o ID: " + id));
  }

  @Override
  public void updateProfilePicture(Long userId, String pictureUrl) {
    Doctor doctor = doctorRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil não encontrado para o usuário com ID: " + userId));
    doctor.setProfilePictureUrl(pictureUrl);
    doctorRepository.save(doctor);
  }

  @Override
  @Transactional(readOnly = true)
  public List<DoctorStatusResponse> getDoctorsWithStatus() {
    List<Doctor> doctors = doctorRepository.findAll();
    List<Long> activeDoctorIds = appointmentFeignClient.getActiveDoctorIds();

    return doctors.stream().map(doctor -> new DoctorStatusResponse(
      doctor.getId(),
      doctor.getName(),
      doctor.getSpecialization(),
      activeDoctorIds.contains(doctor.getUserId()) ? "Em Consulta" : "Disponível",
      doctor.getProfilePictureUrl()
    )).collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void adminUpdateDoctor(Long userId, AdminDoctorUpdateRequest request) {
    Doctor doctor = doctorRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil do médico não encontrado para o ID de usuário: " + userId));

    if (request.name() != null && !request.name().isBlank()) {
      doctor.setName(request.name());
    }
    if (request.crmNumber() != null) {
      doctor.setCrmNumber(request.crmNumber());
    }
    if (request.specialization() != null) {
      doctor.setSpecialization(request.specialization());
    }
    if (request.department() != null) {
      doctor.setDepartment(request.department());
    }
    if (request.phoneNumber() != null) {
      doctor.setPhoneNumber(request.phoneNumber());
    }
    if (request.biography() != null) {
      doctor.setBiography(request.biography());
    }
    if (request.qualifications() != null) {
      doctor.setQualifications(request.qualifications());
    }
    if (request.dateOfBirth() != null) {
      doctor.setDateOfBirth(request.dateOfBirth());
    }
    if (request.yearsOfExperience() != null) {
      doctor.setYearsOfExperience(request.yearsOfExperience());
    }

    doctorRepository.save(doctor);
  }

  @Override
  public long countAllDoctors() {
    return doctorRepository.count();
  }
}