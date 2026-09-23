package com.shuttlemanagement.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteDTO {

    private Long id;
    private String name;
    private String pickupLocation;
    private String dropLocation;
    private Integer estimatedMinutes;
}
