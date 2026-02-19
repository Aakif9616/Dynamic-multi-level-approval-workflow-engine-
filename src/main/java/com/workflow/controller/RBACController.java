package com.workflow.controller;

import com.workflow.entity.Permission;
import com.workflow.entity.Role;
import com.workflow.repository.RoleRepository;
import com.workflow.service.RBACService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/rbac")
@RequiredArgsConstructor
public class RBACController {
    
    private final RBACService rbacService;
    private final RoleRepository roleRepository;
    
    @GetMapping("/permissions")
    public ResponseEntity<Set<Permission>> getPermissions(@RequestParam String role) {
        return ResponseEntity.ok(rbacService.getPermissions(role));
    }
    
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkPermission(
            @RequestParam String role, 
            @RequestParam Permission permission) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasPermission", rbacService.hasPermission(role, permission));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/role/{roleName}")
    public ResponseEntity<Role> getRole(@PathVariable String roleName) {
        return roleRepository.findByRoleName(roleName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/roles")
    public ResponseEntity<java.util.List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleRepository.findAll());
    }
    
    @PostMapping("/roles")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        // Validate: Only one final level allowed
        if (role.getIsFinalLevel()) {
            roleRepository.findAll().forEach(r -> {
                if (r.getIsFinalLevel() && !r.getRoleName().equals(role.getRoleName())) {
                    r.setIsFinalLevel(false);
                    roleRepository.save(r);
                }
            });
        }
        return ResponseEntity.ok(roleRepository.save(role));
    }
    
    @PutMapping("/roles/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, @RequestBody Role role) {
        return roleRepository.findById(id)
                .map(existingRole -> {
                    existingRole.setRoleName(role.getRoleName());
                    existingRole.setLevelOrder(role.getLevelOrder());
                    existingRole.setIsFinalLevel(role.getIsFinalLevel());
                    existingRole.setDescription(role.getDescription());
                    existingRole.setPermissions(role.getPermissions());
                    
                    // Validate: Only one final level allowed
                    if (role.getIsFinalLevel()) {
                        roleRepository.findAll().forEach(r -> {
                            if (r.getIsFinalLevel() && !r.getId().equals(id)) {
                                r.setIsFinalLevel(false);
                                roleRepository.save(r);
                            }
                        });
                    }
                    
                    return ResponseEntity.ok(roleRepository.save(existingRole));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/permissions/all")
    public ResponseEntity<Permission[]> getAllPermissions() {
        return ResponseEntity.ok(Permission.values());
    }
}
