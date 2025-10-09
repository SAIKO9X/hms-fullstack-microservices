package com.hms.profile.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ProfilePictureUpdateRequest(
  @NotBlank(message = "A URL da imagem não pode ser vazia.")
  String pictureUrl
) {}