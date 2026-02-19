package com.workflow.repository;

import com.workflow.entity.FormInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormInstanceRepository extends JpaRepository<FormInstance, Long> {
    
    Optional<FormInstance> findByFormInstanceId(String formInstanceId);
    
    Optional<FormInstance> findByProcessInstanceId(String processInstanceId);
    
    Optional<FormInstance> findByRequestId(Long requestId);
}
