package com.hms.appointment.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class StringListConverterTest {

  private final StringListConverter converter = new StringListConverter();

  @Test
  @DisplayName("Deve converter lista de strings para string separada por vírgula")
  void convertToDatabaseColumn_WithValidList_ShouldReturnJoinedString() {
    List<String> input = Arrays.asList("Aspirina", "Paracetamol", "Ibuprofeno");
    String result = converter.convertToDatabaseColumn(input);

    assertEquals("Aspirina,Paracetamol,Ibuprofeno", result);
  }

  @Test
  @DisplayName("Deve retornar null ao converter lista nula ou vazia para coluna do banco")
  void convertToDatabaseColumn_WithNullOrEmptyList_ShouldReturnNull() {
    assertNull(converter.convertToDatabaseColumn(null));
    assertNull(converter.convertToDatabaseColumn(Collections.emptyList()));
  }

  @Test
  @DisplayName("Deve converter string separada por vírgula para lista de strings")
  void convertToEntityAttribute_WithValidString_ShouldReturnList() {
    String input = "Aspirina,Paracetamol";
    List<String> result = converter.convertToEntityAttribute(input);

    assertEquals(2, result.size());
    assertEquals("Aspirina", result.get(0));
    assertEquals("Paracetamol", result.get(1));
  }

  @Test
  @DisplayName("Deve retornar lista vazia ao converter string nula ou composta apenas de espaços")
  void convertToEntityAttribute_WithNullOrBlankString_ShouldReturnEmptyList() {
    assertTrue(converter.convertToEntityAttribute(null).isEmpty());
    assertTrue(converter.convertToEntityAttribute("").isEmpty());
    assertTrue(converter.convertToEntityAttribute("   ").isEmpty());
  }
}