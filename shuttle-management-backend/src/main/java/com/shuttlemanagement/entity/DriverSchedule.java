package com.shuttlemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "driver_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(nullable = false)
    private LocalDate scheduleDate;

    private LocalTime dutyStart;

    private LocalTime dutyEnd;
}
