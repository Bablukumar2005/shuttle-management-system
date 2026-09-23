package com.shuttlemanagement.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverScheduleDTO {

    private Long id;
    private Long driverId;
    private LocalDate scheduleDate;
    private LocalTime dutyStart;
    private LocalTime dutyEnd;
    private List<DriverBreakDTO> breaks;
}
