package com.example.restaurantapp.service;

import com.example.restaurantapp.dto.OrderItemRequest;
import com.example.restaurantapp.dto.OrderItemResponse;
import com.example.restaurantapp.dto.OrderRequest;
import com.example.restaurantapp.dto.OrderResponse;
import com.example.restaurantapp.entity.MenuItem;
import com.example.restaurantapp.entity.OrderItem;
import com.example.restaurantapp.entity.OrderStatus;
import com.example.restaurantapp.entity.RestaurantOrder;
import com.example.restaurantapp.repository.RestaurantOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final RestaurantOrderRepository orderRepository;
    private final MenuService menuService;

    public OrderService(RestaurantOrderRepository orderRepository, MenuService menuService) {
        this.orderRepository = orderRepository;
        this.menuService = menuService;
    }

    public OrderResponse createOrder(OrderRequest request) {
        validateRequest(request);
        RestaurantOrder order = new RestaurantOrder();
        order.setCustomerName(request.getCustomerName().trim());
        order.setContact(request.getContact().trim());
        order.setReservationId(request.getReservationId());
        order.setStatus(OrderStatus.NEW);
        order.setCreatedAt(LocalDateTime.now());

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuService.getEntity(itemRequest.getMenuItemId());
            if (!menuItem.isAvailable()) {
                throw new BadRequestException("Menüeintrag ist aktuell nicht verfügbar: " + menuItem.getName());
            }
            int quantity = itemRequest.getQuantity();
            if (quantity <= 0) {
                throw new BadRequestException("Menge muss größer als 0 sein");
            }
            BigDecimal lineTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(quantity));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItemId(menuItem.getId());
            orderItem.setNameSnapshot(menuItem.getName());
            orderItem.setUnitPriceSnapshot(menuItem.getPrice());
            orderItem.setQuantity(quantity);
            orderItem.setLineTotal(lineTotal);
            items.add(orderItem);

            total = total.add(lineTotal);
        }

        order.setTotal(total);
        order.setItems(items);
        RestaurantOrder saved = orderRepository.save(order);
        return toResponse(saved);
    }

    public List<OrderResponse> getOrdersByContact(String contact) {
        if (contact == null || contact.isBlank()) {
            throw new BadRequestException("Kontakt darf nicht leer sein");
        }
        return orderRepository.findByContactIgnoreCaseOrderByCreatedAtDesc(contact.trim()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrder(Long id) {
        RestaurantOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bestellung nicht gefunden"));
        return toResponse(order);
    }

    public OrderResponse payOrder(Long id) {
        RestaurantOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bestellung nicht gefunden"));
        order.setStatus(OrderStatus.PAID);
        RestaurantOrder saved = orderRepository.save(order);
        return toResponse(saved);
    }
    public OrderResponse payOrderMock(Long id) {
        RestaurantOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bestellung nicht gefunden"));
        order.setStatus(OrderStatus.PAID_MOCK);
        RestaurantOrder saved = orderRepository.save(order);
        return toResponse(saved);
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new NotFoundException("Bestellung nicht gefunden");
        }
        orderRepository.deleteById(id);
    }

    public void deleteAllOrders() {
        orderRepository.deleteAll();
    }

    private void validateRequest(OrderRequest request) {
        if (request == null) {
            throw new BadRequestException("Bestelldaten fehlen");
        }
        if (request.getCustomerName() == null || request.getCustomerName().isBlank()) {
            throw new BadRequestException("Name ist erforderlich");
        }
        if (request.getContact() == null || request.getContact().isBlank()) {
            throw new BadRequestException("Kontakt ist erforderlich");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Bestellung braucht mindestens ein Item");
        }
        for (OrderItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getMenuItemId() == null) {
                throw new BadRequestException("MenuItemId ist erforderlich");
            }
            if (itemRequest.getQuantity() <= 0) {
                throw new BadRequestException("Menge muss größer als 0 sein");
            }
        }
    }

    private OrderResponse toResponse(RestaurantOrder order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setCustomerName(order.getCustomerName());
        response.setContact(order.getContact());
        response.setReservationId(order.getReservationId());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setTotal(order.getTotal());
        response.setItems(order.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()));
        return response;
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setMenuItemId(item.getMenuItemId());
        response.setNameSnapshot(item.getNameSnapshot());
        response.setUnitPriceSnapshot(item.getUnitPriceSnapshot());
        response.setQuantity(item.getQuantity());
        response.setLineTotal(item.getLineTotal());
        return response;
    }
}
