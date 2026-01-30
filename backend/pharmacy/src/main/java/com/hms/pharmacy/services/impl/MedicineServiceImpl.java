package com.hms.pharmacy.services.impl;

import com.hms.common.exceptions.InvalidOperationException;
import com.hms.common.exceptions.ResourceAlreadyExistsException;
import com.hms.common.exceptions.ResourceNotFoundException;
import com.hms.pharmacy.dto.request.MedicineRequest;
import com.hms.pharmacy.dto.response.MedicineResponse;
import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.repositories.MedicineRepository;
import com.hms.pharmacy.services.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

  private final MedicineRepository medicineRepository;

  @Override
  @Transactional
  public MedicineResponse addMedicine(MedicineRequest request) {
    medicineRepository.findByNameIgnoreCaseAndDosageIgnoreCase(request.name(), request.dosage())
      .ifPresent(m -> {
        throw new ResourceAlreadyExistsException("Medicine", request.name() + " (" + request.dosage() + ")");
      });

    Medicine newMedicine = new Medicine();
    mapRequestToEntity(request, newMedicine);

    return MedicineResponse.fromEntity(medicineRepository.save(newMedicine));
  }

  @Override
  @Transactional
  @CacheEvict(value = "medicines", key = "#medicineId")
  public MedicineResponse updateMedicine(Long medicineId, MedicineRequest request) {
    Medicine existingMedicine = findMedicineById(medicineId);

    medicineRepository.findByNameIgnoreCaseAndDosageIgnoreCase(request.name(), request.dosage())
      .ifPresent(m -> {
        if (!m.getId().equals(medicineId)) {
          throw new ResourceAlreadyExistsException("Medicine", request.name() + " (" + request.dosage() + ")");
        }
      });

    mapRequestToEntity(request, existingMedicine);

    return MedicineResponse.fromEntity(medicineRepository.save(existingMedicine));
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "medicines", key = "#medicineId")
  public MedicineResponse getMedicineById(Long medicineId) {
    return medicineRepository.findById(medicineId)
      .map(MedicineResponse::fromEntity)
      .orElseThrow(() -> new ResourceNotFoundException("Medicine", medicineId));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<MedicineResponse> getAllMedicines(Pageable pageable) {
    return medicineRepository.findAll(pageable)
      .map(MedicineResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public Integer getStockById(Long medicineId) {
    return medicineRepository.findStockById(medicineId)
      .orElseThrow(() -> new ResourceNotFoundException("Medicine", medicineId));
  }

  @Override
  @Transactional
  @CacheEvict(value = "medicines", key = "#medicineId")
  public Integer addStock(Long medicineId, Integer quantity) {
    if (quantity <= 0) {
      throw new InvalidOperationException("A quantidade a adicionar deve ser positiva.");
    }
    Medicine medicine = findMedicineById(medicineId);
    medicine.setTotalStock(medicine.getTotalStock() + quantity);
    return medicineRepository.save(medicine).getTotalStock();
  }

  @Override
  @Transactional
  @CacheEvict(value = "medicines", key = "#medicineId")
  public Integer removeStock(Long medicineId, Integer quantity) {
    if (quantity <= 0) {
      throw new InvalidOperationException("A quantidade a remover deve ser positiva.");
    }
    Medicine medicine = findMedicineById(medicineId);
    if (medicine.getTotalStock() < quantity) {
      throw new InvalidOperationException("Stock insuficiente para o medicamento: " + medicine.getName());
    }
    medicine.setTotalStock(medicine.getTotalStock() - quantity);
    return medicineRepository.save(medicine).getTotalStock();
  }

  private Medicine findMedicineById(Long medicineId) {
    return medicineRepository.findById(medicineId)
      .orElseThrow(() -> new ResourceNotFoundException("Medicine", medicineId));
  }

  private void mapRequestToEntity(MedicineRequest request, Medicine medicine) {
    medicine.setName(request.name());
    medicine.setDosage(request.dosage());
    medicine.setCategory(request.category());
    medicine.setType(request.type());
    medicine.setManufacturer(request.manufacturer());
    medicine.setUnitPrice(request.unitPrice());
  }
}