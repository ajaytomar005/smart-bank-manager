package com.smartbank.manager.employee;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("SELECT e FROM Employee e JOIN FETCH e.role WHERE e.email = :email")
    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT e FROM Employee e JOIN FETCH e.role ORDER BY e.name")
    List<Employee> findAllWithRole();
}
