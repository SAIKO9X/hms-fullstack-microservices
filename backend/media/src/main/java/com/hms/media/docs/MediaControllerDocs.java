package com.hms.media.docs;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.media.dto.MediaFileDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Mídia", description = "Endpoints para gerenciamento, upload e download de arquivos e documentos")
@ApiResponses({
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface MediaControllerDocs {

  @Operation(summary = "Upload de Arquivo", description = "Realiza o upload de um arquivo multipart e salva no sistema de armazenamento.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "201", description = "Upload realizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Arquivo inválido ou ausente", content = @Content)
  })
  ResponseEntity<ResponseWrapper<MediaFileDto>> uploadFile(
    @Parameter(description = "Arquivo a ser enviado", required = true) @RequestParam("file") MultipartFile file
  );

  @Operation(summary = "Download/Visualização de Arquivo", description = "Recupera os bytes de um arquivo salvo através do seu ID.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Arquivo recuperado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Arquivo não encontrado", content = @Content)
  })
  ResponseEntity<byte[]> getFile(
    @Parameter(description = "ID do arquivo", required = true) @PathVariable Long id
  );
}