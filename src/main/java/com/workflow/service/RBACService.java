package com.workflow.service;

import com.workflow.entity.Permission;
import com.workflow.entity.Role;
import com.workflow.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class RBACService {
    
    private final RoleRepository roleRepository;
    
    /**
     * Check if a role has a specific permission
     */
    public boolean hasPermission(String roleName, Permission permission) {
        return roleRepository.findByRoleName(roleName)
                .map(role -> role.getPermissions().contains(permission))
                .orElse(false);
    }
    
    /**
     * Get all permissions for a role
     */
    public Set<Permission> getPermissions(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .map(Role::getPermissions)
                .orElse(Set.of());
    }
    
    /**
     * Check if role is Level 1 (can create requests)
     */
    public boolean isLevel1(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .map(role -> role.getLevelOrder() == 1)
                .orElse(false);
    }
    
    /**
     * Check if role is final level (has edit permissions)
     */
    public boolean isFinalLevel(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .map(Role::getIsFinalLevel)
                .orElse(false);
    }
    
    /**
     * Validate if user can perform an action
     */
    public void validatePermission(String roleName, Permission permission) {
        if (!hasPermission(roleName, permission)) {
            log.warn("Access denied: Role {} does not have permission {}", roleName, permission);
            throw new SecurityException("Access denied: You don't have permission to " + permission.getDescription());
        }
    }
}
