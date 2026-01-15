package com.example.restaurantapp.service;

public class NotFoundException extends ServiceException {
    public NotFoundException(String message) {
        super(message);
    }
}
