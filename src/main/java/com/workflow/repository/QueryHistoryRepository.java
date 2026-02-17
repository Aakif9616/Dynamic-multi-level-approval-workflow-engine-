package com.workflow.repository;

import com.workflow.entity.QueryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QueryHistoryRepository extends JpaRepository<QueryHistory, Long> {
    List<QueryHistory> findByRequestIdOrderByCreatedDateDesc(Long requestId);
    List<QueryHistory> findByRequestIdAndStatus(Long requestId, String status);
}
