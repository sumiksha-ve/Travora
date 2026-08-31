package com.traveldesk.backend.travelrequest;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelRequestRepository
        extends JpaRepository<TravelRequest, Long> {

    List<TravelRequest> findByStatus(
            TravelRequestStatus status
    );

    List<TravelRequest> findByEmployeeId(
            Long employeeId
    );

    List<TravelRequest> findByEmployeeIdAndStatus(
            Long employeeId,
            TravelRequestStatus status
    );
}