package com.example.restaurantapp.service;

import com.example.restaurantapp.dto.ReservationRequest;
import com.example.restaurantapp.dto.ReservationResponse;
import com.example.restaurantapp.entity.Reservation;
import com.example.restaurantapp.entity.ReservationStatus;
import com.example.restaurantapp.entity.RestaurantTable;
import com.example.restaurantapp.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final TableService tableService;
    private final int maxFutureDays;

    public ReservationService(ReservationRepository reservationRepository,
                              TableService tableService,
                              @Value("${app.reservation.max-future-days:90}") int maxFutureDays) {
        this.reservationRepository = reservationRepository;
        this.tableService = tableService;
        this.maxFutureDays = maxFutureDays;
    }

    public ReservationResponse createReservation(ReservationRequest request) {
        validateRequest(request);
        LocalDateTime start = parseDateTime(request.getDateTimeStart());
        LocalDateTime end = start.plusMinutes(request.getDurationMinutes());

        List<RestaurantTable> candidates = tableService.getAllTables().stream()
                .filter(table -> table.getCapacity() >= request.getPersons())
                .sorted(Comparator.comparingInt(RestaurantTable::getCapacity))
                .collect(Collectors.toList());

        for (RestaurantTable table : candidates) {
            if (isTableAvailable(table, start, end)) {
                Reservation reservation = new Reservation();
                reservation.setCustomerName(request.getCustomerName().trim());
                reservation.setContact(request.getContact().trim());
                reservation.setDateTimeStart(start);
                reservation.setDurationMinutes(request.getDurationMinutes());
                reservation.setPersons(request.getPersons());
                reservation.setTable(table);
                reservation.setStatus(ReservationStatus.CONFIRMED);
                Reservation saved = reservationRepository.save(reservation);
                return toResponse(saved);
            }
        }

        throw new ConflictException("Kein freier Tisch verfügbar. Bitte andere Zeit oder Personenanzahl wählen.");
    }

    public List<ReservationResponse> getReservationsByContact(String contact) {
        if (contact == null || contact.isBlank()) {
            throw new BadRequestException("Kontakt darf nicht leer sein");
        }
        return reservationRepository.findByContactIgnoreCaseOrderByDateTimeStartDesc(contact.trim()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReservationResponse getReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Reservierung nicht gefunden"));
        return toResponse(reservation);
    }

    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .sorted(Comparator.comparing(Reservation::getDateTimeStart)
                        .thenComparing(Reservation::getId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new NotFoundException("Reservierung nicht gefunden");
        }
        reservationRepository.deleteById(id);
    }

    public void deleteAllReservations() {
        reservationRepository.deleteAll();
    }

    private void validateRequest(ReservationRequest request) {
        if (request == null) {
            throw new BadRequestException("Reservierungsdaten fehlen");
        }
        if (request.getCustomerName() == null || request.getCustomerName().isBlank()) {
            throw new BadRequestException("Name ist erforderlich");
        }
        if (request.getContact() == null || request.getContact().isBlank()) {
            throw new BadRequestException("Kontakt ist erforderlich");
        }
        if (request.getPersons() <= 0) {
            throw new BadRequestException("Personenanzahl muss größer als 0 sein");
        }
        if (request.getDurationMinutes() <= 0) {
            throw new BadRequestException("Dauer muss größer als 0 sein");
        }
        LocalDateTime start = parseDateTime(request.getDateTimeStart());
        LocalDateTime now = LocalDateTime.now();
        if (start.isBefore(now)) {
            throw new BadRequestException("Reservierungszeitpunkt darf nicht in der Vergangenheit liegen");
        }
        if (start.isAfter(now.plusDays(maxFutureDays))) {
            throw new BadRequestException("Reservierungen sind nur bis " + maxFutureDays + " Tage im Voraus möglich");
        }
    }

    private LocalDateTime parseDateTime(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("Datum/Zeit ist erforderlich");
        }
        try {
            return LocalDateTime.parse(raw.trim());
        } catch (Exception ex) {
            throw new BadRequestException("Ungültiges Datum/Zeit-Format. Bitte ISO-Format nutzen (z.B. 2024-08-01T18:30)");
        }
    }

    private boolean isTableAvailable(RestaurantTable table, LocalDateTime start, LocalDateTime end) {
        List<Reservation> reservations = reservationRepository.findByTableIdAndDateTimeStartLessThan(table.getId(), end);
        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.CANCELLED) {
                continue;
            }
            LocalDateTime existingStart = reservation.getDateTimeStart();
            LocalDateTime existingEnd = existingStart.plusMinutes(reservation.getDurationMinutes());
            if (existingStart.isBefore(end) && start.isBefore(existingEnd)) {
                return false;
            }
        }
        return true;
    }

    private ReservationResponse toResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setCustomerName(reservation.getCustomerName());
        response.setContact(reservation.getContact());
        response.setDateTimeStart(reservation.getDateTimeStart());
        response.setDurationMinutes(reservation.getDurationMinutes());
        response.setPersons(reservation.getPersons());
        response.setTableId(reservation.getTable().getId());
        response.setTableName(reservation.getTable().getName());
        response.setStatus(reservation.getStatus());
        return response;
    }
}
