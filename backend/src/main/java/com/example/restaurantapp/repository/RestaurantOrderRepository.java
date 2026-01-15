package com.example.restaurantapp.repository;

import com.example.restaurantapp.entity.RestaurantOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {
    List<RestaurantOrder> findByContactIgnoreCaseOrderByCreatedAtDesc(String contact);
}
