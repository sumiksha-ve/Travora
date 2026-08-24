package com.traveldesk.backend.travelrequest;

import com.traveldesk.backend.employee.Employee;
import com.traveldesk.backend.employee.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/travel-requests")
public class TravelRequestController {

    private final TravelRequestRepository travelRequestRepository;
    private final EmployeeRepository employeeRepository;

    public TravelRequestController(
            TravelRequestRepository travelRequestRepository,
            EmployeeRepository employeeRepository
    ) {
        this.travelRequestRepository = travelRequestRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    public List<TravelRequest> getAllTravelRequests() {
        return travelRequestRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TravelRequest createTravelRequest(
            @RequestBody TravelRequest travelRequest
    ) {
        Long employeeId = travelRequest.getEmployee().getId();

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        travelRequest.setEmployee(employee);
        travelRequest.setStatus(TravelRequestStatus.PENDING);

        return travelRequestRepository.save(travelRequest);
    }
}