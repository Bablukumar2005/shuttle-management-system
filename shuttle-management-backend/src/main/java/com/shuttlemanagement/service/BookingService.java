package com.shuttlemanagement.service;

import com.shuttlemanagement.dto.BookingRequestDTO;
import com.shuttlemanagement.dto.BookingResponseDTO;
import com.shuttlemanagement.entity.*;
import com.shuttlemanagement.exception.BadRequestException;
import com.shuttlemanagement.exception.ResourceNotFoundException;
import com.shuttlemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteRepository routeRepository;

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToResponseDTO(booking);
    }

    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        if (request.getEmployeeId() == null) {
            throw new BadRequestException("Employee ID is required for booking");
        }
        if (request.getRouteId() == null) {
            throw new BadRequestException("Route ID is required for booking");
        }

        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + request.getRouteId()));

        String displayId = String.valueOf(100000 + new Random().nextInt(900000));

        Booking booking = Booking.builder()
                .bookingIdDisplay(displayId)
                .employee(employee)
                .route(route)
                .requestedPickupTime(request.getRequestedPickupTime() != null ? request.getRequestedPickupTime() : LocalDateTime.now())
                .plannedDropTime(request.getPlannedDropTime())
                .status(BookingStatus.REQUESTED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(savedBooking);
    }

    public BookingResponseDTO updateBooking(Long id, BookingRequestDTO request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + request.getDriverId()));
            booking.setDriver(driver);
        }

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));
            booking.setVehicle(vehicle);
        }

        if (request.getRouteId() != null) {
            Route route = routeRepository.findById(request.getRouteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + request.getRouteId()));
            booking.setRoute(route);
        }

        if (request.getRequestedPickupTime() != null) {
            booking.setRequestedPickupTime(request.getRequestedPickupTime());
        }

        if (request.getPlannedDropTime() != null) {
            booking.setPlannedDropTime(request.getPlannedDropTime());
        }

        if (booking.getDriver() != null && booking.getVehicle() != null && booking.getStatus() == BookingStatus.REQUESTED) {
            booking.setStatus(BookingStatus.ACCEPTED);
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(updatedBooking);
    }

    public BookingResponseDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(updatedBooking);
    }

    public BookingResponseDTO markNoShow(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot mark no-show for a completed or cancelled booking");
        }

        booking.setStatus(BookingStatus.NO_SHOW);
        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(updatedBooking);
    }

    public BookingResponseDTO signInRider(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.NO_SHOW || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot sign in rider for a cancelled, no-show, or completed booking");
        }

        booking.setActualPickupTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.ON_GOING);
        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(updatedBooking);
    }

    public BookingResponseDTO completeBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.NO_SHOW) {
            throw new BadRequestException("Cannot complete a cancelled or no-show booking");
        }

        if (booking.getStatus() == BookingStatus.REQUESTED) {
            throw new BadRequestException("Cannot complete a booking that has not been accepted or started");
        }

        booking.setActualDropTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.COMPLETED);
        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(updatedBooking);
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .bookingIdDisplay(booking.getBookingIdDisplay())
                .employeeId(booking.getEmployee() != null ? booking.getEmployee().getId() : null)
                .employeeName(booking.getEmployee() != null ? booking.getEmployee().getName() : null)
                .employeeEmpId(booking.getEmployee() != null ? booking.getEmployee().getEmpId() : null)
                .driverId(booking.getDriver() != null ? booking.getDriver().getId() : null)
                .driverName(booking.getDriver() != null ? booking.getDriver().getName() : null)
                .driverPhone(booking.getDriver() != null ? booking.getDriver().getPhone() : null)
                .vehicleId(booking.getVehicle() != null ? booking.getVehicle().getId() : null)
                .vehicleLicensePlate(booking.getVehicle() != null ? booking.getVehicle().getLicensePlate() : null)
                .vehicleModel(booking.getVehicle() != null ? booking.getVehicle().getModel() : null)
                .routeId(booking.getRoute() != null ? booking.getRoute().getId() : null)
                .routeName(booking.getRoute() != null ? booking.getRoute().getName() : null)
                .pickupLocation(booking.getRoute() != null ? booking.getRoute().getPickupLocation() : null)
                .dropLocation(booking.getRoute() != null ? booking.getRoute().getDropLocation() : null)
                .requestedPickupTime(booking.getRequestedPickupTime())
                .actualPickupTime(booking.getActualPickupTime())
                .plannedDropTime(booking.getPlannedDropTime())
                .actualDropTime(booking.getActualDropTime())
                .status(booking.getStatus())
                .build();
    }
}
