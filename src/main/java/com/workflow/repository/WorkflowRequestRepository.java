package com.workflow.repository;

import com.workflow.entity.WorkflowRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowRequestRepository extends JpaRepository<WorkflowRequest, Long> {
    List<WorkflowRequest> findByStatus(String status);
    List<WorkflowRequest> findByCurrentLevel(Integer currentLevel);
}
