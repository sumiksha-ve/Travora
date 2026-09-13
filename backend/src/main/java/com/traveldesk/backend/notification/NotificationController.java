package com.traveldesk.backend.notification;

import com.traveldesk.backend.auth.User;
import com.traveldesk.backend.auth.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    private final UserRepository userRepository;
    public NotificationController(NotificationService service, UserRepository userRepository) { this.service = service; this.userRepository = userRepository; }
    @GetMapping public List<Notification> list() { return service.list(currentUser()); }
    @GetMapping("/unread-count") public long unreadCount() { return service.unreadCount(currentUser()); }
    @PatchMapping("/{id}/read") @ResponseStatus(HttpStatus.NO_CONTENT) public void markRead(@PathVariable Long id) { service.markRead(id, currentUser()); }
    @PatchMapping("/read-all") @ResponseStatus(HttpStatus.NO_CONTENT) public void markAllRead() { service.markAllRead(currentUser()); }
    private User currentUser() { Authentication auth = SecurityContextHolder.getContext().getAuthentication(); if (auth == null || !auth.isAuthenticated()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated"); return userRepository.findByUsername(auth.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")); }
}
