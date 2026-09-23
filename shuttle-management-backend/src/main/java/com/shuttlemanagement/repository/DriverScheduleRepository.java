package com.shuttlemanagement.repository;

import com.shuttlemanagement.entity.DriverSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DriverScheduleRepository extends JpaRepository<DriverSchedule, Long> {

    List<DriverSchedule> findByDriverIdAndScheduleDate(Long driverId, LocalDate scheduleDate);

    List<DriverSchedule> findByScheduleDate(LocalDate scheduleDate);
}
