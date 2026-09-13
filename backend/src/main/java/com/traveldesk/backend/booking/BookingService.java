package com.traveldesk.backend.booking;

import com.traveldesk.backend.travelrequest.TravelRequest;
import com.traveldesk.backend.travelrequest.TravelRequestRepository;
import com.traveldesk.backend.notification.NotificationService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TravelRequestRepository travelRequestRepository;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            TravelRequestRepository travelRequestRepository,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.travelRequestRepository = travelRequestRepository;
        this.notificationService = notificationService;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getBookingsByTravelRequest(Long travelRequestId) {
        return bookingRepository.findByTravelRequestId(travelRequestId);
    }

    public List<Booking> getBookingsByCancelledStatus(boolean cancelled) {
        return bookingRepository.findByCancelled(cancelled);
    }

    public Booking createBooking(Booking booking) {

        if (booking.getTravelRequest() == null
                || booking.getTravelRequest().getId() == null) {
            throw new IllegalArgumentException(
                    "Travel request ID is required"
            );
        }

        TravelRequest travelRequest = travelRequestRepository
                .findById(booking.getTravelRequest().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Travel request not found"
                ));

        if (travelRequest.getStatus() != null
                && !travelRequest.getStatus().name().equals("APPROVED")) {
            throw new IllegalArgumentException(
                    "Only approved travel requests can be booked"
            );
        }

        booking.setTravelRequest(travelRequest);

        if (booking.getCost() == null) {
            booking.setCost(BigDecimal.ZERO);
        }

        if (booking.getSavings() == null) {
            booking.setSavings(BigDecimal.ZERO);
        }

        Booking saved = bookingRepository.save(booking);
        notificationService.bookingCreated(saved);
        return saved;
    }

    public Booking updateBooking(Long id, Booking updatedBooking) {

        Booking existingBooking = getBookingById(id);

        /*
         * Do NOT replace the existing travel request with null.
         * The database requires travel_request_id to be NOT NULL.
         *
         * If a travel request is provided in the update request,
         * validate it and update it.
         * Otherwise, keep the existing travel request.
         */
        if (updatedBooking.getTravelRequest() != null
                && updatedBooking.getTravelRequest().getId() != null) {

            TravelRequest travelRequest = travelRequestRepository
                    .findById(updatedBooking.getTravelRequest().getId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Travel request not found"
                    ));

            if (travelRequest.getStatus() != null
                    && !travelRequest.getStatus().name().equals("APPROVED")) {
                throw new IllegalArgumentException(
                        "Only approved travel requests can be linked to a booking"
                );
            }

            existingBooking.setTravelRequest(travelRequest);
        }

        if (updatedBooking.getBookingType() != null) {
            existingBooking.setBookingType(updatedBooking.getBookingType());
        }

        if (updatedBooking.getBookingReference() != null) {
            existingBooking.setBookingReference(
                    updatedBooking.getBookingReference()
            );
        }

        if (updatedBooking.getProvider() != null) {
            existingBooking.setProvider(updatedBooking.getProvider());
        }

        if (updatedBooking.getCost() != null) {
            existingBooking.setCost(updatedBooking.getCost());
        }

        if (updatedBooking.getSavings() != null) {
            existingBooking.setSavings(updatedBooking.getSavings());
        }

        if (updatedBooking.getNotes() != null) {
            existingBooking.setNotes(updatedBooking.getNotes());
        }

        return bookingRepository.save(existingBooking);
    }

    public Booking cancelBooking(
            Long id,
            String reason,
            BigDecimal cancellationCharge
    ) {
        Booking booking = getBookingById(id);

        booking.setCancelled(true);
        booking.setCancellationReason(reason);
        booking.setCancellationCharge(cancellationCharge);

        Booking saved = bookingRepository.save(booking);
        notificationService.bookingCancelled(saved);
        return saved;
    }

    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }
}