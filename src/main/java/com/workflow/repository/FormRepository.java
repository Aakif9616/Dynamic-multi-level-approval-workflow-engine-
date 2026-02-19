package com.workflow.repository;

import com.workflow.entity.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    List<Form> findByActiveTrue();
    Optional<Form> findByFormName(String formName);
}
