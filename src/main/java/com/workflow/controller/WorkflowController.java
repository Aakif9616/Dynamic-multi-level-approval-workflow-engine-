package com.workflow.controller;

import com.workflow.dto.*;
import com.workflow.entity.*;
import com.workflow.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflow")
@RequiredArgsConstructor
public class WorkflowController {
    
    private final WorkflowService workflowService;
    
    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody WorkflowRequestDTO dto) {
        try {
            return ResponseEntity.ok(workflowService.createRequest(dto));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage(), "timestamp", System.currentTimeMillis()));
        }
    }
    
    @GetMapping("/tasks")
    public ResponseEntity<List<Map<String, Object>>> getPendingTasks(@RequestParam String role) {
        return ResponseEntity.ok(workflowService.getPendingTasks(role));
    }
    
    @PostMapping("/approve")
    public ResponseEntity<Void> approveTask(@RequestBody ApprovalDecisionDTO dto) {
        workflowService.approveTask(dto);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/query/raise")
    public ResponseEntity<QueryHistory> raiseQuery(@RequestBody QueryRequestDTO dto) {
        return ResponseEntity.ok(workflowService.raiseQuery(dto));
    }
    
    @PostMapping("/query/resolve")
    public ResponseEntity<Void> resolveQuery(@RequestBody QueryResponseDTO dto) {
        workflowService.resolveQuery(dto);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/query/history/{requestId}")
    public ResponseEntity<List<QueryHistory>> getQueryHistory(@PathVariable Long requestId) {
        return ResponseEntity.ok(workflowService.getQueryHistory(requestId));
    }
    
    @GetMapping("/process/{processInstanceId}/variables")
    public ResponseEntity<Map<String, Object>> getProcessVariables(@PathVariable String processInstanceId) {
        return ResponseEntity.ok(workflowService.getProcessVariables(processInstanceId));
    }
    
    @PutMapping("/requests/edit")
    public ResponseEntity<WorkflowRequest> editRequest(@RequestBody EditRequestDTO dto) {
        return ResponseEntity.ok(workflowService.editRequest(dto));
    }
    
    @GetMapping("/requests/{requestId}")
    public ResponseEntity<WorkflowRequest> getRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(workflowService.getRequest(requestId));
    }
    
    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long requestId, @RequestParam String role) {
        workflowService.deleteRequest(requestId, role);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/requests/all")
    public ResponseEntity<List<WorkflowRequest>> getAllRequests(@RequestParam String role) {
        return ResponseEntity.ok(workflowService.getAllRequests(role));
    }
}
