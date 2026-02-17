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
    public ResponseEntity<WorkflowRequest> createRequest(@RequestBody WorkflowRequestDTO dto) {
        return ResponseEntity.ok(workflowService.createRequest(dto));
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
}
