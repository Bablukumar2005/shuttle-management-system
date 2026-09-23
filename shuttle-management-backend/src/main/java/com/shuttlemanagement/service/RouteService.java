package com.shuttlemanagement.service;

import com.shuttlemanagement.dto.RouteDTO;
import com.shuttlemanagement.entity.Route;
import com.shuttlemanagement.exception.BadRequestException;
import com.shuttlemanagement.exception.ResourceNotFoundException;
import com.shuttlemanagement.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RouteService {

    private final RouteRepository routeRepository;

    @Transactional(readOnly = true)
    public List<RouteDTO> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RouteDTO getRouteById(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        return mapToDTO(route);
    }

    public RouteDTO createRoute(RouteDTO dto) {
        validateRoute(dto);
        Route route = Route.builder()
                .name(dto.getName())
                .pickupLocation(dto.getPickupLocation())
                .dropLocation(dto.getDropLocation())
                .estimatedMinutes(dto.getEstimatedMinutes())
                .build();

        Route savedRoute = routeRepository.save(route);
        return mapToDTO(savedRoute);
    }

    public RouteDTO updateRoute(Long id, RouteDTO dto) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));

        validateRoute(dto);

        route.setName(dto.getName());
        route.setPickupLocation(dto.getPickupLocation());
        route.setDropLocation(dto.getDropLocation());
        route.setEstimatedMinutes(dto.getEstimatedMinutes());

        Route updatedRoute = routeRepository.save(route);
        return mapToDTO(updatedRoute);
    }

    private void validateRoute(RouteDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Route name is required");
        }
        if (dto.getPickupLocation() == null || dto.getPickupLocation().trim().isEmpty()) {
            throw new BadRequestException("Pickup location is required");
        }
        if (dto.getDropLocation() == null || dto.getDropLocation().trim().isEmpty()) {
            throw new BadRequestException("Drop location is required");
        }
        if (dto.getEstimatedMinutes() == null || dto.getEstimatedMinutes() <= 0) {
            throw new BadRequestException("Estimated minutes must be a positive integer");
        }
    }

    private RouteDTO mapToDTO(Route route) {
        return RouteDTO.builder()
                .id(route.getId())
                .name(route.getName())
                .pickupLocation(route.getPickupLocation())
                .dropLocation(route.getDropLocation())
                .estimatedMinutes(route.getEstimatedMinutes())
                .build();
    }
}
