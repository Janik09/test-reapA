package com.example.restaurantapp.auth;

import com.example.restaurantapp.dto.MenuItemDto;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/menu")
public class MenuController {
    @GetMapping
    public List<MenuItemDto> getMenu() {
        MenuItemDto item = new MenuItemDto();
        item.setId(1L);
        item.setName("Wiener Schnitzel");
        item.setPrice(BigDecimal.valueOf(14.9));
        item.setCategory("MAIN");
        item.setImageUrl("/images/schnitzel.jpg");
        return List.of(item);
    }
}
