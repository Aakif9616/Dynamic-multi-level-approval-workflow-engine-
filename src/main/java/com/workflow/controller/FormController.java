package com.workflow.controller;

import com.workflow.dto.FormDTO;
import com.workflow.dto.FormFieldDTO;
import com.workflow.dto.FormSubmissionDTO;
import com.workflow.service.DynamicFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {
    
    private final DynamicFormService formService;
    
    // ==================== FORM CRUD ====================
    
    @GetMapping
    public ResponseEntity<List<FormDTO>> getAllForms() {
        return ResponseEntity.ok(formService.getAllForms());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<FormDTO>> getActiveForms() {
        return ResponseEntity.ok(formService.getActiveForms());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FormDTO> getFormById(@PathVariable Long id) {
        return formService.getFormById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<FormDTO> createForm(@RequestBody FormDTO formDTO) {
        FormDTO created = formService.createForm(formDTO);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FormDTO> updateForm(@PathVariable Long id, @RequestBody FormDTO formDTO) {
        FormDTO updated = formService.updateForm(id, formDTO);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable Long id) {
        formService.deleteForm(id);
        return ResponseEntity.ok().build();
    }
    
    // ==================== FIELD MANAGEMENT ====================
    
    @PostMapping("/{formId}/fields")
    public ResponseEntity<FormFieldDTO> addField(
            @PathVariable Long formId,
            @RequestBody FormFieldDTO fieldDTO) {
        FormFieldDTO created = formService.addField(formId, fieldDTO);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/{formId}/fields/{fieldId}")
    public ResponseEntity<FormFieldDTO> updateField(
            @PathVariable Long formId,
            @PathVariable Long fieldId,
            @RequestBody FormFieldDTO fieldDTO) {
        FormFieldDTO updated = formService.updateField(formId, fieldId, fieldDTO);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{formId}/fields/{fieldId}")
    public ResponseEntity<Void> deleteField(
            @PathVariable Long formId,
            @PathVariable Long fieldId) {
        formService.deleteField(formId, fieldId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{formId}/fields/reorder")
    public ResponseEntity<Void> reorderFields(
            @PathVariable Long formId,
            @RequestBody List<Long> fieldIds) {
        formService.reorderFields(formId, fieldIds);
        return ResponseEntity.ok().build();
    }
    
    // ==================== FORM RENDERING ====================
    
    @GetMapping("/{id}/render")
    public ResponseEntity<FormDTO> renderForm(
            @PathVariable Long id,
            @RequestParam Integer level,
            @RequestParam(required = false) String processInstanceId) {
        FormDTO form = formService.renderForm(id, level, processInstanceId);
        return ResponseEntity.ok(form);
    }
    
    // ==================== FORM SUBMISSION ====================
    
    @PostMapping("/submit")
    public ResponseEntity<Map<String, String>> submitForm(@RequestBody FormSubmissionDTO submission) {
        try {
            formService.submitFormData(submission);
            return ResponseEntity.ok(Map.of("message", "Form data saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
