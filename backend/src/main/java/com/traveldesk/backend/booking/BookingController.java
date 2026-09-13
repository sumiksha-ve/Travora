package com.traveldesk.backend.booking;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/travel-request/{travelRequestId}")
    public ResponseEntity<List<Booking>> getBookingsByTravelRequest(
            @PathVariable Long travelRequestId) {
        return ResponseEntity.ok(
                bookingService.getBookingsByTravelRequest(travelRequestId)
        );
    }

    @GetMapping("/cancelled/{cancelled}")
    public ResponseEntity<List<Booking>> getBookingsByCancelledStatus(
            @PathVariable boolean cancelled) {
        return ResponseEntity.ok(
                bookingService.getBookingsByCancelledStatus(cancelled)
        );
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        return ResponseEntity.ok(bookingService.createBooking(booking));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable Long id,
            @RequestBody Booking booking) {
        return ResponseEntity.ok(
                bookingService.updateBooking(id, booking)
        );
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestParam(defaultValue = "0") BigDecimal cancellationCharge) {

        return ResponseEntity.ok(
                bookingService.cancelBooking(
                        id,
                        reason,
                        cancellationCharge
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}