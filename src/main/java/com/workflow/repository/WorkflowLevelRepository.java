package com.workflow.repository;

import com.workflow.entity.WorkflowLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowLevelRepository extends JpaRepository<WorkflowLevel, Long> {
    List<WorkflowLevel> findByEnabledTrueOrderByLevelOrderAsc();
    Optional<WorkflowLevel> findByLevelOrder(Integer levelOrder);
}
