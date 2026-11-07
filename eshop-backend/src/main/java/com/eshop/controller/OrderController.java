package com.eshop.controller;

import com.eshop.model.*;
import com.eshop.repository.OrderRepository;
import com.eshop.repository.ProductRepository;
import com.eshop.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v2/order")
public class OrderController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ShopRepository shopRepository;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        List<Map<String, Object>> cartList = (List<Map<String, Object>>) body.get("cart");
        Map<String, Object> userMap = (Map<String, Object>) body.get("user");
        Map<String, Object> shippingMap = (Map<String, Object>) body.get("shippingAddress");
        Map<String, Object> paymentMap = (Map<String, Object>) body.get("paymentInfo");

        Address shipping = Address.builder()
                .country((String) shippingMap.get("country"))
                .city((String) shippingMap.get("city"))
                .address1((String) shippingMap.get("address1"))
                .address2((String) shippingMap.get("address2"))
                .zipCode(Long.valueOf(shippingMap.get("zipCode").toString()))
                .addressType((String) shippingMap.get("addressType"))
                .build();

        PaymentInfo paymentInfo = PaymentInfo.builder()
                .paymentId((String) paymentMap.get("id"))
                .status((String) paymentMap.get("status"))
                .type((String) paymentMap.get("type"))
                .build();

        Map<Long, List<OrderItem>> shopItemsMap = new HashMap<>();
        for (Map<String, Object> item : cartList) {
            Long shopId = Long.valueOf(item.get("shopId").toString());
            shopItemsMap.computeIfAbsent(shopId, k -> new ArrayList<>()).add(
                    OrderItem.builder()
                            .productId(Long.valueOf(item.get("_id") != null ? item.get("_id").toString() : item.get("productId").toString()))
                            .name((String) item.get("name"))
                            .discountPrice(Double.valueOf(item.get("discountPrice").toString()))
                            .qty(Integer.valueOf(item.get("qty").toString()))
                            .shopId(shopId)
                            .build()
            );
        }

        List<Order> orders = new ArrayList<>();
        for (Map.Entry<Long, List<OrderItem>> entry : shopItemsMap.entrySet()) {
            double shopTotal = entry.getValue().stream().mapToDouble(i -> i.getDiscountPrice() * i.getQty()).sum();
            Order order = Order.builder()
                    .cart(entry.getValue())
                    .shippingAddress(shipping)
                    .userId(Long.valueOf(userMap.get("_id") != null ? userMap.get("_id").toString() : userMap.get("id").toString()))
                    .userName((String) userMap.get("name"))
                    .userEmail((String) userMap.get("email"))
                    .totalPrice(shopTotal)
                    .paymentInfo(paymentInfo)
                    .build();
            orders.add(orderRepository.save(order));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "orders", orders));
    }

    @GetMapping("/get-all-orders/{userId}")
    public ResponseEntity<?> getAllOrdersOfUser(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("success", true, "orders", orderRepository.findByUserIdOrderByCreatedAtDesc(userId)));
    }

    @GetMapping("/get-seller-all-orders/{shopId}")
    public ResponseEntity<?> getAllOrdersOfSeller(@PathVariable Long shopId) {
        return ResponseEntity.ok(Map.of("success", true, "orders", orderRepository.findByShopIdOrderByCreatedAtDesc(shopId)));
    }

    @PutMapping("/update-order-status/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal Shop seller) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Order not found with this id"));

        Order order = orderOpt.get();
        String status = body.get("status");

        if ("Transferred to delivery partner".equals(status)) {
            for (OrderItem item : order.getCart()) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    p.setStock(p.getStock() - item.getQty());
                    p.setSold_out(p.getSold_out() + item.getQty());
                    productRepository.save(p);
                });
            }
        }

        order.setStatus(status);

        if ("Delivered".equals(status)) {
            order.setDeliveredAt(LocalDateTime.now());
            order.getPaymentInfo().setStatus("Succeeded");
            double serviceCharge = order.getTotalPrice() * 0.10;
            seller.setAvailableBalance(seller.getAvailableBalance() + (order.getTotalPrice() - serviceCharge));
            shopRepository.save(seller);
        }

        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("success", true, "order", order));
    }

    @PutMapping("/order-refund/{id}")
    public ResponseEntity<?> requestRefund(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Order not found with this id"));
        Order order = orderOpt.get();
        order.setStatus(body.get("status"));
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("success", true, "order", order, "message", "Order Refund Request successfully!"));
    }

    @PutMapping("/order-refund-success/{id}")
    public ResponseEntity<?> acceptRefund(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Order not found with this id"));
        Order order = orderOpt.get();
        String status = body.get("status");
        order.setStatus(status);

        if ("Refund Success".equals(status)) {
            for (OrderItem item : order.getCart()) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    p.setStock(p.getStock() + item.getQty());
                    p.setSold_out(p.getSold_out() - item.getQty());
                    productRepository.save(p);
                });
            }
        }
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("success", true, "message", "Order Refund successfull!"));
    }

    @GetMapping("/admin-all-orders")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> getAllOrdersAdmin() {
        return ResponseEntity.ok(Map.of("success", true, "orders", orderRepository.findAllByOrderByDeliveredAtDescCreatedAtDesc()));
    }
}
