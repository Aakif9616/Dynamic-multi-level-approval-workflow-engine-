package com.workflow.dto;

import lombok.Data;
import java.util.Map;

@Data
public class FormSubmissionDTO {
    private String formInstanceId; // Form Instance ID - THE PRIMARY IDENTIFIER
    private Long formId;
    private Integer currentLevel;
    private String userRole;
    private Map<Long, String> fieldValues; // fieldId -> value
}
