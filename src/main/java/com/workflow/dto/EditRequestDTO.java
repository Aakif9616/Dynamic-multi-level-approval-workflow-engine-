package com.workflow.dto;

import lombok.Data;

@Data
public class EditRequestDTO {
    private Long requestId;
    private String requester;
    private String productName;
    private String description;
    private String role; // Role making the edit
}
