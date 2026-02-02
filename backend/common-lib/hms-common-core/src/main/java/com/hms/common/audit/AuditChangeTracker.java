package com.hms.common.audit;

import java.util.HashMap;
import java.util.Map;

public class AuditChangeTracker {

  private static final ThreadLocal<Map<String, ChangeDetail>> CHANGES = ThreadLocal.withInitial(HashMap::new);

  public static void addChange(String field, Object oldValue, Object newValue) {
    CHANGES.get().put(field, new ChangeDetail(
      oldValue != null ? oldValue.toString() : "null",
      newValue != null ? newValue.toString() : "null"
    ));
  }

  public static Map<String, ChangeDetail> getChanges() {
    return CHANGES.get();
  }

  public static void clear() {
    CHANGES.remove();
  }

  public record ChangeDetail(String oldValue, String newValue) {
  }
}