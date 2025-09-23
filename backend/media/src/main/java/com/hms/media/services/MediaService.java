package com.hms.media.services;

import com.hms.media.dto.MediaFileDto;
import com.hms.media.entities.MediaFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

public interface MediaService {
  MediaFileDto storeFile(MultipartFile file) throws IOException;

  Optional<MediaFile> getFileById(Long id);
}