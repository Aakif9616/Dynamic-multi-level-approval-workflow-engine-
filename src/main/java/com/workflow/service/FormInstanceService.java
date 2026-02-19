package com.workflow.service;

import com.workflow.entity.FormInstance;
import com.workflow.repository.FormInstanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class FormInstanceService {
    
    private final FormInstanceRepository formInstanceRepository;
    
    /**
     * Generate unique Form Instance ID
     * Format: FI-YYYYMMDD-NNNN
     * Example: FI-20240218-0001
     */
    private String generateFormInstanceId() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        // Get count of form instances created today
        long count = formInstanceRepository.count() + 1;
        
        return String.format("FI-%s-%04d", datePrefix, count);
    }
    
    /**
     * Create a new Form Instance
     */
    @Transactional
    public FormInstance createFormInstance(Long formId, String processInstanceId, Long requestId, String createdBy) {
        FormInstance formInstance = new FormInstance();
        formInstance.setFormInstanceId(generateFormInstanceId());
        formInstance.setFormId(formId);
        formInstance.setProcessInstanceId(processInstanceId);
        formInstance.setRequestId(requestId);
        formInstance.setStatus("IN_PROGRESS");
        formInstance.setCurrentLevel(1);
        formInstance.setCreatedBy(createdBy);
        formInstance.setCreatedAt(LocalDateTime.now());
        
        FormInstance saved = formInstanceRepository.save(formInstance);
        log.info("Created Form Instance: {} for Form ID: {}", saved.getFormInstanceId(), formId);
        
        return saved;
    }
    
    /**
     * Update Form Instance level
     */
    @Transactional
    public void updateLevel(String formInstanceId, Integer newLevel) {
        FormInstance formInstance = formInstanceRepository.findByFormInstanceId(formInstanceId)
                .orElseThrow(() -> new RuntimeException("Form Instance not found: " + formInstanceId));
        
        formInstance.setCurrentLevel(newLevel);
        formInstanceRepository.save(formInstance);
        
        log.info("Updated Form Instance {} to level {}", formInstanceId, newLevel);
    }
    
    /**
     * Complete Form Instance and generate Material ID
     */
    @Transactional
    public String completeFormInstance(String formInstanceId) {
        FormInstance formInstance = formInstanceRepository.findByFormInstanceId(formInstanceId)
                .orElseThrow(() -> new RuntimeException("Form Instance not found: " + formInstanceId));
        
        // Generate Material ID from Form Instance ID
        String materialId = generateMaterialId(formInstanceId);
        
        formInstance.setMaterialId(materialId);
        formInstance.setStatus("COMPLETED");
        formInstance.setCompletedAt(LocalDateTime.now());
        
        formInstanceRepository.save(formInstance);
        
        log.info("Completed Form Instance: {} with Material ID: {}", formInstanceId, materialId);
        
        return materialId;
    }
    
    /**
     * Generate Material ID from Form Instance ID
     * Format: MAT-FI-YYYYMMDD-NNNN
     * Example: MAT-FI-20240218-0001
     */
    private String generateMaterialId(String formInstanceId) {
        return "MAT-" + formInstanceId;
    }
    
    /**
     * Reject Form Instance
     */
    @Transactional
    public void rejectFormInstance(String formInstanceId) {
        FormInstance formInstance = formInstanceRepository.findByFormInstanceId(formInstanceId)
                .orElseThrow(() -> new RuntimeException("Form Instance not found: " + formInstanceId));
        
        formInstance.setStatus("REJECTED");
        formInstance.setCompletedAt(LocalDateTime.now());
        
        formInstanceRepository.save(formInstance);
        
        log.info("Rejected Form Instance: {}", formInstanceId);
    }
    
    /**
     * Get Form Instance by Process Instance ID
     */
    public FormInstance getByProcessInstanceId(String processInstanceId) {
        return formInstanceRepository.findByProcessInstanceId(processInstanceId)
                .orElseThrow(() -> new RuntimeException("Form Instance not found for process: " + processInstanceId));
    }
    
    /**
     * Get Form Instance by Form Instance ID
     */
    public FormInstance getByFormInstanceId(String formInstanceId) {
        return formInstanceRepository.findByFormInstanceId(formInstanceId)
                .orElseThrow(() -> new RuntimeException("Form Instance not found: " + formInstanceId));
    }
}
