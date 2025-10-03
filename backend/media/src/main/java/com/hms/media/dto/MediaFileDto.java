package com.hms.media.dto;

import com.hms.media.entities.MediaFile;

public record MediaFileDto(
  Long id,
  String name,
  String type,
  Long size,
  String url
) {
  public static MediaFileDto fromEntity(MediaFile entity) {
    String url = "/media/" + entity.getId(); // Constrói a URL de download
    return new MediaFileDto(
      entity.getId(),
      entity.getName(),
      entity.getType(),
      entity.getSize(),
      url
    );
  }
}