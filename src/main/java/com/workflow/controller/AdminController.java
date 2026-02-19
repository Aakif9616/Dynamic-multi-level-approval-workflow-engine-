package com.workflow.controller;

import com.workflow.entity.Permission;
import com.workflow.entity.Role;
import com.workflow.entity.WorkflowLevel;
import com.workflow.repository.RoleRepository;
import com.workflow.repository.WorkflowLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final WorkflowLevelRepository levelRepository;
    private final RoleRepository roleRepository;
    
    @GetMapping("/levels")
    public ResponseEntity<List<WorkflowLevel>> getAllLevels() {
        return ResponseEntity.ok(levelRepository.findAll());
    }
    
    @PostMapping("/levels")
    public ResponseEntity<WorkflowLevel> createLevel(@RequestBody WorkflowLevel level) {
        // Save workflow level
        WorkflowLevel savedLevel = levelRepository.save(level);
        
        // Auto-create RBAC role if it doesn't exist
        Optional<Role> existingRole = roleRepository.findByRoleName(level.getRole());
        if (existingRole.isEmpty()) {
            Role newRole = new Role();
            newRole.setRoleName(level.getRole());
            newRole.setLevelOrder(level.getLevelOrder());
            newRole.setDescription(level.getLevelName());
            newRole.setIsFinalLevel(level.getNextLevel() == null);
            
            // Set default permissions based on level
            Set<Permission> permissions = getDefaultPermissions(level.getLevelOrder(), level.getNextLevel() == null);
            newRole.setPermissions(permissions);
            
            roleRepository.save(newRole);
        }
        
        return ResponseEntity.ok(savedLevel);
    }
    
    @PutMapping("/levels/{id}")
    public ResponseEntity<WorkflowLevel> updateLevel(@PathVariable Long id, @RequestBody WorkflowLevel level) {
        level.setId(id);
        WorkflowLevel savedLevel = levelRepository.save(level);
        
        // Auto-update RBAC role
        Optional<Role> existingRole = roleRepository.findByRoleName(level.getRole());
        if (existingRole.isPresent()) {
            Role role = existingRole.get();
            role.setLevelOrder(level.getLevelOrder());
            role.setDescription(level.getLevelName());
            role.setIsFinalLevel(level.getNextLevel() == null);
            
            // Update permissions if final level status changed
            if (level.getNextLevel() == null && !role.getIsFinalLevel()) {
                // Became final level - add admin permissions
                Set<Permission> permissions = role.getPermissions();
                permissions.add(Permission.DELETE_REQUEST);
                permissions.add(Permission.VIEW_ALL_REQUESTS);
                permissions.add(Permission.MANAGE_LEVELS);
                role.setPermissions(permissions);
            } else if (level.getNextLevel() != null && role.getIsFinalLevel()) {
                // No longer final level - remove admin permissions
                Set<Permission> permissions = role.getPermissions();
                permissions.remove(Permission.DELETE_REQUEST);
                permissions.remove(Permission.VIEW_ALL_REQUESTS);
                permissions.remove(Permission.MANAGE_LEVELS);
                role.setPermissions(permissions);
            }
            
            roleRepository.save(role);
        }
        
        return ResponseEntity.ok(savedLevel);
    }
    
    @DeleteMapping("/levels/{id}")
    public ResponseEntity<Void> deleteLevel(@PathVariable Long id) {
        // Find the level to get its role name
        Optional<WorkflowLevel> level = levelRepository.findById(id);
        if (level.isPresent()) {
            // Delete associated RBAC role
            Optional<Role> role = roleRepository.findByRoleName(level.get().getRole());
            role.ifPresent(roleRepository::delete);
        }
        
        // Delete workflow level
        levelRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    private Set<Permission> getDefaultPermissions(int levelOrder, boolean isFinalLevel) {
        Set<Permission> permissions = new HashSet<>();
        
        if (levelOrder == 1) {
            // Level 1: Creator - can only create and view
            permissions.add(Permission.CREATE_REQUEST);
            permissions.add(Permission.VIEW_REQUEST);
        } else {
            // Levels 2+: Approvers - can approve, query, edit, view
            permissions.add(Permission.APPROVE_TASK);
            permissions.add(Permission.QUERY_TASK);
            permissions.add(Permission.EDIT_REQUEST);
            permissions.add(Permission.VIEW_REQUEST);
            
            if (isFinalLevel) {
                // Final level: Add admin permissions
                permissions.add(Permission.DELETE_REQUEST);
                permissions.add(Permission.VIEW_ALL_REQUESTS);
                permissions.add(Permission.MANAGE_LEVELS);
            }
        }
        
        return permissions;
    }
}
