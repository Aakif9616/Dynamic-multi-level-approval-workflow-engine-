package com.workflow.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Data
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String roleName; // e.g., "ROLE_LEVEL1", "ROLE_LEVEL2"
    
    @Column(nullable = false)
    private Integer levelOrder; // 1, 2, 3, etc.
    
    @Column(nullable = false)
    private Boolean isFinalLevel = false; // true for the last level
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_permissions", joinColumns = @JoinColumn(name = "role_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "permission")
    private Set<Permission> permissions = new HashSet<>();
    
    @Column
    private String description;
}
