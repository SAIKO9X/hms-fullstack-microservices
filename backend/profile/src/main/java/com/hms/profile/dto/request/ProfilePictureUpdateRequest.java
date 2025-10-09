package com.hms.profile.request;

import jakarta.validation.constraints.NotBlank;

public record ProfilePictureUpdateRequest(
  @NotBlank(message = "A URL da imagem não pode ser vazia.")
  String pictureUrl
) {}