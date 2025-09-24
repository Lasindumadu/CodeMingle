@PostMapping("/demo-login")
    public ResponseEntity<?> demoLogin(@RequestBody Map<String, String> request) {
        try {
            String accountType = request.get("accountType");
            if (accountType == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Account type is required"));
            }

            User demoUser;
            if ("admin".equals(accountType)) {
                var userOpt = userRepository.findByUsername("admin");
                if (userOpt.isEmpty()) {
                    return ResponseEntity.status(404).body(Map.of("message", "Demo admin account not found"));
                }
                demoUser = userOpt.get();
            } else if ("user".equals(accountType)) {
                var userOpt = userRepository.findByUsername("demo");
                if (userOpt.isEmpty()) {
                    return ResponseEntity.status(404).body(Map.of("message", "Demo user account not found"));
                }
                demoUser = userOpt.get();
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid account type. Use 'admin' or 'user'"));
            }

            // Generate token using UserDetails
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(demoUser.getUsername())
                    .password(demoUser.getPassword())
                    .roles(demoUser.getRole())
                    .build();
            String token = jwtUtil.generateToken(userDetails);
            System.out.println("Demo login successful for: " + demoUser.getUsername());

            return ResponseEntity.ok(new LoginResponse(token, demoUser.getUsername(), demoUser.getRole(), LocalDateTime.now()));
        } catch (Exception e) {
            System.out.println("Error during demo login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }
