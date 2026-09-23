package com.shuttlemanagement.dto;

import com.shuttlemanagement.entity.BookingStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {

    private Long id;
    private String bookingIdDisplay;

    // Employee Info
    private Long employeeId;
    private String employeeName;
    private String employeeEmpId;

    // Driver Info
    private Long driverId;
    private String driverName;
    private String driverPhone;

    // Vehicle Info
    private Long vehicleId;
    private String vehicleLicensePlate;
    private String vehicleModel;

    // Route Info
    private Long routeId;
    private String routeName;
    private String pickupLocation;
    private String dropLocation;

    // Time Milestones
    private LocalDateTime requestedPickupTime;
    private LocalDateTime actualPickupTime;
    private LocalDateTime plannedDropTime;
    private LocalDateTime actualDropTime;

    // Booking Status
    private BookingStatus status;
}
