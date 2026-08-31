package com.traveldesk.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public User register(@RequestBody User user) {

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists"
            );
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid username or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
            );
        }

        if (!user.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User account is inactive"
            );
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getEmployeeId()
        );
    }

    // =========================
    // ASSIGN EMPLOYEE TO USER
    // ADMIN ONLY
    // =========================

    @PutMapping("/users/{userId}/employee")
    @PreAuthorize("hasRole('ADMIN')")
    public User assignEmployee(
            @PathVariable Long userId,
            @RequestBody EmployeeAssignmentRequest request
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        user.setEmployeeId(request.getEmployeeId());

        return userRepository.save(user);
    }

    // =========================
    // RESET PASSWORD
    // ADMIN ONLY
    // =========================

    @PutMapping("/reset-password/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public String resetPassword(
            @PathVariable String username,
            @RequestBody PasswordResetRequest request
    ) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        return "Password reset successfully";
    }

    // =========================
    // LOGIN REQUEST
    // =========================

    public static class LoginRequest {

        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    // =========================
    // EMPLOYEE ASSIGNMENT REQUEST
    // =========================

    public static class EmployeeAssignmentRequest {

        private String employeeId;

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }
    }

    // =========================
    // PASSWORD RESET REQUEST
    // =========================

    public static class PasswordResetRequest {

        private String newPassword;

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    // =========================
    // LOGIN RESPONSE
    // =========================

    public static class LoginResponse {

        private String token;
        private Long id;
        private String username;
        private Role role;
        private String employeeId;

        public LoginResponse(
                String token,
                Long id,
                String username,
                Role role,
                String employeeId
        ) {
            this.token = token;
            this.id = id;
            this.username = username;
            this.role = role;
            this.employeeId = employeeId;
        }

        public String getToken() {
            return token;
        }

        public Long getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public Role getRole() {
            return role;
        }

        public String getEmployeeId() {
            return employeeId;
        }
    }
}
