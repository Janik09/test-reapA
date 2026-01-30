package com.example.restaurantapp.controller;

import com.example.restaurantapp.dto.ReservationRequest;
import com.example.restaurantapp.dto.ReservationResponse;
import com.example.restaurantapp.service.ReservationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ReservationResponse createReservation(@RequestBody ReservationRequest request) {
        return reservationService.createReservation(request);
    }

    @GetMapping
    public List<ReservationResponse> getReservations(@RequestParam("contact") String contact) {
        return reservationService.getReservationsByContact(contact);
    }

    @GetMapping("/{id}")
    public ReservationResponse getReservation(@PathVariable Long id) {
        return reservationService.getReservation(id);
    }

    @GetMapping("/all")
    public List<ReservationResponse> getAllReservations() {
        return reservationService.getAllReservations();
    }
}
