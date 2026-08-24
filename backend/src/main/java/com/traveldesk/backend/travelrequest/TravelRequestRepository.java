package com.traveldesk.backend.travelrequest;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelRequestRepository extends JpaRepository<TravelRequest, Long> {

    List<TravelRequest> findByEmployee_Id(Long employeeId);
}