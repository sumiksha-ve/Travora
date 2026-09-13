package com.traveldesk.backend.notification;

import com.traveldesk.backend.auth.Role;
import com.traveldesk.backend.auth.User;
import com.traveldesk.backend.auth.UserRepository;
import com.traveldesk.backend.booking.Booking;
import com.traveldesk.backend.employee.Employee;
import com.traveldesk.backend.travelrequest.TravelRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationRepository repository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository repository, UserRepository userRepository) { this.repository = repository; this.userRepository = userRepository; }
    public List<Notification> list(User user) { return repository.findByRecipientOrderByCreatedAtDesc(user); }
    public long unreadCount(User user) { return repository.countByRecipientAndReadFalse(user); }
    public void markRead(Long id, User user) { Notification n = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Notification not found")); if (!n.getRecipient().getId().equals(user.getId())) throw new SecurityException("You can only update your own notifications"); n.setRead(true); repository.save(n); }
    public void markAllRead(User user) { List<Notification> notifications = repository.findByRecipientOrderByCreatedAtDesc(user); notifications.forEach(n -> n.setRead(true)); repository.saveAll(notifications); }

    public void requestSubmitted(TravelRequest request) {
        notifySafely(userForEmployee(request.getEmployee()), "Travel request submitted", "Your request to " + request.getToLocation() + " was submitted for approval.", NotificationType.REQUEST_SUBMITTED, request.getId(), null);
        userRepository.findAll().stream().filter(user -> user.getRole() == Role.APPROVER).forEach(approver -> notifySafely(approver, "Travel request needs review", "A new request to " + request.getToLocation() + " is waiting for your review.", NotificationType.REQUEST_SUBMITTED, request.getId(), null));
    }
    public void requestDecision(TravelRequest request, boolean approved) {
        User employee = userForEmployee(request.getEmployee());
        notifySafely(employee, approved ? "Travel request approved" : "Travel request rejected", approved ? "Your request to " + request.getToLocation() + " was approved and is ready for booking." : "Your request to " + request.getToLocation() + " was rejected.", approved ? NotificationType.REQUEST_APPROVED : NotificationType.REQUEST_REJECTED, request.getId(), null);
        if (approved) userRepository.findAll().stream().filter(user -> user.getRole() == Role.TRAVEL_DESK).forEach(desk -> notifySafely(desk, "Approved trip ready to book", "The request to " + request.getToLocation() + " is ready for booking.", NotificationType.REQUEST_APPROVED, request.getId(), null));
    }
    public void bookingCreated(Booking booking) { notifySafely(userForEmployee(booking.getTravelRequest().getEmployee()), "Trip booked", "Your " + booking.getBookingType() + " booking " + booking.getBookingReference() + " is confirmed.", NotificationType.BOOKING_CREATED, booking.getTravelRequest().getId(), booking.getId()); }
    public void bookingCancelled(Booking booking) { notifySafely(userForEmployee(booking.getTravelRequest().getEmployee()), "Booking cancelled", "Your booking " + booking.getBookingReference() + " was cancelled.", NotificationType.BOOKING_CANCELLED, booking.getTravelRequest().getId(), booking.getId()); }

    private User userForEmployee(Employee employee) { return userRepository.findByEmployeeId(employee.getEmployeeId()).orElseThrow(() -> new IllegalArgumentException("No user linked to employee")); }
    private void notifySafely(User recipient, String title, String message, NotificationType type, Long requestId, Long bookingId) { try { Notification n = new Notification(); n.setRecipient(recipient); n.setTitle(title); n.setMessage(message); n.setType(type); n.setTravelRequestId(requestId); n.setBookingId(bookingId); repository.save(n); } catch (RuntimeException e) { log.error("Unable to persist Travora notification for recipient {}", recipient != null ? recipient.getUsername() : "unknown", e); } }
}
