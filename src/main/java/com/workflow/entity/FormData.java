package com.workflow.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "form_data")
@Data
public class FormData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String processInstanceId; // Camunda process instance ID
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private FormField field;
    
    @Column(length = 5000)
    private String fieldValue; // Stored as string, parsed based on field type
    
    @Column(nullable = false)
    private Integer enteredAtLevel; // Which level entered/modified this data
    
    @Column
    private String enteredBy; // User role who entered the data (nullable for anonymous submissions)
    
    @Column(nullable = false)
    private LocalDateTime enteredAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime updatedAt;
}
