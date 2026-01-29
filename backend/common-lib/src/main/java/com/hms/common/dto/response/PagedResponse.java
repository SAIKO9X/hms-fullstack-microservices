package com.hms.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.domain.Page;

import java.util.List;


@JsonInclude(JsonInclude.Include.NON_NULL)
public record PagedResponse<T>(
  List<T> content,
  PageMetadata pagination
) {

  public static <T> PagedResponse<T> of(Page<T> page) {
    return new PagedResponse<>(
      page.getContent(),
      new PageMetadata(
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isFirst(),
        page.isLast()
      )
    );
  }

  public record PageMetadata(
    int currentPage,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last
  ) {
  }
}