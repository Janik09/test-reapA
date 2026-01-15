package com.example.restaurantapp.repository;

import com.example.restaurantapp.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByContactIgnoreCaseOrderByDateTimeStartDesc(String contact);

    List<Reservation> findByTableIdAndDateTimeStartLessThan(Long tableId, LocalDateTime end);
}
