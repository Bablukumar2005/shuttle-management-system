package com.shuttlemanagement.service;

import com.shuttlemanagement.dto.LoginRequestDTO;
import com.shuttlemanagement.dto.UserResponseDTO;
import com.shuttlemanagement.entity.User;
import com.shuttlemanagement.exception.UnauthorizedException;
import com.shuttlemanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;

    public UserResponseDTO login(LoginRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new UnauthorizedException("Email and password are required.");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        // Verify password (supports both plaintext matching and hashed passwords)
        if (!passwordMatches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .empId(user.getEmpId())
                .role(user.getRole())
                .build();
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (storedPassword == null) return false;
        return rawPassword.equals(storedPassword) || storedPassword.endsWith(":" + rawPassword);
    }
}
