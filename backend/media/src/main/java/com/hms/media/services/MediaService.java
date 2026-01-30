package com.hms.media.services;

import com.hms.media.dto.MediaFileDto;
import com.hms.media.entities.MediaFile;
import org.springframework.web.multipart.MultipartFile;

public interface MediaService {
  MediaFileDto storeFile(MultipartFile file);

  MediaFile getFileById(Long id);
}