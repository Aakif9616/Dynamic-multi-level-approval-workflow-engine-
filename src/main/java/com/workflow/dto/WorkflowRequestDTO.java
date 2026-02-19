package com.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowRequestDTO {
    private String requester;
    private String productName;
    private String description;
    private String role; // Role creating the request (for RBAC)
    private Long formId; // NEW: Which form to use
    private Map<Long, String> formData; // NEW: Field ID -> Value
}
