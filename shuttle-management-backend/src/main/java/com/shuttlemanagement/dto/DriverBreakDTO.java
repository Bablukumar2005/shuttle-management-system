package com.shuttlemanagement.dto;

import lombok.*;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverBreakDTO {

    private Long id;
    private Long driverScheduleId;
    private LocalTime breakStart;
    private LocalTime breakEnd;
}
