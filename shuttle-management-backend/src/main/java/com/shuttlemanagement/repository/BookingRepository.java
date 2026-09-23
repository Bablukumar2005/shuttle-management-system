package com.shuttlemanagement.repository;

import com.shuttlemanagement.entity.Booking;
import com.shuttlemanagement.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByEmployeeId(Long employeeId);

    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(b.employee.name) LIKE LOWER(CONCAT('%', :search, '%')) OR b.bookingIdDisplay LIKE CONCAT('%', :search, '%'))")
    List<Booking> searchBookings(@Param("status") BookingStatus status, @Param("search") String search);
}
