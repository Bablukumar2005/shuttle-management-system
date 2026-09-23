package com.shuttlemanagement.config;

import com.shuttlemanagement.entity.*;
import com.shuttlemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteRepository routeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Demo Users for Login & Auth (Section 4)
        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            User demoAdmin = User.builder()
                    .name("System Admin")
                    .email("admin@example.com")
                    .password("admin123")
                    .empId("EMP-001")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(demoAdmin);
        }

        if (userRepository.findByEmail("admin@shuttle.com").isEmpty()) {
            User admin = User.builder()
                    .name("Shuttle Admin")
                    .email("admin@shuttle.com")
                    .password("admin123")
                    .empId("EMP-002")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }

        if (userRepository.findByEmail("employee@example.com").isEmpty()) {
            User demoEmployee = User.builder()
                    .name("Thompson")
                    .email("employee@example.com")
                    .password("emp123")
                    .empId("123123")
                    .role(Role.EMPLOYEE)
                    .build();
            userRepository.save(demoEmployee);
        }

        if (userRepository.findByEmail("thompson@campus.edu").isEmpty()) {
            User employee = User.builder()
                    .name("Thompson Campus")
                    .email("thompson@campus.edu")
                    .password("emp123")
                    .empId("123124")
                    .role(Role.EMPLOYEE)
                    .build();
            userRepository.save(employee);
        }

        if (driverRepository.count() == 0) {
            Driver driver = Driver.builder()
                    .name("Steve Smith")
                    .phone("+1-323-493-3293")
                    .rating(4.5)
                    .status(DriverStatus.ONLINE)
                    .build();
            driverRepository.save(driver);
        }

        if (vehicleRepository.count() == 0) {
            Vehicle vehicle = Vehicle.builder()
                    .licensePlate("NB-002-RF")
                    .vehicleCode("UA3282")
                    .model("White Bus")
                    .capacity(12)
                    .build();
            vehicleRepository.save(vehicle);
        }

        if (routeRepository.count() == 0) {
            Route route = Route.builder()
                    .name("Campus Express")
                    .pickupLocation("Library")
                    .dropLocation("Data Centre")
                    .estimatedMinutes(11)
                    .build();
            routeRepository.save(route);
        }
    }
}
