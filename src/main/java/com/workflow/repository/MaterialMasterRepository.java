package com.workflow.repository;

import com.workflow.entity.MaterialMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MaterialMasterRepository extends JpaRepository<MaterialMaster, Long> {
    Optional<MaterialMaster> findByRequestId(Long requestId);
}
