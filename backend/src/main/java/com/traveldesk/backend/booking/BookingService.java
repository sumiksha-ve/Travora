package com.traveldesk.backend.booking;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
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
        existingBooking.setBookedAt(updatedBooking.getBookedAt());

        return bookingRepository.save(existingBooking);
    }

    public Booking cancelBooking(Long id, String reason, java.math.BigDecimal cancellationCharge) {
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