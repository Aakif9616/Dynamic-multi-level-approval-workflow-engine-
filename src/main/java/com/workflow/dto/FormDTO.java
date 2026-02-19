package com.workflow.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class FormDTO {
    private Long id;
    private String formName;
    private String description;
    private Boolean active;
    private List<FormFieldDTO> fields = new ArrayList<>();
}
