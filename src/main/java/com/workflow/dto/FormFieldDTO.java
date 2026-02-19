package com.workflow.dto;

import com.workflow.entity.FieldType;
import lombok.Data;

@Data
public class FormFieldDTO {
    private Long id;
    private String fieldName;
    private String fieldLabel;
    private FieldType fieldType;
    private String fieldOptions; // JSON string
    private Integer displayOrder;
    private Boolean required;
    private String placeholder;
    private String helpText;
    private String visibleAtLevels;
    private String editableAtLevels;
    private Boolean active;
    private String currentValue; // For rendering with existing data
    private Boolean isEditable; // Computed based on current level
}
