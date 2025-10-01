package com.example.codemingle_backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.codemingle_backend.exception.ResourceNotFoundException;
import com.example.codemingle_backend.model.User;
import com.example.codemingle_backend.model.UserDTO;
import com.example.codemingle_backend.repository.UserRepository;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
            user.getUserId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getCreatedAt(),
            user.getProfileViews(),
            user.getRating()
        );
    }

    @GetMapping
    public List<UserDTO> getAllUsers(){
        return userRepository.findAll().stream().map(this::convertToDTO).toList();
    }

    // build create user REST API
    @PostMapping
    public User createUser(@RequestBody User user) {
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }
        if (user.getRole() == null) {
            user.setRole("USER");
        }
        return userRepository.save(user);
    }

    // build get user by id REST API
    @GetMapping("{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable  long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with id:" + id));
        return ResponseEntity.ok(convertToDTO(user));
    }

    // build get user by username REST API
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username){
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with username:" + username));
        return ResponseEntity.ok(convertToDTO(user));
    }

    // build update user REST API
    @PutMapping("{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable long id,@RequestBody User userDetails) {
        User updateUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + id));

        if (userDetails.getUsername() != null) {
            updateUser.setUsername(userDetails.getUsername());
        }
        if (userDetails.getEmail() != null) {
            updateUser.setEmail(userDetails.getEmail());
        }
        if (userDetails.getPassword() != null) {
            updateUser.setPassword(userDetails.getPassword());
        }
        if (userDetails.getRole() != null) {
            updateUser.setRole(userDetails.getRole());
        }
        if (userDetails.getCreatedAt() != null) {
            updateUser.setCreatedAt(userDetails.getCreatedAt());
        }

        userRepository.save(updateUser);

        return ResponseEntity.ok(convertToDTO(updateUser));
    }

    // build increment profile views REST API
    @PutMapping("{id}/increment-views")
    public ResponseEntity<UserDTO> incrementProfileViews(@PathVariable long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + id));

        user.setProfileViews(user.getProfileViews() + 1);
        userRepository.save(user);

        return ResponseEntity.ok(convertToDTO(user));
    }

    // build calculate rating REST API
    @PutMapping("{id}/calculate-rating")
    public ResponseEntity<UserDTO> calculateRating(@PathVariable long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + id));

        // Calculate rating based on user activity
        // For now, base it on number of enrollments and comments
        int enrollmentCount = user.getEnrollments() != null ? user.getEnrollments().size() : 0;
        int commentCount = user.getComments() != null ? user.getComments().size() : 0;

        // Simple rating calculation: base rating + bonus for activity
        double baseRating = 3.0; // Default rating
        double activityBonus = Math.min((enrollmentCount + commentCount) * 0.1, 2.0); // Max 2.0 bonus
        double calculatedRating = Math.min(baseRating + activityBonus, 5.0); // Max 5.0

        user.setRating(calculatedRating);
        userRepository.save(user);

        return ResponseEntity.ok(convertToDTO(user));
    }

    // build delete user REST API
    @DeleteMapping("{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable long id){

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + id));

        userRepository.delete(user);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }
}
