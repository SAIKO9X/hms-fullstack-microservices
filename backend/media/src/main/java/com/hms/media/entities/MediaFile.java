package com.hms.media.entities;

import com.hms.media.enums.Storage;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tb_media_files")
public class MediaFile {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  private String type;

  private Long size;

  @Lob
  @Basic(fetch = FetchType.LAZY) // Carrega os dados binários apenas quando necessário
  private byte[] data;

  @Enumerated(EnumType.STRING)
  private Storage storage;

  @CreationTimestamp
  private LocalDateTime creationDate;
}