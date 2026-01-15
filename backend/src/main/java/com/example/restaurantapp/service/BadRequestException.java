package com.example.restaurantapp.service;

public class BadRequestException extends ServiceException {
    public BadRequestException(String message) {
        super(message);
    }
}
