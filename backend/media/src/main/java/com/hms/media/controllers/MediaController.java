package com.hms.media.controllers;

import com.hms.media.dto.MediaFileDto;
import com.hms.media.services.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

  private final MediaService mediaService;

  @PostMapping("/upload")
  public ResponseEntity<MediaFileDto> uploadFile(@RequestParam("file") MultipartFile file) {
    try {
      return ResponseEntity.status(HttpStatus.CREATED).body(mediaService.storeFile(file));
    } catch (IOException e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<byte[]> getFile(@PathVariable Long id) {
    return mediaService.getFileById(id)
      .map(file -> ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(file.getType()))
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
        .body(file.getData()))
      .orElse(ResponseEntity.notFound().build());
  }
}