package com.shuttlemanagement.service;

import com.shuttlemanagement.dto.DriverBreakDTO;
import com.shuttlemanagement.dto.DriverDTO;
import com.shuttlemanagement.dto.DriverScheduleDTO;
import com.shuttlemanagement.entity.*;
import com.shuttlemanagement.exception.BadRequestException;
import com.shuttlemanagement.exception.ResourceNotFoundException;
import com.shuttlemanagement.repository.DriverBreakRepository;
import com.shuttlemanagement.repository.DriverRepository;
import com.shuttlemanagement.repository.DriverScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverService {

    private final DriverRepository driverRepository;
    private final DriverScheduleRepository driverScheduleRepository;
    private final DriverBreakRepository driverBreakRepository;

    @Transactional(readOnly = true)
    public List<DriverDTO> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::mapToDTOWithoutSchedules)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DriverDTO getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

        List<DriverSchedule> schedules = driverScheduleRepository.findByDriverIdAndScheduleDate(id, LocalDate.now());
        if (schedules.isEmpty()) {
            schedules = driverScheduleRepository.findAll().stream()
                    .filter(s -> s.getDriver().getId().equals(id))
                    .collect(Collectors.toList());
        }

        List<DriverScheduleDTO> scheduleDTOs = schedules.stream()
                .map(this::mapScheduleToDTO)
                .collect(Collectors.toList());

        DriverDTO dto = mapToDTOWithoutSchedules(driver);
        dto.setSchedules(scheduleDTOs);
        return dto;
    }

    public DriverDTO createDriver(DriverDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Driver name is required");
        }
        if (dto.getPhone() == null || dto.getPhone().trim().isEmpty()) {
            throw new BadRequestException("Driver phone number is required");
        }

        Driver driver = Driver.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .rating(dto.getRating() != null ? dto.getRating() : 5.0)
                .status(dto.getStatus() != null ? dto.getStatus() : DriverStatus.OFFLINE)
                .build();

        Driver savedDriver = driverRepository.save(driver);
        return mapToDTOWithoutSchedules(savedDriver);
    }

    public DriverDTO updateDriver(Long id, DriverDTO dto) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            driver.setName(dto.getName());
        }
        if (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) {
            driver.setPhone(dto.getPhone());
        }
        if (dto.getRating() != null) {
            driver.setRating(dto.getRating());
        }
        if (dto.getStatus() != null) {
            driver.setStatus(dto.getStatus());
        }

        Driver updatedDriver = driverRepository.save(driver);
        return mapToDTOWithoutSchedules(updatedDriver);
    }

    public DriverScheduleDTO addDriverSchedule(Long driverId, DriverScheduleDTO dto) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));

        if (dto.getDutyStart() == null || dto.getDutyEnd() == null) {
            throw new BadRequestException("Duty start and end times are required");
        }

        if (!dto.getDutyStart().isBefore(dto.getDutyEnd())) {
            throw new BadRequestException("Duty start time must be before duty end time");
        }

        LocalDate date = dto.getScheduleDate() != null ? dto.getScheduleDate() : LocalDate.now();

        DriverSchedule schedule = DriverSchedule.builder()
                .driver(driver)
                .scheduleDate(date)
                .dutyStart(dto.getDutyStart())
                .dutyEnd(dto.getDutyEnd())
                .build();

        DriverSchedule savedSchedule = driverScheduleRepository.save(schedule);
        return mapScheduleToDTO(savedSchedule);
    }

    public DriverBreakDTO addDriverBreak(Long driverId, Long scheduleId, DriverBreakDTO dto) {
        DriverSchedule schedule = driverScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver schedule not found with id: " + scheduleId));

        if (!schedule.getDriver().getId().equals(driverId)) {
            throw new BadRequestException("Schedule id " + scheduleId + " does not belong to driver id " + driverId);
        }

        if (dto.getBreakStart() == null || dto.getBreakEnd() == null) {
            throw new BadRequestException("Break start and end times are required");
        }

        if (!dto.getBreakStart().isBefore(dto.getBreakEnd())) {
            throw new BadRequestException("Break start time must be before break end time");
        }

        DriverBreak driverBreak = DriverBreak.builder()
                .driverSchedule(schedule)
                .breakStart(dto.getBreakStart())
                .breakEnd(dto.getBreakEnd())
                .build();

        DriverBreak savedBreak = driverBreakRepository.save(driverBreak);
        return mapBreakToDTO(savedBreak);
    }

    private DriverDTO mapToDTOWithoutSchedules(Driver driver) {
        return DriverDTO.builder()
                .id(driver.getId())
                .name(driver.getName())
                .phone(driver.getPhone())
                .rating(driver.getRating())
                .status(driver.getStatus())
                .build();
    }

    private DriverScheduleDTO mapScheduleToDTO(DriverSchedule schedule) {
        List<DriverBreakDTO> breaks = driverBreakRepository.findByDriverScheduleId(schedule.getId()).stream()
                .map(this::mapBreakToDTO)
                .collect(Collectors.toList());

        return DriverScheduleDTO.builder()
                .id(schedule.getId())
                .driverId(schedule.getDriver().getId())
                .scheduleDate(schedule.getScheduleDate())
                .dutyStart(schedule.getDutyStart())
                .dutyEnd(schedule.getDutyEnd())
                .breaks(breaks)
                .build();
    }

    private DriverBreakDTO mapBreakToDTO(DriverBreak b) {
        return DriverBreakDTO.builder()
                .id(b.getId())
                .driverScheduleId(b.getDriverSchedule().getId())
                .breakStart(b.getBreakStart())
                .breakEnd(b.getBreakEnd())
                .build();
    }
}
