package com.example.restaurantapp.controller;

import com.example.restaurantapp.dto.MenuItemDto;
import com.example.restaurantapp.service.MenuService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {
    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public List<MenuItemDto> getMenu() {
        return menuService.getMenu();
    }

    @GetMapping("/{id}")
    public MenuItemDto getMenuItem(@PathVariable Long id) {
        return menuService.getMenuItem(id);
    }
}
