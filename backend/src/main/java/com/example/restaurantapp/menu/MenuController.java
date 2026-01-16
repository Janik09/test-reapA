package com.example.restaurantapp.menu;

import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {
    private final List<MenuItem> menuItems = List.of(
        new MenuItem(1L, "Beef Tatar", 8.90, MenuCategory.STARTER, "/images/beef-tatar.jpg"),
        new MenuItem(2L, "Frittatensuppe", 4.50, MenuCategory.STARTER, "/images/frittatensuppe.jpg"),
        new MenuItem(3L, "Wiener Schnitzel", 14.90, MenuCategory.MAIN, "/images/schnitzel.jpg"),
        new MenuItem(4L, "Tafelspitz", 17.50, MenuCategory.MAIN, "/images/tafelspitz.jpg"),
        new MenuItem(5L, "Kasnocken", 12.90, MenuCategory.MAIN, "/images/kasnocken.jpg"),
        new MenuItem(6L, "Kaiserschmarrn", 7.90, MenuCategory.DESSERT, "/images/kaiserschmarrn.jpg"),
        new MenuItem(7L, "Apfelstrudel", 6.50, MenuCategory.DESSERT, "/images/apfelstrudel.jpg"),
        new MenuItem(8L, "Almdudler", 3.20, MenuCategory.DRINK, "/images/almdudler.jpg"),
        new MenuItem(9L, "Grüner Veltliner", 4.80, MenuCategory.DRINK, "/images/gruener-veltliner.jpg"),
        new MenuItem(10L, "Gösser Bier", 4.50, MenuCategory.DRINK, "/images/goesser-bier.jpg")
    );

    @GetMapping
    public List<MenuItem> getMenu() {
        return menuItems;
    }
}
