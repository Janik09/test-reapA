package com.example.restaurantapp.menu;

public class MenuItem {
    private final long id;
    private final String name;
    private final double price;
    private final MenuCategory category;
    private final String imageUrl;

    public MenuItem(long id, String name, double price, MenuCategory category, String imageUrl) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public MenuCategory getCategory() {
        return category;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
