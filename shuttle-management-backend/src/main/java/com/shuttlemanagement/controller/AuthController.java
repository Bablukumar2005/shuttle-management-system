package com.shuttlemanagement.controller;

import com.shuttlemanagement.dto.LoginRequestDTO;
import com.shuttlemanagement.dto.UserResponseDTO;
import com.shuttlemanagement.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@RequestBody LoginRequestDTO request) {
        UserResponseDTO userResponse = authService.login(request);
        return ResponseEntity.ok(userResponse);
    }
}
