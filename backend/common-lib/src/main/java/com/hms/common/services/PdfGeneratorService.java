package com.hms.common.services;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfGeneratorService {

  private final TemplateEngine templateEngine;

  public byte[] generatePdfFromHtml(String templateName, Map<String, Object> variables) {
    try {
      Context context = new Context();
      context.setVariables(variables);

      // renderiza HTML com Thymeleaf
      String htmlContent = templateEngine.process(templateName, context);

      log.debug("HTML gerado com sucesso para template: {}", templateName);

      // converte HTML para PDF
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      ConverterProperties converterProperties = new ConverterProperties();

      HtmlConverter.convertToPdf(htmlContent, outputStream, converterProperties);

      log.info("PDF gerado com sucesso a partir do template: {}", templateName);

      return outputStream.toByteArray();

    } catch (Exception e) {
      log.error("Erro ao gerar PDF do template {}: {}", templateName, e.getMessage(), e);
      throw new RuntimeException("Falha ao gerar PDF: " + e.getMessage(), e);
    }
  }
}