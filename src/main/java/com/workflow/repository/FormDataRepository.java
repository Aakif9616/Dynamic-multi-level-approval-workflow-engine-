package com.workflow.repository;

import com.workflow.entity.FormData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormDataRepository extends JpaRepository<FormData, Long> {
    // Primary query method - use Form Instance ID only
    List<FormData> findByFormInstanceId(String formInstanceId);
    
    // Find specific field data for a Form Instance
    Optional<FormData> findByFormInstanceIdAndFieldId(String formInstanceId, Long fieldId);
}
