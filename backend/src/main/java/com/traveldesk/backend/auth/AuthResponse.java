package com.traveldesk.backend.auth;

public class AuthResponse {

    private String username;
    private Role role;
    private String message;

    public AuthResponse(
            String username,
            Role role,
            String message
    ) {
        this.username = username;
        this.role = role;
        this.message = message;
    }

    public String getUsername() {
        return username;
    }

    public Role getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}