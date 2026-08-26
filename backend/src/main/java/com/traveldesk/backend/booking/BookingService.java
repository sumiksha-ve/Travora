package com.traveldesk.backend.booking;

import com.traveldesk.backend.travelrequest.TravelRequest;
import com.traveldesk.backend.travelrequest.TravelRequestRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TravelRequestRepository travelRequestRepository;

    public BookingService(
            BookingRepository bookingRepository,
            TravelRequestRepository travelRequestRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.travelRequestRepository = travelRequestRepository;
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

        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, Booking updatedBooking) {

        Booking existingBooking = getBookingById(id);

        existingBooking.setTravelRequest(updatedBooking.getTravelRequest());
        existingBooking.setBookingType(updatedBooking.getBookingType());
        existingBooking.setBookingReference(updatedBooking.getBookingReference());
        existingBooking.setProvider(updatedBooking.getProvider());
        existingBooking.setCost(updatedBooking.getCost());
        existingBooking.setSavings(updatedBooking.getSavings());
        existingBooking.setNotes(updatedBooking.getNotes());

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

        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }
}