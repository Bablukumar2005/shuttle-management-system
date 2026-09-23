package com.shuttlemanagement.repository;

import com.shuttlemanagement.entity.DriverBreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverBreakRepository extends JpaRepository<DriverBreak, Long> {

    List<DriverBreak> findByDriverScheduleId(Long driverScheduleId);
}
