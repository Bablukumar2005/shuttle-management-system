package com.shuttlemanagement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestDTO {

    private Long employeeId;
    private Long routeId;
    private Long driverId;
    private Long vehicleId;
    private LocalDateTime requestedPickupTime;
    private LocalDateTime plannedDropTime;
}
