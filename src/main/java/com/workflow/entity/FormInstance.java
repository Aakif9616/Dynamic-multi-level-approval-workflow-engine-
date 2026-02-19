package com.workflow.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "form_instance")
@Data
public class FormInstance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String formInstanceId; // Unique ID like "FI-2024-001" - THIS IS THE PRIMARY IDENTIFIER
    
    @Column(nullable = false)
    private Long formId; // Which form template was used (e.g., "Aakif Form")
    
    @Column(nullable = true)
    private String processInstanceId; // Optional: Camunda process ID (for integration only)
    
    @Column(nullable = true)
    private Long requestId; // Optional: Workflow request ID (for integration only)
    
    @Column
    private String materialId; // Generated at the end
    
    @Column(nullable = false)
    private String status; // DRAFT, IN_PROGRESS, COMPLETED, REJECTED
    
    @Column(nullable = false)
    private Integer currentLevel;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime completedAt;
    
    @Column
    private String createdBy; // User who created
}
