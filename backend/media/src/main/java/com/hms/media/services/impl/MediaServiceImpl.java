package com.hms.media.services.impl;

import com.hms.common.exceptions.InvalidOperationException;
import com.hms.common.exceptions.ResourceNotFoundException;
import com.hms.media.dto.MediaFileDto;
import com.hms.media.entities.MediaFile;
import com.hms.media.enums.Storage;
import com.hms.media.repositories.MediaFileRepository;
import com.hms.media.services.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

  private final MediaFileRepository mediaFileRepository;

  @Override
  public MediaFileDto storeFile(MultipartFile file) {
    try {
      MediaFile mediaFile = MediaFile.builder()
        .name(file.getOriginalFilename())
        .type(file.getContentType())
        .size(file.getSize())
        .data(file.getBytes()) // Armazena os bytes do arquivo
        .storage(Storage.DB) // Define o local de armazenamento
        .build();

      MediaFile savedFile = mediaFileRepository.save(mediaFile);
      return MediaFileDto.fromEntity(savedFile);
    } catch (IOException e) {
      throw new InvalidOperationException("Falha ao processar o arquivo para upload: " + e.getMessage());
    }
  }

  @Override
  public MediaFile getFileById(Long id) {
    return mediaFileRepository.findById(id)
      .orElseThrow(() -> new ResourceNotFoundException("Media File", id));
  }
}