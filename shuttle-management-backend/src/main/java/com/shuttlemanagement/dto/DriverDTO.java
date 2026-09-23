package com.shuttlemanagement.dto;

import com.shuttlemanagement.entity.DriverStatus;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverDTO {

    private Long id;
    private String name;
    private String phone;
    private Double rating;
    private DriverStatus status;
    private List<DriverScheduleDTO> schedules;
}
