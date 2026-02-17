package com.workflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "query_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueryHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long requestId;
    
    @Column(nullable = false)
    private Integer fromLevel;
    
    @Column(nullable = false)
    private Integer toLevel;
    
    @Column(nullable = false)
    private String queryText;
    
    private String responseText;
    
    @Column(nullable = false)
    private String status;
    
    private LocalDateTime createdDate;
    
    private LocalDateTime resolvedDate;
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
}
