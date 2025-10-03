package com.hms.media.services.impl;

import com.hms.media.dto.MediaFileDto;
import com.hms.media.entities.MediaFile;
import com.hms.media.enums.Storage;
import com.hms.media.repositories.MediaFileRepository;
import com.hms.media.services.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

  private final MediaFileRepository mediaFileRepository;

  @Override
  public MediaFileDto storeFile(MultipartFile file) throws IOException {
    MediaFile mediaFile = MediaFile.builder()
      .name(file.getOriginalFilename())
      .type(file.getContentType())
      .size(file.getSize())
      .data(file.getBytes()) // Armazena os bytes do arquivo
      .storage(Storage.DB) // Define o local de armazenamento
      .build();

    MediaFile savedFile = mediaFileRepository.save(mediaFile);
    return MediaFileDto.fromEntity(savedFile);
  }

  @Override
  public Optional<MediaFile> getFileById(Long id) {
    return mediaFileRepository.findById(id);
  }
}