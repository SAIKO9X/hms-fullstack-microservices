package com.hms.pharmacy.services.impl;

import com.hms.pharmacy.dto.request.MedicineRequest;
import com.hms.pharmacy.dto.response.MedicineResponse;
import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.exceptions.InsufficientStockException;
import com.hms.pharmacy.exceptions.MedicineAlreadyExistsException;
import com.hms.pharmacy.exceptions.MedicineNotFoundException;
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
        throw new MedicineAlreadyExistsException("Um medicamento com o mesmo nome e dosagem já existe.");
      });

    Medicine newMedicine = new Medicine();
    mapRequestToEntity(request, newMedicine);

    return MedicineResponse.fromEntity(medicineRepository.save(newMedicine));
  }

  @Override
  @Transactional
  @CacheEvict(value = "medicines", key = "#medicineId")
  public MedicineResponse updateMedicine(Long medicineId, MedicineRequest request) {
    Medicine existingMedicine = medicineRepository.findById(medicineId)
      .orElseThrow(() -> new MedicineNotFoundException("Medicamento com ID " + medicineId + " não encontrado."));

    medicineRepository.findByNameIgnoreCaseAndDosageIgnoreCase(request.name(), request.dosage())
      .ifPresent(m -> {
        if (!m.getId().equals(medicineId)) {
          throw new MedicineAlreadyExistsException("Já existe outro medicamento com o mesmo nome e dosagem.");
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
      .orElseThrow(() -> new MedicineNotFoundException("Medicamento com ID " + medicineId + " não encontrado."));
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
      .orElseThrow(() -> new MedicineNotFoundException("Medicamento com ID " + medicineId + " não encontrado."));
  }

  @Override
  @Transactional
  @CacheEvict(value = "medicines", key = "#medicineId")
  public Integer addStock(Long medicineId, Integer quantity) {
    if (quantity <= 0) {
      throw new IllegalArgumentException("A quantidade a adicionar deve ser positiva.");
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
      throw new IllegalArgumentException("A quantidade a remover deve ser positiva.");
    }
    Medicine medicine = findMedicineById(medicineId);
    if (medicine.getTotalStock() < quantity) {
      throw new InsufficientStockException("Stock insuficiente para o medicamento: " + medicine.getName());
    }
    medicine.setTotalStock(medicine.getTotalStock() - quantity);
    return medicineRepository.save(medicine).getTotalStock();
  }

  // Método auxiliar para evitar duplicação
  private Medicine findMedicineById(Long medicineId) {
    return medicineRepository.findById(medicineId)
      .orElseThrow(() -> new MedicineNotFoundException("Medicamento com ID " + medicineId + " não encontrado."));
  }

  // Método auxiliar para mapear os dados de um MedicineRequest para uma entidade Medicine.
  private void mapRequestToEntity(MedicineRequest request, Medicine medicine) {
    medicine.setName(request.name());
    medicine.setDosage(request.dosage());
    medicine.setCategory(request.category());
    medicine.setType(request.type());
    medicine.setManufacturer(request.manufacturer());
    medicine.setUnitPrice(request.unitPrice());
  }
}