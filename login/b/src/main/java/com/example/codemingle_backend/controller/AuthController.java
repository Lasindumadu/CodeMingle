package com.example.codemingle_backend.controller;

import com.example.codemingle_backend.model.User;
import com.example.codemingle_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Demo login endpoint (preserves existing demo functionality)
    @PostMapping("/demo-login")
    public ResponseEntity<?> demoLogin(@RequestBody Map<String, String> loginRequest) {
        String accountType = loginRequest.get("accountType");

        Map<String, Object> response = new HashMap<>();

        if ("admin".equals(accountType)) {
            response.put("username", "admin");
            response.put("role", "ADMIN");
            response.put("message", "Demo admin login successful");
        } else if ("user".equals(accountType)) {
            response.put("username", "user");
            response.put("role", "USER");
            response.put("message", "Demo user login successful");
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid demo account type"));
        }

        // Generate demo token (simple base64 encoded payload)
        String demoToken = java.util.Base64.getEncoder().encodeToString(
            ("{\"username\":\"" + response.get("username") + "\",\"role\":\"" + response.get("role") +
             "\",\"type\":\"demo\",\"exp\":" + (System.currentTimeMillis() + 86400000) + "}").getBytes()
        );
        response.put("token", demoToken);

        return ResponseEntity.ok(response);
    }

    // Real user login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(username).orElseThrow();

            // Generate JWT token (simplified for demo - in production use proper JWT library)
            String token = generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("email", user.getEmail());
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid username or password"));
        }
    }

    // Real user registration endpoint
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> registerRequest) {
        String username = registerRequest.get("username");
        String email = registerRequest.get("email");
        String password = registerRequest.get("password");
        String firstName = registerRequest.get("firstName");
        String lastName = registerRequest.get("lastName");

        // Validate required fields
        if (username == null || email == null || password == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Username, email, and password are required"));
        }

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Username already exists"));
        }

        Optional<User> existingEmail = userRepository.findByEmail(email);
        if (existingEmail.isPresent()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Email already exists"));
        }

        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setCreatedAt(LocalDateTime.now());
        user.setRole("USER"); // Default role for new registrations

        User savedUser = userRepository.save(user);

        // Generate token for new user
        String token = generateToken(savedUser);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", savedUser.getUsername());
        response.put("role", savedUser.getRole());
        response.put("email", savedUser.getEmail());
        response.put("message", "Registration successful");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Helper method to generate simple token (in production, use proper JWT library)
    private String generateToken(User user) {
        String payload = String.format(
            "{\"username\":\"%s\",\"role\":\"%s\",\"email\":\"%s\",\"exp\":%d}",
            user.getUsername(),
            user.getRole(),
            user.getEmail(),
            System.currentTimeMillis() + 86400000 // 24 hours
        );
        return java.util.Base64.getEncoder().encodeToString(payload.getBytes());
    }
}
