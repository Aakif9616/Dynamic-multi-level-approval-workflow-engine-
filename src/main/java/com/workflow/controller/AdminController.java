package com.workflow.controller;

import com.workflow.entity.WorkflowLevel;
import com.workflow.repository.WorkflowLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final WorkflowLevelRepository levelRepository;
    
    @GetMapping("/levels")
    public ResponseEntity<List<WorkflowLevel>> getAllLevels() {
        return ResponseEntity.ok(levelRepository.findAll());
    }
    
    @PostMapping("/levels")
    public ResponseEntity<WorkflowLevel> createLevel(@RequestBody WorkflowLevel level) {
        return ResponseEntity.ok(levelRepository.save(level));
    }
    
    @PutMapping("/levels/{id}")
    public ResponseEntity<WorkflowLevel> updateLevel(@PathVariable Long id, @RequestBody WorkflowLevel level) {
        level.setId(id);
        return ResponseEntity.ok(levelRepository.save(level));
    }
    
    @DeleteMapping("/levels/{id}")
    public ResponseEntity<Void> deleteLevel(@PathVariable Long id) {
        levelRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
