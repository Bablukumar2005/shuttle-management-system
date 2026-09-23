package com.shuttlemanagement.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleDTO {

    private Long id;
    private String licensePlate;
    private String vehicleCode;
    private String model;
    private Integer capacity;
}
