package com.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueryRequestDTO {
    private Long requestId;
    private String taskId;
    private Integer targetLevel;
    private String queryText;
}
