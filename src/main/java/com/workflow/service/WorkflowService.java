package com.workflow.service;

import com.workflow.dto.*;
import com.workflow.entity.*;
import com.workflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowService {
    
    private final WorkflowRequestRepository requestRepository;
    private final WorkflowLevelRepository levelRepository;
    private final QueryHistoryRepository queryHistoryRepository;
    private final MaterialMasterRepository materialMasterRepository;
    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final RBACService rbacService;
    private final DynamicFormService dynamicFormService;
    private final FormInstanceService formInstanceService; // NEW
    
    @Transactional
    public WorkflowRequest createRequest(WorkflowRequestDTO dto) {
        // RBAC: All levels can create requests
        if (dto.getRole() != null) {
            rbacService.validatePermission(dto.getRole(), Permission.CREATE_REQUEST);
            log.info("Request creation authorized for role: {}", dto.getRole());
        }
        
        WorkflowRequest request = new WorkflowRequest();
        request.setRequester(dto.getRequester());
        request.setProductName(dto.getProductName());
        request.setDescription(dto.getDescription());
        request.setStatus("PENDING");
        request.setCurrentLevel(1);
        
        request = requestRepository.save(request);
        
        List<WorkflowLevel> levels = levelRepository.findByEnabledTrueOrderByLevelOrderAsc();
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("requestId", request.getRequestId());
        variables.put("currentLevel", 1);
        variables.put("totalLevels", levels.size());
        variables.put("workflowLevels", buildLevelMap(levels));
        
        // NEW: Store form ID if provided
        if (dto.getFormId() != null) {
            variables.put("formId", dto.getFormId());
        }
        
        String processInstanceId = runtimeService
            .startProcessInstanceByKey("dynamicApprovalProcess", variables)
            .getId();
        
        request.setProcessInstanceId(processInstanceId);
        request = requestRepository.save(request);
        
        // NEW: Create Form Instance if form is used
        String formInstanceId = null;
        if (dto.getFormId() != null) {
            FormInstance formInstance = formInstanceService.createFormInstance(
                dto.getFormId(),
                processInstanceId,
                request.getRequestId(),
                dto.getRole()
            );
            formInstanceId = formInstance.getFormInstanceId();
            
            // Store Form Instance ID in process variables
            runtimeService.setVariable(processInstanceId, "formInstanceId", formInstanceId);
            
            log.info("Created Form Instance: {} for Request: {}", formInstanceId, request.getRequestId());
        }
        
        // NEW: Save form data if provided
        if (dto.getFormId() != null && dto.getFormData() != null && !dto.getFormData().isEmpty()) {
            try {
                FormSubmissionDTO formSubmission = new FormSubmissionDTO();
                formSubmission.setFormInstanceId(formInstanceId); // ONLY Form Instance ID needed
                formSubmission.setFormId(dto.getFormId());
                formSubmission.setCurrentLevel(1);
                formSubmission.setUserRole(dto.getRole());
                formSubmission.setFieldValues(dto.getFormData());
                
                dynamicFormService.submitFormData(formSubmission);
                log.info("Form data saved for Form Instance: {}", formInstanceId);
            } catch (Exception e) {
                log.error("Error saving form data: {}", e.getMessage(), e);
                // Delete the created request and process since form data failed
                requestRepository.delete(request);
                runtimeService.deleteProcessInstance(processInstanceId, "Form data validation failed: " + e.getMessage());
                throw new RuntimeException("Form data validation failed: " + e.getMessage(), e);
            }
        }
        
        log.info("Request created by role: {} with ID: {}", dto.getRole(), request.getRequestId());
        return request;
    }
    
    private Map<Integer, Map<String, Object>> buildLevelMap(List<WorkflowLevel> levels) {
        Map<Integer, Map<String, Object>> levelMap = new HashMap<>();
        for (WorkflowLevel level : levels) {
            Map<String, Object> levelData = new HashMap<>();
            levelData.put("levelName", level.getLevelName());
            levelData.put("role", level.getRole());
            levelData.put("nextLevel", level.getNextLevel());
            levelData.put("queryReturnLevel", level.getQueryReturnLevel());
            levelMap.put(level.getLevelOrder(), levelData);
        }
        return levelMap;
    }
    
    public List<Map<String, Object>> getPendingTasks(String role) {
        List<Task> tasks = taskService.createTaskQuery()
            .taskCandidateGroup(role)
            .list();
        
        // Convert to simple map to avoid serialization issues
        return tasks.stream().map(task -> {
            Map<String, Object> taskMap = new HashMap<>();
            taskMap.put("id", task.getId());
            taskMap.put("name", task.getName());
            taskMap.put("createTime", task.getCreateTime());
            taskMap.put("assignee", task.getAssignee());
            taskMap.put("processInstanceId", task.getProcessInstanceId());
            return taskMap;
        }).collect(java.util.stream.Collectors.toList());
    }
    
    @Transactional
    public void approveTask(ApprovalDecisionDTO dto) {
        Task task = taskService.createTaskQuery().taskId(dto.getTaskId()).singleResult();
        
        if (task == null) {
            log.error("Task not found: {}", dto.getTaskId());
            throw new RuntimeException("Task not found: " + dto.getTaskId());
        }
        
        log.info("Processing task: {} with decision: {}", task.getName(), dto.getDecision());
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("decision", dto.getDecision());
        variables.put("comments", dto.getComments());
        
        log.info("Set decision variable to: {}", dto.getDecision());
        
        // Check if this is a query handling task
        boolean isQueryTask = "Handle Query".equals(task.getName());
        
        if ("RESPOND".equals(dto.getDecision()) || isQueryTask) {
            // Responding to a query - return to the level that raised it
            Integer returnLevel = (Integer) runtimeService
                .getVariable(task.getProcessInstanceId(), "returnLevel");
            Long queryId = (Long) runtimeService
                .getVariable(task.getProcessInstanceId(), "queryId");
            
            // Update query history
            if (queryId != null) {
                QueryHistory query = queryHistoryRepository.findById(queryId)
                    .orElseThrow(() -> new RuntimeException("Query not found"));
                query.setResponseText(dto.getComments());
                query.setStatus("RESOLVED");
                queryHistoryRepository.save(query);
            }
            
            // Return to the level that raised the query
            variables.put("currentLevel", returnLevel);
            variables.put("queryRaised", false);
            
            log.info("Query resolved, returning to Level {}", returnLevel);
        } else if ("APPROVE".equals(dto.getDecision())) {
            Integer currentLevel = (Integer) runtimeService
                .getVariable(task.getProcessInstanceId(), "currentLevel");
            
            Map<Integer, Map<String, Object>> workflowLevels = 
                (Map<Integer, Map<String, Object>>) runtimeService
                    .getVariable(task.getProcessInstanceId(), "workflowLevels");
            
            Integer nextLevel = (Integer) workflowLevels.get(currentLevel).get("nextLevel");
            
            // NEW: Update Form Instance level if it exists
            String formInstanceId = (String) runtimeService
                .getVariable(task.getProcessInstanceId(), "formInstanceId");
            
            if (nextLevel != null && workflowLevels.containsKey(nextLevel)) {
                variables.put("currentLevel", nextLevel);
                variables.put("approved", true);
                
                // NEW: Update Form Instance to next level
                if (formInstanceId != null) {
                    formInstanceService.updateLevel(formInstanceId, nextLevel);
                    log.info("Updated Form Instance {} to level {}", formInstanceId, nextLevel);
                }
            } else {
                variables.put("finalApproval", true);
                
                // NEW: Complete Form Instance and generate Material ID
                if (formInstanceId != null) {
                    String materialId = formInstanceService.completeFormInstance(formInstanceId);
                    variables.put("materialId", materialId);
                    log.info("Completed Form Instance {} with Material ID: {}", formInstanceId, materialId);
                }
            }
        } else if ("REJECT".equals(dto.getDecision())) {
            // Store the level where rejection occurred
            Integer currentLevel = (Integer) runtimeService
                .getVariable(task.getProcessInstanceId(), "currentLevel");
            variables.put("rejectedAtLevel", currentLevel);
            variables.put("approved", false);
            variables.put("queryRaised", false); // Explicitly set to false to avoid query path
            
            // Don't change currentLevel here - let BPMN handle routing
            // The RejectionTask will be created at Level 1 by BPMN
            
            log.info("Request rejected at Level {}, BPMN will route to Level 1 RejectionTask", currentLevel);
            log.info("Setting decision variable to: REJECT");
        } else if ("RESUBMIT".equals(dto.getDecision())) {
            // After Level 1 fixes the issue, resubmit to the level where it was rejected
            Integer rejectedAtLevel = (Integer) runtimeService
                .getVariable(task.getProcessInstanceId(), "rejectedAtLevel");
            
            // Set current level back to the level that rejected
            variables.put("currentLevel", rejectedAtLevel);
            variables.put("rejectionDecision", "RESUBMIT");
            
            log.info("Resubmitting request to Level {} after rejection handling", rejectedAtLevel);
            log.info("Setting rejectionDecision variable to: RESUBMIT");
        } else if ("CANCEL".equals(dto.getDecision())) {
            // Level 1 decides to cancel the request permanently
            variables.put("rejectionDecision", "CANCEL");
            log.info("Request cancelled by Level 1 after rejection");
        }
        
        log.info("Completing task {} with variables: {}", dto.getTaskId(), variables.keySet());
        taskService.complete(dto.getTaskId(), variables);
        log.info("Task completed successfully");
    }
    
    @Transactional
    public QueryHistory raiseQuery(QueryRequestDTO dto) {
        Task task = taskService.createTaskQuery().taskId(dto.getTaskId()).singleResult();
        
        // Get requestId from process variables
        Long requestId = (Long) runtimeService
            .getVariable(task.getProcessInstanceId(), "requestId");
        
        // Get current level from process
        Integer currentLevel = (Integer) runtimeService
            .getVariable(task.getProcessInstanceId(), "currentLevel");
        
        WorkflowRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        QueryHistory query = new QueryHistory();
        query.setRequestId(requestId);
        query.setFromLevel(currentLevel);
        query.setToLevel(dto.getTargetLevel() != null ? dto.getTargetLevel() : 1); // Default to Level 1
        query.setQueryText(dto.getQueryText());
        query.setStatus("PENDING");
        
        query = queryHistoryRepository.save(query);
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("queryRaised", true);
        variables.put("queryTargetLevel", query.getToLevel());
        variables.put("returnLevel", currentLevel); // Store current level to return after query is resolved
        variables.put("queryId", query.getId());
        variables.put("currentLevel", query.getToLevel()); // Route to target level (Level 1)
        
        taskService.complete(dto.getTaskId(), variables);
        
        log.info("Query raised from Level {} to Level {}, will return to Level {} after resolution", 
                 currentLevel, query.getToLevel(), currentLevel);
        
        return query;
    }
    
    @Transactional
    public void resolveQuery(QueryResponseDTO dto) {
        QueryHistory query = queryHistoryRepository.findById(dto.getQueryId())
            .orElseThrow(() -> new RuntimeException("Query not found"));
        
        query.setResponseText(dto.getResponseText());
        query.setStatus("RESOLVED");
        queryHistoryRepository.save(query);
    }
    
    @Transactional
    public void respondToQuery(String taskId, String responseText) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        
        // Get the query ID and return level from process variables
        Long queryId = (Long) runtimeService.getVariable(task.getProcessInstanceId(), "queryId");
        Integer returnLevel = (Integer) runtimeService.getVariable(task.getProcessInstanceId(), "returnLevel");
        
        // Update query history
        if (queryId != null) {
            QueryHistory query = queryHistoryRepository.findById(queryId)
                .orElseThrow(() -> new RuntimeException("Query not found"));
            query.setResponseText(responseText);
            query.setStatus("RESOLVED");
            queryHistoryRepository.save(query);
        }
        
        // Set variables to return to the level that raised the query
        Map<String, Object> variables = new HashMap<>();
        variables.put("currentLevel", returnLevel); // Return to the level that raised the query
        variables.put("queryRaised", false); // Clear the query flag
        
        taskService.complete(taskId, variables);
        
        log.info("Query resolved, returning to Level {}", returnLevel);
    }
    
    public List<QueryHistory> getQueryHistory(Long requestId) {
        return queryHistoryRepository.findByRequestIdOrderByCreatedDateDesc(requestId);
    }
    
    public Map<String, Object> getProcessVariables(String processInstanceId) {
        return runtimeService.getVariables(processInstanceId);
    }
    
    @Transactional
    public WorkflowRequest editRequest(EditRequestDTO dto) {
        // RBAC: All levels can edit requests
        rbacService.validatePermission(dto.getRole(), Permission.EDIT_REQUEST);
        
        WorkflowRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Request not found: " + dto.getRequestId()));
        
        // Update request details
        if (dto.getRequester() != null) {
            request.setRequester(dto.getRequester());
        }
        if (dto.getProductName() != null) {
            request.setProductName(dto.getProductName());
        }
        if (dto.getDescription() != null) {
            request.setDescription(dto.getDescription());
        }
        
        log.info("Request {} edited by role: {}", dto.getRequestId(), dto.getRole());
        return requestRepository.save(request);
    }
    
    public WorkflowRequest getRequest(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));
    }
    
    @Transactional
    public void deleteRequest(Long requestId, String role) {
        // RBAC: Only Final Level can delete requests
        rbacService.validatePermission(role, Permission.DELETE_REQUEST);
        
        WorkflowRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));
        
        // Delete associated process instance if exists
        if (request.getProcessInstanceId() != null) {
            try {
                runtimeService.deleteProcessInstance(request.getProcessInstanceId(), "Deleted by " + role);
            } catch (Exception e) {
                log.warn("Could not delete process instance: {}", e.getMessage());
            }
        }
        
        requestRepository.delete(request);
        log.info("Request {} deleted by role: {}", requestId, role);
    }
    
    public List<WorkflowRequest> getAllRequests(String role) {
        // RBAC: Only Final Level can view all requests
        rbacService.validatePermission(role, Permission.VIEW_ALL_REQUESTS);
        
        return requestRepository.findAll();
    }
}
