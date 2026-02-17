package com.workflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;
    
    @Column(nullable = false)
    private String requester;
    
    @Column(nullable = false)
    private String productName;
    
    private String description;
    
    @Column(nullable = false)
    private String status;
    
    private Integer currentLevel;
    
    private String processInstanceId;
    
    private LocalDateTime createdDate;
    
    private LocalDateTime updatedDate;
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}
