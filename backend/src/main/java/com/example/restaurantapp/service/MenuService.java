package com.example.restaurantapp.service;

import com.example.restaurantapp.dto.MenuItemDto;
import com.example.restaurantapp.entity.MenuItem;
import com.example.restaurantapp.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {
    private static final Logger logger = LoggerFactory.getLogger(MenuService.class);
    private final MenuItemRepository menuItemRepository;

    public MenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItemDto> getMenu() {
        return menuItemRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public MenuItemDto getMenuItem(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Menüeintrag nicht gefunden"));
        return toDto(item);
    }

    public MenuItem getEntity(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Menüeintrag nicht gefunden"));
    }

    private MenuItemDto toDto(MenuItem item) {
        String normalizedImageUrl = normalizeImageUrl(item.getImageUrl());
        logger.info("Menu image URL normalized. itemId={}, original={}, normalized={}",
                item.getId(), item.getImageUrl(), normalizedImageUrl);
        MenuItemDto dto = new MenuItemDto();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setCategory(item.getCategory());
        dto.setImageUrl(normalizedImageUrl);
        dto.setAvailable(item.isAvailable());
        return dto;
    }
    private String normalizeImageUrl(String rawUrl) {
        if (rawUrl == null) {
            return null;
        }
        String trimmed = rawUrl.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        String normalized = trimmed.replace("\\", "/");
        if (normalized.startsWith("/img/")) {
            return normalized;
        }
        if (normalized.startsWith("img/")) {
            return "/" + normalized;
        }
        if (normalized.startsWith("/")) {
            return "/img/" + normalized.substring(1);
        }
        return "/img/" + normalized;
    }
}
