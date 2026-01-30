package com.example.restaurantapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(
        scanBasePackages = "com.example.restaurantapp"
)
public class RestaurantAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(RestaurantAppApplication.class, args);
    }
}
