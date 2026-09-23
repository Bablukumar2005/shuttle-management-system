package com.shuttlemanagement.service;

import com.shuttlemanagement.dto.VehicleDTO;
import com.shuttlemanagement.entity.Vehicle;
import com.shuttlemanagement.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private VehicleDTO mapToDTO(Vehicle v) {
        return VehicleDTO.builder()
                .id(v.getId())
                .licensePlate(v.getLicensePlate())
                .vehicleCode(v.getVehicleCode())
                .model(v.getModel())
                .capacity(v.getCapacity())
                .build();
    }
}
