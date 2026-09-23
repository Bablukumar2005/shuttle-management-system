package com.shuttlemanagement.dto;

import com.shuttlemanagement.entity.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String empId;
    private Role role;
}
