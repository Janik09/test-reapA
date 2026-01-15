package com.example.restaurantapp.service;

import com.example.restaurantapp.dto.TableDto;
import com.example.restaurantapp.entity.RestaurantTable;
import com.example.restaurantapp.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TableService {
    private final RestaurantTableRepository tableRepository;

    public TableService(RestaurantTableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    public List<TableDto> getTables() {
        return tableRepository.findAllByOrderByCapacityAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<RestaurantTable> getAllTables() {
        return tableRepository.findAllByOrderByCapacityAsc();
    }

    private TableDto toDto(RestaurantTable table) {
        TableDto dto = new TableDto();
        dto.setId(table.getId());
        dto.setName(table.getName());
        dto.setCapacity(table.getCapacity());
        return dto;
    }
}
