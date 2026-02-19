package com.workflow.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "form_fields")
@Data
public class FormField {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;
    
    @Column(nullable = false)
    private String fieldName;
    
    @Column(nullable = false)
    private String fieldLabel;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldType fieldType;
    
    @Column(length = 2000)
    private String fieldOptions; // JSON string for dropdown/radio options
    
    @Column(nullable = false)
    private Integer displayOrder = 0;
    
    @Column(nullable = false)
    private Boolean required = false;
    
    @Column(length = 500)
    private String placeholder;
    
    @Column(length = 1000)
    private String helpText;
    
    // Level visibility and editability
    @Column(nullable = false)
    private String visibleAtLevels = "1,2,3,4,5,6,7,8,9,10"; // Comma-separated level numbers
    
    @Column(nullable = false)
    private String editableAtLevels = "1"; // Comma-separated level numbers
    
    @Column(nullable = false)
    private Boolean active = true;
}
