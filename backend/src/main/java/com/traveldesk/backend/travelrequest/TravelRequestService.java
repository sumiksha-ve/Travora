package com.traveldesk.backend.travelrequest;

import com.traveldesk.backend.employee.Employee;
import com.traveldesk.backend.employee.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TravelRequestService {

    private final TravelRequestRepository travelRequestRepository;
    private final EmployeeRepository employeeRepository;

    public TravelRequestService(
            TravelRequestRepository travelRequestRepository,
            EmployeeRepository employeeRepository
    ) {
        this.travelRequestRepository = travelRequestRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<TravelRequest> getAllTravelRequests() {
        return travelRequestRepository.findAll();
    }

    public TravelRequest getTravelRequestById(Long id) {
        return travelRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Travel request not found"
                ));
    }

    public TravelRequest createTravelRequest(TravelRequest travelRequest) {

        if (travelRequest.getEmployee() == null
                || travelRequest.getEmployee().getId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee ID is required"
            );
        }

        Employee employee = employeeRepository
                .findById(travelRequest.getEmployee().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        travelRequest.setEmployee(employee);
        travelRequest.setStatus(TravelRequestStatus.PENDING);

        return travelRequestRepository.save(travelRequest);
    }

    public TravelRequest approveTravelRequest(
            Long id,
            ApprovalDecision decision
    ) {
        return makeDecision(
                id,
                decision,
                TravelRequestStatus.APPROVED
        );
    }

    public TravelRequest rejectTravelRequest(
            Long id,
            ApprovalDecision decision
    ) {
        return makeDecision(
                id,
                decision,
                TravelRequestStatus.REJECTED
        );
    }

    private TravelRequest makeDecision(
            Long id,
            ApprovalDecision decision,
            TravelRequestStatus newStatus
    ) {

        TravelRequest travelRequest = travelRequestRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Travel request not found"
                ));

        if (travelRequest.getStatus() != TravelRequestStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending requests can be approved or rejected"
            );
        }

        travelRequest.setStatus(newStatus);
        travelRequest.setApproverName(decision.getApproverName());
        travelRequest.setApprovalComment(decision.getComment());
        travelRequest.setApprovalDate(LocalDateTime.now());

        return travelRequestRepository.save(travelRequest);
    }
}