package com.workflow.repository;

import com.workflow.entity.FormData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormDataRepository extends JpaRepository<FormData, Long> {
    List<FormData> findByProcessInstanceId(String processInstanceId);
    Optional<FormData> findByProcessInstanceIdAndFieldId(String processInstanceId, Long fieldId);
}
