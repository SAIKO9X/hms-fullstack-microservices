package com.hms.media.controllers;

import com.hms.common.dto.response.ApiResponse;
import com.hms.media.dto.MediaFileDto;
import com.hms.media.entities.MediaFile;
import com.hms.media.services.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

  private final MediaService mediaService;

  @PostMapping("/upload")
  public ResponseEntity<ApiResponse<MediaFileDto>> uploadFile(@RequestParam("file") MultipartFile file) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(mediaService.storeFile(file), "Upload realizado com sucesso."));
  }

  @GetMapping("/{id}")
  public ResponseEntity<byte[]> getFile(@PathVariable Long id) {
    MediaFile file = mediaService.getFileById(id);

    return ResponseEntity.ok()
      .contentType(MediaType.parseMediaType(file.getType()))
      .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
      .body(file.getData());
  }
}