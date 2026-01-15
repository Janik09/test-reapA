package com.example.restaurantapp.service;

public class ConflictException extends ServiceException {
    public ConflictException(String message) {
        super(message);
    }
}
