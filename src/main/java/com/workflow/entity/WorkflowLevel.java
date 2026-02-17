package com.workflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "workflow_levels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowLevel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private Integer levelOrder;
    
    @Column(nullable = false)
    private String levelName;
    
    @Column(nullable = false)
    private String role;
    
    private Integer nextLevel;
    
    private Integer queryReturnLevel;
    
    @Column(nullable = false)
    private Boolean enabled = true;
}
