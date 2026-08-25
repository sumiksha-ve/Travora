package com.traveldesk.backend.travelrequest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/travel-requests")
public class TravelRequestController {

    private final TravelRequestService travelRequestService;

    public TravelRequestController(
            TravelRequestService travelRequestService
    ) {
        this.travelRequestService = travelRequestService;
    }

    @GetMapping
    public List<TravelRequest> getAllTravelRequests() {
        return travelRequestService.getAllTravelRequests();
    }

    @GetMapping("/{id}")
    public TravelRequest getTravelRequestById(
            @PathVariable Long id
    ) {
        return travelRequestService.getTravelRequestById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TravelRequest createTravelRequest(
            @RequestBody TravelRequest travelRequest
    ) {
        return travelRequestService.createTravelRequest(travelRequest);
    }

    @PatchMapping("/{id}/approve")
    public TravelRequest approveTravelRequest(
            @PathVariable Long id,
            @RequestBody ApprovalDecision decision
    ) {
        return travelRequestService.approveTravelRequest(
                id,
                decision
        );
    }

    @PatchMapping("/{id}/reject")
    public TravelRequest rejectTravelRequest(
            @PathVariable Long id,
            @RequestBody ApprovalDecision decision
    ) {
        return travelRequestService.rejectTravelRequest(
                id,
                decision
        );
    }
}