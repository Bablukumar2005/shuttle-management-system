package com.shuttlemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "driver_breaks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverBreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_schedule_id", nullable = false)
    private DriverSchedule driverSchedule;

    private LocalTime breakStart;

    private LocalTime breakEnd;
}
