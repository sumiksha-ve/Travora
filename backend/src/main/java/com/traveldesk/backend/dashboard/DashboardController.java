package com.traveldesk.backend.dashboard;

import com.traveldesk.backend.booking.Booking;
import com.traveldesk.backend.booking.BookingService;
import com.traveldesk.backend.travelrequest.TravelRequest;
import com.traveldesk.backend.travelrequest.TravelRequestRepository;
import com.traveldesk.backend.travelrequest.TravelRequestStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final TravelRequestRepository travelRequestRepository;
    private final BookingService bookingService;

    public DashboardController(
            TravelRequestRepository travelRequestRepository,
            BookingService bookingService) {

        this.travelRequestRepository = travelRequestRepository;
        this.bookingService = bookingService;
    }

    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary() {

        List<TravelRequest> allRequests =
                travelRequestRepository.findAll();

        List<Booking> allBookings =
                bookingService.getAllBookings();

        long pending = travelRequestRepository
                .findByStatus(TravelRequestStatus.PENDING)
                .size();

        long approved = travelRequestRepository
                .findByStatus(TravelRequestStatus.APPROVED)
                .size();

        long rejected = travelRequestRepository
                .findByStatus(TravelRequestStatus.REJECTED)
                .size();

        Map<String, Object> summary = new HashMap<>();

        summary.put("totalTravelRequests", allRequests.size());
        summary.put("pendingRequests", pending);
        summary.put("approvedRequests", approved);
        summary.put("rejectedRequests", rejected);
        summary.put("totalBookings", allBookings.size());

        return summary;
    }
}