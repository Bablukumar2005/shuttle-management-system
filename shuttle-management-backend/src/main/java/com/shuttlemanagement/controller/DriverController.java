package com.shuttlemanagement.controller;

import com.shuttlemanagement.dto.DriverBreakDTO;
import com.shuttlemanagement.dto.DriverDTO;
import com.shuttlemanagement.dto.DriverScheduleDTO;
import com.shuttlemanagement.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<List<DriverDTO>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverDTO> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PostMapping
    public ResponseEntity<DriverDTO> createDriver(@RequestBody DriverDTO dto) {
        DriverDTO createdDriver = driverService.createDriver(dto);
        return new ResponseEntity<>(createdDriver, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverDTO> updateDriver(@PathVariable Long id, @RequestBody DriverDTO dto) {
        return ResponseEntity.ok(driverService.updateDriver(id, dto));
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<DriverScheduleDTO> addDriverSchedule(@PathVariable Long id, @RequestBody DriverScheduleDTO dto) {
        DriverScheduleDTO schedule = driverService.addDriverSchedule(id, dto);
        return new ResponseEntity<>(schedule, HttpStatus.CREATED);
    }

    @PostMapping("/{driverId}/schedule/{scheduleId}/breaks")
    public ResponseEntity<DriverBreakDTO> addDriverBreak(
            @PathVariable Long driverId,
            @PathVariable Long scheduleId,
            @RequestBody DriverBreakDTO dto) {
        DriverBreakDTO driverBreak = driverService.addDriverBreak(driverId, scheduleId, dto);
        return new ResponseEntity<>(driverBreak, HttpStatus.CREATED);
    }
}
