package com.workflow.service;

import com.workflow.dto.FormDTO;
import com.workflow.dto.FormFieldDTO;
import com.workflow.dto.FormSubmissionDTO;
import com.workflow.entity.*;
import com.workflow.repository.FormDataRepository;
import com.workflow.repository.FormFieldRepository;
import com.workflow.repository.FormRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DynamicFormService {
    
    private final FormRepository formRepository;
    private final FormFieldRepository formFieldRepository;
    private final FormDataRepository formDataRepository;
    
    // ==================== FORM CRUD ====================
    
    public List<FormDTO> getAllForms() {
        return formRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<FormDTO> getActiveForms() {
        return formRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<FormDTO> getFormById(Long id) {
        return formRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    @Transactional
    public FormDTO createForm(FormDTO formDTO) {
        Form form = new Form();
        form.setFormName(formDTO.getFormName());
        form.setDescription(formDTO.getDescription());
        form.setActive(formDTO.getActive() != null ? formDTO.getActive() : true);
        form.setCreatedAt(LocalDateTime.now());
        
        Form savedForm = formRepository.save(form);
        return convertToDTO(savedForm);
    }
    
    @Transactional
    public FormDTO updateForm(Long id, FormDTO formDTO) {
        Form form = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        form.setFormName(formDTO.getFormName());
        form.setDescription(formDTO.getDescription());
        form.setActive(formDTO.getActive());
        form.setUpdatedAt(LocalDateTime.now());
        
        Form savedForm = formRepository.save(form);
        return convertToDTO(savedForm);
    }
    
    @Transactional
    public void deleteForm(Long id) {
        formRepository.deleteById(id);
    }
    
    // ==================== FIELD MANAGEMENT ====================
    
    @Transactional
    public FormFieldDTO addField(Long formId, FormFieldDTO fieldDTO) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        FormField field = new FormField();
        field.setForm(form);
        field.setFieldName(fieldDTO.getFieldName());
        field.setFieldLabel(fieldDTO.getFieldLabel());
        field.setFieldType(fieldDTO.getFieldType());
        field.setFieldOptions(fieldDTO.getFieldOptions());
        field.setDisplayOrder(fieldDTO.getDisplayOrder() != null ? fieldDTO.getDisplayOrder() : 0);
        field.setRequired(fieldDTO.getRequired() != null ? fieldDTO.getRequired() : false);
        field.setPlaceholder(fieldDTO.getPlaceholder());
        field.setHelpText(fieldDTO.getHelpText());
        field.setVisibleAtLevels(fieldDTO.getVisibleAtLevels() != null ? fieldDTO.getVisibleAtLevels() : "1,2,3,4,5,6,7,8,9,10");
        field.setEditableAtLevels(fieldDTO.getEditableAtLevels() != null ? fieldDTO.getEditableAtLevels() : "1");
        field.setActive(fieldDTO.getActive() != null ? fieldDTO.getActive() : true);
        
        FormField savedField = formFieldRepository.save(field);
        return convertFieldToDTO(savedField, null, 1);
    }
    
    @Transactional
    public FormFieldDTO updateField(Long formId, Long fieldId, FormFieldDTO fieldDTO) {
        FormField field = formFieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));
        
        if (!field.getForm().getId().equals(formId)) {
            throw new RuntimeException("Field does not belong to this form");
        }
        
        field.setFieldName(fieldDTO.getFieldName());
        field.setFieldLabel(fieldDTO.getFieldLabel());
        field.setFieldType(fieldDTO.getFieldType());
        field.setFieldOptions(fieldDTO.getFieldOptions());
        field.setDisplayOrder(fieldDTO.getDisplayOrder());
        field.setRequired(fieldDTO.getRequired());
        field.setPlaceholder(fieldDTO.getPlaceholder());
        field.setHelpText(fieldDTO.getHelpText());
        field.setVisibleAtLevels(fieldDTO.getVisibleAtLevels());
        field.setEditableAtLevels(fieldDTO.getEditableAtLevels());
        field.setActive(fieldDTO.getActive());
        
        FormField savedField = formFieldRepository.save(field);
        return convertFieldToDTO(savedField, null, 1);
    }
    
    @Transactional
    public void deleteField(Long formId, Long fieldId) {
        FormField field = formFieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));
        
        if (!field.getForm().getId().equals(formId)) {
            throw new RuntimeException("Field does not belong to this form");
        }
        
        formFieldRepository.delete(field);
    }
    
    @Transactional
    public void reorderFields(Long formId, List<Long> fieldIds) {
        for (int i = 0; i < fieldIds.size(); i++) {
            Long fieldId = fieldIds.get(i);
            FormField field = formFieldRepository.findById(fieldId)
                    .orElseThrow(() -> new RuntimeException("Field not found: " + fieldId));
            
            if (!field.getForm().getId().equals(formId)) {
                throw new RuntimeException("Field does not belong to this form");
            }
            
            field.setDisplayOrder(i);
            formFieldRepository.save(field);
        }
    }
    
    // ==================== FORM RENDERING ====================
    
    public FormDTO renderForm(Long formId, Integer currentLevel, String formInstanceId) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        // Get all active fields for this form
        List<FormField> allFields = formFieldRepository.findByFormIdAndActiveTrueOrderByDisplayOrderAsc(formId);
        
        // Get existing data if formInstanceId provided
        final Map<Long, String> existingData = new HashMap<>();
        if (formInstanceId != null && !formInstanceId.isEmpty()) {
            // Load data by Form Instance ID ONLY
            List<FormData> dataList = formDataRepository.findByFormInstanceId(formInstanceId);
            
            if (!dataList.isEmpty()) {
                existingData.putAll(dataList.stream()
                        .collect(Collectors.toMap(
                                fd -> fd.getField().getId(),
                                FormData::getFieldValue,
                                (v1, v2) -> v2 // Keep latest value
                        )));
                log.info("Loaded {} form data entries for Form Instance: {}", dataList.size(), formInstanceId);
            }
        }
        
        // Filter fields based on level visibility
        List<FormFieldDTO> visibleFields = allFields.stream()
                .filter(field -> isVisibleAtLevel(field, currentLevel))
                .map(field -> convertFieldToDTO(field, existingData.get(field.getId()), currentLevel))
                .collect(Collectors.toList());
        
        FormDTO formDTO = convertToDTO(form);
        formDTO.setFields(visibleFields);
        
        return formDTO;
    }
    
    // ==================== FORM SUBMISSION ====================
    
    @Transactional
    public void submitFormData(FormSubmissionDTO submission) {
        Form form = formRepository.findById(submission.getFormId())
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        log.info("Submitting form data for Form Instance: {}, level: {}, fields: {}", 
                submission.getFormInstanceId(), submission.getCurrentLevel(), submission.getFieldValues().keySet());
        
        // Validate and save each field
        for (Map.Entry<Long, String> entry : submission.getFieldValues().entrySet()) {
            Long fieldId = entry.getKey();
            String value = entry.getValue();
            
            log.info("Processing field ID: {}, value: {}", fieldId, value);
            
            FormField field = formFieldRepository.findById(fieldId)
                    .orElseThrow(() -> new RuntimeException("Field not found: " + fieldId));
            
            log.info("Field '{}' - visible at: {}, editable at: {}", 
                    field.getFieldLabel(), field.getVisibleAtLevels(), field.getEditableAtLevels());
            
            // Check if field is editable at current level
            if (!isEditableAtLevel(field, submission.getCurrentLevel())) {
                String errorMsg = String.format("Field '%s' is not editable at level %d. Editable at levels: %s", 
                        field.getFieldLabel(), submission.getCurrentLevel(), field.getEditableAtLevels());
                log.error(errorMsg);
                throw new RuntimeException(errorMsg);
            }
            
            // Validate required fields
            if (field.getRequired() && (value == null || value.trim().isEmpty())) {
                String errorMsg = String.format("Field '%s' is required", field.getFieldLabel());
                log.error(errorMsg);
                throw new RuntimeException(errorMsg);
            }
            
            // Save or update form data - USE FORM INSTANCE ID ONLY
            Optional<FormData> existingData = formDataRepository.findByFormInstanceIdAndFieldId(
                    submission.getFormInstanceId(), fieldId);
            
            FormData formData;
            if (existingData.isPresent()) {
                formData = existingData.get();
                formData.setFieldValue(value);
                formData.setUpdatedAt(LocalDateTime.now());
                log.info("Updated existing form data for field: {}", field.getFieldLabel());
            } else {
                formData = new FormData();
                formData.setFormInstanceId(submission.getFormInstanceId()); // ONLY Form Instance ID
                formData.setForm(form);
                formData.setField(field);
                formData.setFieldValue(value);
                formData.setEnteredAtLevel(submission.getCurrentLevel());
                formData.setEnteredBy(submission.getUserRole());
                formData.setEnteredAt(LocalDateTime.now());
                log.info("Created new form data for field: {}", field.getFieldLabel());
            }
            
            formDataRepository.save(formData);
        }
        
        log.info("Form data submission completed successfully for Form Instance: {}", submission.getFormInstanceId());
    }
    
    // ==================== HELPER METHODS ====================
    
    private boolean isVisibleAtLevel(FormField field, Integer level) {
        String visibleLevels = field.getVisibleAtLevels();
        if (visibleLevels == null || visibleLevels.isEmpty()) {
            return true;
        }
        
        String[] levels = visibleLevels.split(",");
        return Arrays.asList(levels).contains(String.valueOf(level));
    }
    
    private boolean isEditableAtLevel(FormField field, Integer level) {
        String editableLevels = field.getEditableAtLevels();
        if (editableLevels == null || editableLevels.isEmpty()) {
            return false;
        }
        
        String[] levels = editableLevels.split(",");
        return Arrays.asList(levels).contains(String.valueOf(level));
    }
    
    private FormDTO convertToDTO(Form form) {
        FormDTO dto = new FormDTO();
        dto.setId(form.getId());
        dto.setFormName(form.getFormName());
        dto.setDescription(form.getDescription());
        dto.setActive(form.getActive());
        
        if (form.getFields() != null && !form.getFields().isEmpty()) {
            dto.setFields(form.getFields().stream()
                    .filter(FormField::getActive)
                    .sorted(Comparator.comparing(FormField::getDisplayOrder))
                    .map(field -> convertFieldToDTO(field, null, 1))
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    private FormFieldDTO convertFieldToDTO(FormField field, String currentValue, Integer currentLevel) {
        FormFieldDTO dto = new FormFieldDTO();
        dto.setId(field.getId());
        dto.setFieldName(field.getFieldName());
        dto.setFieldLabel(field.getFieldLabel());
        dto.setFieldType(field.getFieldType());
        dto.setFieldOptions(field.getFieldOptions());
        dto.setDisplayOrder(field.getDisplayOrder());
        dto.setRequired(field.getRequired());
        dto.setPlaceholder(field.getPlaceholder());
        dto.setHelpText(field.getHelpText());
        dto.setVisibleAtLevels(field.getVisibleAtLevels());
        dto.setEditableAtLevels(field.getEditableAtLevels());
        dto.setActive(field.getActive());
        dto.setCurrentValue(currentValue);
        dto.setIsEditable(isEditableAtLevel(field, currentLevel));
        
        return dto;
    }
}
